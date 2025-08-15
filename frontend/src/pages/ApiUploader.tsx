import { useState, useEffect, useRef } from 'react'
import { Upload, ArrowLeft, CheckCircle, AlertCircle, FileText, Server, RefreshCw, Copy, Download } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiGet, apiPost } from '../lib/ruckusApi'
import { loadCredentials } from '../lib/formStorage'
import { saveCredentials, clearCredentials } from '../lib/formStorage'



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

interface MspCustomer {
  name: string
  tenant_id: string
}

interface Venue {
  id: string
  name: string
}

interface UploadState {
  data: CsvData | null
  loading: boolean
  error?: string
  success?: string
  uploadProgress?: number
  mspCustomers?: MspCustomer[]
  venues?: Venue[]
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
      targetTenantId: '',
      venueId: '',
      region: 'na'
    })
    setState(prev => ({ ...prev, error: undefined, success: undefined, mspCustomers: undefined, venues: undefined }))
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
      setState(prev => ({ ...prev, uploadProgress: 10 }))

      // Get list of existing AP Groups in the venue using apiGet
      const apGroupsResponse = await apiGet(
        credentials.r1Type,
        { tenantId: credentials.tenantId, clientId: credentials.clientId, clientSecret: credentials.clientSecret, region: credentials.region },
        `/venues/${credentials.venueId}/apGroups`,
        undefined,
        credentials.r1Type === 'msp' ? credentials.targetTenantId : undefined
      )

      setState(prev => ({ ...prev, uploadProgress: 30 }))
      
      // Extract group names and IDs from the response
      const existingApGroups = new Set<string>()
      const groupIdToNameMap = new Map<string, string>()
      
      if (Array.isArray(apGroupsResponse)) {
        for (const group of apGroupsResponse) {
          const groupId = String(group.id || '')
          const groupName = String(group.name || '')
          
          if (groupId && groupName && groupName.trim() !== '') {
            existingApGroups.add(groupName.trim())
            groupIdToNameMap.set(groupName.trim(), groupId)
          } else if (groupId && group.isDefault) {
            // Handle default group (usually doesn't have a name)
            const defaultGroupName = 'Default'
            existingApGroups.add(defaultGroupName)
            groupIdToNameMap.set(defaultGroupName, groupId)
          }
        }
      }

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
        
        if (apGroupId && apGroupId.trim() !== '') {
          // Look up the group ID from the name
          const actualGroupId = groupIdToNameMap.get(apGroupId.trim())
          if (!actualGroupId) {
            throw new Error(`AP Group "${apGroupId}" not found in venue ${credentials.venueId}`)
          }
          
          // Upload to specific AP Group using the actual group ID
          apUploadPath = `/venues/${credentials.venueId}/apGroups/${actualGroupId}/aps`
        } else {
          // Upload to venue level (no AP Group)
          apUploadPath = `/venues/${credentials.venueId}/aps`
        }
        
        // Use apiPost for the upload
        const response = await apiPost(
          credentials.r1Type,
          { tenantId: credentials.tenantId, clientId: credentials.clientId, clientSecret: credentials.clientSecret, region: credentials.region },
          apUploadPath,
          ap,
          undefined,
          credentials.r1Type === 'msp' ? credentials.targetTenantId : undefined
        )

        results.push(response)
        
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

  const pullMspCustomers = async () => {
    setState(prev => ({ ...prev, loading: true, error: undefined, success: undefined }))
    try {
      const response = await apiGet(
        credentials.r1Type,
        { tenantId: credentials.tenantId, clientId: credentials.clientId, clientSecret: credentials.clientSecret, region: credentials.region },
        '/mspCustomers',
        undefined
      )
      
      const mspCustomers = Array.isArray(response) ? response : (response as { data?: MspCustomer[] }).data || []
      setState(prev => ({ ...prev, loading: false, mspCustomers, success: `Successfully pulled ${mspCustomers.length} End Customers` }))
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: `Failed to pull MSP customers: ${err instanceof Error ? err.message : 'Unknown error'}` }))
    }
  }

  const pullVenues = async () => {
    setState(prev => ({ ...prev, loading: true, error: undefined, success: undefined }))
    try {
      const response = await apiGet(
        credentials.r1Type,
        { tenantId: credentials.tenantId, clientId: credentials.clientId, clientSecret: credentials.clientSecret, region: credentials.region },
        '/venues',
        undefined,
        credentials.r1Type === 'msp' ? credentials.targetTenantId : undefined
      )
      
      const venues = Array.isArray(response) ? response : (response as { data?: Venue[] }).data || []
      setState(prev => ({ ...prev, loading: false, venues, success: `Successfully pulled ${venues.length} Venues` }))
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: `Failed to pull venues: ${err instanceof Error ? err.message : 'Unknown error'}` }))
    }
  }

  const copyToClipboard = (data: unknown) => navigator.clipboard.writeText(JSON.stringify(data, null, 2))

  const downloadJson = (data: unknown, name: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ruckus-one-${name}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Validation functions
  const isVenuesValid = credentials.tenantId && credentials.clientId && credentials.clientSecret

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
              <>
                <div>
                  <label className="form-label">Target Tenant ID</label>
                  <input
                    type="text"
                    value={credentials.targetTenantId}
                    onChange={(e) => updateCredentials({ targetTenantId: e.target.value })}
                    className="form-input"
                    placeholder="target-tenant-id"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    The tenant ID of the customer where APs will be uploaded (click on an End Customer below to fill this)
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">End Customers</h3>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={pullMspCustomers} disabled={state.loading || !credentials.tenantId || !credentials.clientId || !credentials.clientSecret} className={`btn flex-1 ${state.loading ? 'btn-copy' : 'btn-download'}`}>
                      <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} />
                      <span>Get ECs</span>
                    </button>
                    {state.mspCustomers && (
                      <>
                        <button onClick={() => copyToClipboard(state.mspCustomers)} className="btn btn-copy"><Copy className="w-4 h-4" /><span>Copy</span></button>
                        <button onClick={() => downloadJson(state.mspCustomers, 'msp-customers')} className="btn btn-download"><Download className="w-4 h-4" /><span>Download</span></button>
                      </>
                    )}
                  </div>
                  {state.mspCustomers && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">End Customers ({state.mspCustomers.length})</h4>
                      <div className="space-y-2">
                        {state.mspCustomers.map((customer, index) => (
                          <div key={customer.tenant_id || index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div>
                              <div 
                                className="font-medium cursor-pointer hover:text-blue-600 hover:underline transition-colors text-blue-700"
                                onClick={() => {
                                  updateCredentials({ targetTenantId: String(customer.tenant_id || '') });
                                  const element = event?.target as HTMLElement;
                                  if (element) {
                                    const originalText = element.textContent;
                                    element.textContent = 'Selected!';
                                    element.classList.add('text-green-600');
                                    setTimeout(() => {
                                      element.textContent = originalText;
                                      element.classList.remove('text-green-600');
                                    }, 1000);
                                  }
                                }}
                                title="Click to select this customer's tenant ID"
                              >
                                {String(customer.name || '')}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {String(customer.tenant_id || '').substring(0, 8)}...
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Venues</h3>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-2">
                    <div className="flex items-center gap-2 text-blue-700">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Tip:</span>
                      <span className="text-sm">Click on any venue name below to automatically fill the Venue ID field above.</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={pullVenues} disabled={state.loading || !isVenuesValid} className={`btn flex-1 ${state.loading ? 'btn-copy' : isVenuesValid ? 'btn-download' : 'btn-secondary'}`}>
                      <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} />
                      <span>Get Venues</span>
                    </button>
                    {state.venues && (
                      <>
                        <button onClick={() => copyToClipboard(state.venues)} className="btn btn-copy"><Copy className="w-4 h-4" /><span>Copy</span></button>
                        <button onClick={() => downloadJson(state.venues, 'venues')} className="btn btn-download"><Download className="w-4 h-4" /><span>Download</span></button>
                      </>
                    )}
                  </div>
                  {state.venues && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Venues ({state.venues.length})</h4>
                      <div className="space-y-2">
                        {state.venues.map((venue, index) => (
                          <div key={venue.id || index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div>
                              <div 
                                className="font-medium cursor-pointer hover:text-blue-600 hover:underline transition-colors text-blue-700"
                                onClick={() => {
                                  updateCredentials({ venueId: String(venue.id || '') });
                                  const element = event?.target as HTMLElement;
                                  if (element) {
                                    const originalText = element.textContent;
                                    element.textContent = 'Selected!';
                                    element.classList.add('text-green-600');
                                    setTimeout(() => {
                                      element.textContent = originalText;
                                      element.classList.remove('text-green-600');
                                    }, 1000);
                                  }
                                }}
                                title="Click to select this venue ID"
                              >
                                {String(venue.name || '')}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {String(venue.id || '').substring(0, 8)}...
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
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
