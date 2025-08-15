import { useState, useEffect, useRef } from 'react'
import { Upload, ArrowLeft, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getAccessToken } from '../lib/ruckusApi'
import { apiFetch } from '../lib/apiClient'
import { loadCredentials } from '../lib/formStorage'
import { saveCredentials, clearCredentials } from '../lib/formStorage'

interface ApGroup {
  id: string
  name: string
  [key: string]: unknown
}

interface ApData {
  name: string
  description: string | null
  serialNumber: string
  model: null
  tags: string[]
  deviceGps?: {
    latitude: string
    longitude: string
  }
}

interface CsvData {
  headers: string[]
  rows: string[][]
}

interface UploadState {
  data: CsvData | null
  loading: boolean
  error?: string
  success?: string
  uploadProgress?: number
}

export function ApiUploader() {
  const [state, setState] = useState<UploadState>({ loading: false, data: null })
  const [credentials, setCredentials] = useState(loadCredentials())
  
  const location = useLocation()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper function to update credentials and save to localStorage
  const updateCredentials = (updates: Partial<typeof credentials>) => {
    const newCredentials = { ...credentials, ...updates }
    setCredentials(newCredentials)
    saveCredentials(newCredentials)
  }

  // Clear form function
  const clearForm = () => {
    clearCredentials()
    setCredentials({
      tenantId: '',
      clientId: '',
      clientSecret: '',
      r1Type: 'regular',
      mspId: '',
      venueId: '',
      region: 'na'
    })
    setState(prev => ({ ...prev, error: undefined, success: undefined }))
  }

  // Get data from navigation state
  useEffect(() => {
    if (location.state?.convertedData) {
      setState(prev => ({ ...prev, data: location.state.convertedData }))
    }
  }, [location.state])

  const handleUpload = async () => {
    if (!state.data) return

    setState(prev => ({ ...prev, loading: true, error: undefined, success: undefined }))
    
    try {
      // Get access token
      setState(prev => ({ ...prev, uploadProgress: 10 }))
      const token = await getAccessToken({
        tenantId: credentials.tenantId,
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret,
        region: credentials.region
      })

      setState(prev => ({ ...prev, uploadProgress: 30 }))

      // Get list of existing AP Groups in the venue
      const region = credentials.region || 'na'
      const apGroupsPath = `/venues/${credentials.venueId}/apGroups`
      const apGroupsResponse = await apiFetch(region, apGroupsPath, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': credentials.tenantId,
          ...(credentials.r1Type === 'msp' && credentials.mspId ? { 'X-MSP-ID': credentials.mspId } : {})
        }
      })

      if (!apGroupsResponse.ok) {
        throw new Error(`Failed to fetch AP Groups: ${apGroupsResponse.status} ${apGroupsResponse.statusText}`)
      }

      const apGroupsData = await apGroupsResponse.json()
      const existingApGroups = new Set(apGroupsData.map((group: ApGroup) => group.id || group.name))

      setState(prev => ({ ...prev, uploadProgress: 40 }))

      // Validate that all specified AP Groups in the CSV exist
      const csvApGroups = new Set(state.data.rows.map(row => row[3]).filter(groupId => groupId && groupId.trim() !== ''))
      const missingApGroups = [...csvApGroups].filter(groupId => !existingApGroups.has(groupId))

      if (missingApGroups.length > 0) {
        throw new Error(`The following AP Groups do not exist in venue ${credentials.venueId}: ${missingApGroups.join(', ')}. Please create these AP Groups first.`)
      }

      setState(prev => ({ ...prev, uploadProgress: 50 }))

      // Convert CSV data to Ruckus One API format
      const apiData = state.data.rows.map(row => {
        const apData: ApData = {
          name: row[0],           // AP Name
          description: row[1] || null,  // Description
          serialNumber: row[2],   // Serial Number
          model: null,            // Model (set to null as per API spec)
          tags: row[4] ? row[4].split(';').filter(tag => tag.trim()) : []  // Tags as array
        }

        // Add GPS coordinates if provided
        if (row[5] && row[6]) {
          apData.deviceGps = {
            latitude: row[5],
            longitude: row[6]
          }
        }

        return apData
      })

      setState(prev => ({ ...prev, uploadProgress: 60 }))

      // Upload each AP individually to the venue
      const results = []
      for (let i = 0; i < apiData.length; i++) {
        const ap = apiData[i]
        const apGroupId = state.data.rows[i][3] // AP Group from CSV (column 4)
        
        // Determine upload path based on whether AP Group is specified
        let apUploadPath: string
        let uploadTarget: string
        
        if (apGroupId && apGroupId.trim() !== '') {
          // Upload to specific AP Group
          apUploadPath = `/venues/${credentials.venueId}/apGroups/${apGroupId}/aps`
          uploadTarget = `AP Group "${apGroupId}"`
        } else {
          // Upload to venue level (no AP Group)
          apUploadPath = `/venues/${credentials.venueId}/aps`
          uploadTarget = `venue level (no AP Group)`
        }
        
        const response = await apiFetch(region, apUploadPath, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Tenant-ID': credentials.tenantId,
            ...(credentials.r1Type === 'msp' && credentials.mspId ? { 'X-MSP-ID': credentials.mspId } : {})
          },
          body: JSON.stringify(ap)
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to upload AP "${ap.name}" to ${uploadTarget}: ${response.status} ${response.statusText} - ${errorText}`)
        }

        results.push(await response.json())
        
        // Update progress
        const progress = 60 + Math.floor((i + 1) / apiData.length * 30)
        setState(prev => ({ ...prev, uploadProgress: progress }))
      }

      setState(prev => ({ 
        ...prev, 
        loading: false, 
        uploadProgress: 100,
        success: `Successfully uploaded ${results.length} AP records to Ruckus One venue ${credentials.venueId}! APs with AP Groups were assigned to their groups, others were uploaded to venue level.`
      }))
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }))
    }
  }

  const goBackToConverter = () => {
    navigate('/csv', { state: { convertedData: state.data } })
  }

  const parseCsv = (csvText: string): CsvData => {
    const lines = csvText.split('\n').filter(line => line.trim() !== '')
    if (lines.length === 0) throw new Error('CSV file is empty')
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const rows = lines.slice(1).map(line => 
      line.split(',').map(cell => cell.trim().replace(/"/g, ''))
    )
    
    return { headers, rows }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setState(prev => ({ ...prev, loading: true, error: undefined, success: undefined }))
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string
        const parsedData = parseCsv(csvText)
        setState(prev => ({ 
          ...prev, 
          data: parsedData, 
          loading: false,
          success: `Successfully loaded CSV with ${parsedData.headers.length} columns and ${parsedData.rows.length} rows`
        }))
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }))
      }
    }
    reader.onerror = () => {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to read file' 
      }))
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">API Upload to Ruckus One</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Upload converted AP data directly to your Ruckus One instance</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Ruckus One Credentials</h2>
          </div>
          
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">R1 Type</label>
                <select 
                  value={credentials.r1Type}
                  onChange={(e) => updateCredentials({ r1Type: e.target.value as 'regular' | 'msp' })}
                  className="form-select"
                >
                  <option value="regular">Regular R1</option>
                  <option value="msp">MSP R1</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Region</label>
                <select 
                  value={credentials.region}
                  onChange={(e) => updateCredentials({ region: e.target.value as 'na' | 'eu' | 'asia' })}
                  className="form-select"
                >
                  <option value="na">North America</option>
                  <option value="eu">Europe</option>
                  <option value="asia">Asia</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="form-label">Tenant ID</label>
              <input
                type="text"
                value={credentials.tenantId}
                onChange={(e) => updateCredentials({ tenantId: e.target.value })}
                className="form-input"
                placeholder="your-tenant-id"
              />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Client ID</label>
                <input
                  type="text"
                  value={credentials.clientId}
                  onChange={(e) => updateCredentials({ clientId: e.target.value })}
                  className="form-input"
                  placeholder="your-client-id"
                />
              </div>
              <div>
                <label className="form-label">Client Secret</label>
                <input
                  type="password"
                  value={credentials.clientSecret}
                  onChange={(e) => updateCredentials({ clientSecret: e.target.value })}
                  className="form-input"
                  placeholder="your-client-secret"
                />
              </div>
            </div>
            
            {credentials.r1Type === 'msp' && (
              <div>
                <label className="form-label">MSP ID</label>
                <input
                  type="text"
                  value={credentials.mspId}
                  onChange={(e) => updateCredentials({ mspId: e.target.value })}
                  className="form-input"
                  placeholder="your-msp-id"
                />
              </div>
            )}
            
            <div>
              <label className="form-label">Venue ID</label>
              <input
                type="text"
                value={credentials.venueId}
                onChange={(e) => updateCredentials({ venueId: e.target.value })}
                className="form-input"
                placeholder="venue-id"
              />
              <p className="text-sm text-gray-500 mt-1">
                The venue ID where APs will be uploaded
              </p>
            </div>
            
            <button type="button" onClick={clearForm} className="btn btn-secondary w-full">
              <AlertCircle className="w-4 h-4" />
              <span>Clear Form</span>
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Upload Data</h2>
          </div>
          
          <div className="space-y-6">
            {state.data ? (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Data Ready for Upload</h4>
                  <div className="text-sm text-gray-600">
                    {state.data.rows.length} AP records ready to upload
                  </div>
                  <div className="text-sm text-gray-600">
                    Headers: {state.data.headers.join(', ')}
                  </div>
                </div>

                {state.uploadProgress !== undefined && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">Upload Progress</span>
                      <span className="text-sm text-blue-700">{state.uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${state.uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleUpload} 
                  disabled={state.loading || !credentials.tenantId || !credentials.clientId || !credentials.clientSecret || !credentials.venueId} 
                  className="btn btn-download w-full"
                >
                  <Upload className={`w-4 h-4 ${state.loading ? 'animate-pulse' : ''}`} />
                  <span>{state.loading ? 'Uploading...' : 'Upload to Ruckus One'}</span>
                </button>

                <button 
                  onClick={goBackToConverter} 
                  className="btn btn-copy w-full"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Converter</span>
                </button>
              </>
            ) : (
              <div className="space-y-6">
                <div className="text-center py-4 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No data available for upload</p>
                  <p className="text-sm mt-2">Upload a CSV file or go to the converter</p>
                </div>
                
                <div>
                  <label className="form-label">Upload Ruckus One Import CSV</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="form-input"
                    disabled={state.loading}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Upload a CSV file in Ruckus One bulk import format
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate('/csv')} 
                    className="btn btn-copy flex-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Go to Converter</span>
                  </button>
                </div>
              </div>
            )}

            {state.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{state.error}</span>
              </div>
            )}

            {state.success && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700">{state.success}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
