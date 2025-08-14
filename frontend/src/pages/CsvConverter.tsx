import { useState, useRef } from 'react'
import { Download, FileText, RefreshCw, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface CsvData {
  headers: string[]
  rows: string[][]
}

interface ConversionState {
  originalData: CsvData | null
  convertedData: CsvData | null
  loading: boolean
  error?: string
  success?: string
}

interface ConversionSettings {
  apGroup: string
  latitude: string
  longitude: string
}

export function CsvConverter() {
  const [state, setState] = useState<ConversionState>({ loading: false, originalData: null, convertedData: null })
  const [settings, setSettings] = useState<ConversionSettings>({
    apGroup: '',
    latitude: '',
    longitude: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

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
          originalData: parsedData, 
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

  const convertCsv = () => {
    if (!state.originalData) return

    setState(prev => ({ ...prev, loading: true, error: undefined }))
    
    try {
      // Validate latitude and longitude if provided
      const latitude = parseFloat(settings.latitude)
      const longitude = parseFloat(settings.longitude)
      
      if (settings.latitude && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Latitude must be between -90 and 90 degrees.'
        }))
        return
      }
      
      if (settings.longitude && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Longitude must be between -180 and 180 degrees.'
        }))
        return
      }
      
      // Check decimal digits for latitude and longitude
      if (settings.latitude && settings.latitude.includes('.')) {
        const decimalDigits = settings.latitude.split('.')[1]
        if (decimalDigits.length > 6) {
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: 'Latitude can contain a maximum of 6 total digits.'
          }))
          return
        }
      }
      
      if (settings.longitude && settings.longitude.includes('.')) {
        const decimalDigits = settings.longitude.split('.')[1]
        if (decimalDigits.length > 6) {
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: 'Longitude can contain a maximum of 6 total digits.'
          }))
          return
        }
      }

      // Check if Serial column exists
      const serialColumnIndex = state.originalData.headers.findIndex(header => 
        header.toLowerCase().includes('serial')
      )
      
      if (serialColumnIndex === -1) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Serial column not found in CSV. Please enable the "Serial" column in SmartZone before exporting the CSV file.'
        }))
        return
      }

      // Check for duplicate AP names and serial numbers
      const apNames = new Set<string>()
      const serialNumbers = new Set<string>()
      const duplicateApNames: string[] = []
      const duplicateSerials: string[] = []

      state.originalData.rows.forEach((row) => {
        const apName = row[1] || '' // "AP Name"
        const serialNumber = row[serialColumnIndex] || '' // "Serial"
        
        if (apName && apNames.has(apName)) {
          duplicateApNames.push(apName)
        } else if (apName) {
          apNames.add(apName)
        }
        
        if (serialNumber && serialNumbers.has(serialNumber)) {
          duplicateSerials.push(serialNumber)
        } else if (serialNumber) {
          serialNumbers.add(serialNumber)
        }
      })

      // Validate AP names, descriptions, and serial numbers
      const validationErrors: string[] = []
      
      state.originalData.rows.forEach((row, index) => {
        const apName = row[1] || '' // "AP Name"
        const description = row[2] || '' // "Description"
        const serialNumber = row[serialColumnIndex] || '' // "Serial"
        
        // Validate AP name
        if (!apName) {
          validationErrors.push(`Row ${index + 1}: AP name is mandatory`)
        } else if (apName.length < 2 || apName.length > 32) {
          validationErrors.push(`Row ${index + 1}: AP name must be between 2 and 32 characters`)
        } else {
          // Check for invalid characters in AP name
          const invalidChars = /[^a-zA-Z0-9 !"#$%'()*+,\-./:;<=>?@[\]^_{|}~]/g
          const matches = apName.match(invalidChars)
          if (matches) {
            validationErrors.push(`Row ${index + 1}: AP name contains invalid characters: ${[...new Set(matches)].join(', ')}`)
          }
        }
        
        // Validate description length
        if (description && description.length > 180) {
          validationErrors.push(`Row ${index + 1}: Description exceeds maximum length of 180 characters`)
        }
        
        // Validate serial number
        if (!serialNumber) {
          validationErrors.push(`Row ${index + 1}: Serial number is mandatory`)
        }
      })
      
      if (duplicateApNames.length > 0 || duplicateSerials.length > 0) {
        if (duplicateApNames.length > 0) {
          validationErrors.push(`Duplicate AP names: ${[...new Set(duplicateApNames)].join(', ')}`)
        }
        if (duplicateSerials.length > 0) {
          validationErrors.push(`Duplicate serial numbers: ${[...new Set(duplicateSerials)].join(', ')}`)
        }
      }
      
      if (validationErrors.length > 0) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Validation errors found:\n' + validationErrors.map(err => `• ${err}`).join('\n')
        }))
        return
      }

      // Convert Ruckus One AP export format to bulk import format
      // const commentRows = [
      //   ['# AP name is mandatory. The name can only contain between 2 and 32 characters. Only the following characters are allowed: \'a-z\', \'A-Z\', \'0-9\', space and other special characters (!""#$%\'()*+,-./:;<=>?@[]^_{|}~) except &,` or $('],
      //   ['# Description - maximal length is 180 characters'],
      //   ['# Serial number is mandatory'],
      //   ['# AP Group - must match an existing AP group'],
      //   ['# Tags - separated by semicolon \';\''],
      //   ['# Latitude - between -90 and 90, and contains a maximum of 6-digit decimal'],
      //   ['# Longitude - between -180 and 180, and contains a maximum of 6-digit decimal'],
      //   [], // Empty row
      // ]

      const newHeaders = ['AP Name', 'Description', 'Serial Number', 'AP Group', 'Tags', 'Latitude', 'Longitude']
      
      const newRows = state.originalData.rows.map(row => {
        const apName = row[1] || '' // "AP Name"
        const description = row[2] || '' // "Description"
        const serialNumber = row[serialColumnIndex] || '' // "Serial"
        
        return [
          apName,        // AP Name
          description,   // Description (only if it exists in input)
          serialNumber,  // Serial Number
          settings.apGroup, // AP Group
          '',           // Tags (left blank)
          settings.latitude, // Latitude
          settings.longitude, // Longitude
        ]
      })
      
      setState(prev => ({ 
        ...prev, 
        convertedData: { headers: newHeaders, rows: newRows },
        loading: false,
        success: `CSV converted successfully! Converted ${newRows.length} AP records.`
      }))
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: `Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }))
    }
  }

  const downloadCsv = (data: CsvData, filename: string) => {
    // Add comment rows for bulk import format
    const commentRows = [
      ['# AP name is mandatory. The name can only contain between 2 and 32 characters. Only the following characters are allowed: \'a-z\', \'A-Z\', \'0-9\', space and other special characters (!""#$%\'()*+,-./:;<=>?@[]^_{|}~) except &,` or $('],
      ['# Description - maximal length is 180 characters'],
      ['# Serial number is mandatory'],
      ['# AP Group - must match an existing AP group'],
      ['# Tags - separated by semicolon \';\''],
      ['# Latitude - between -90 and 90, and contains a maximum of 6-digit decimal'],
      ['# Longitude - between -180 and 180, and contains a maximum of 6-digit decimal'],
      [], // Empty row
    ]
    
    const csvContent = [
      ...commentRows.map(row => row.join(',')),
      data.headers.join(','),
      ...data.rows.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetConverter = () => {
    setState(prev => ({ ...prev, loading: false }))
    setSettings({
      apGroup: '',
      latitude: '',
      longitude: ''
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const goToApiUploader = () => {
    if (state.convertedData) {
      navigate('/upload', { state: { convertedData: state.convertedData } })
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">SZ to R1 AP Converter</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Convert AP exports from SmartZone to Ruckus One bulk import format</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Import SmartZone CSV</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="form-label">Select SmartZone AP Export CSV</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="form-input"
                disabled={state.loading}
              />
              <p className="text-sm text-gray-500 mt-1">
                Make sure to enable the "Serial" column in SmartZone before exporting
              </p>
            </div>

            {state.originalData && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">File Loaded Successfully</h4>
                <div className="text-sm text-gray-600 mb-4">
                  Found {state.originalData.rows.length} AP records
                </div>
                
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900">Conversion Settings</h5>
                  
                  <div>
                    <label className="form-label">AP Group</label>
                    <input
                      type="text"
                      value={settings.apGroup}
                      onChange={(e) => setSettings(prev => ({ ...prev, apGroup: e.target.value }))}
                      className="form-input"
                      placeholder="Enter AP group name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={settings.latitude}
                        onChange={(e) => setSettings(prev => ({ ...prev, latitude: e.target.value }))}
                        className="form-input"
                        placeholder="e.g., 33.7490"
                      />
                    </div>
                    <div>
                      <label className="form-label">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={settings.longitude}
                        onChange={(e) => setSettings(prev => ({ ...prev, longitude: e.target.value }))}
                        className="form-input"
                        placeholder="e.g., -84.3880"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {state.originalData && (
              <button 
                onClick={convertCsv} 
                disabled={state.loading} 
                className="btn btn-download w-full"
              >
                <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} />
                <span>{state.loading ? 'Converting...' : 'Convert CSV'}</span>
              </button>
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

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Ruckus One Import Data</h2>
          </div>
          
          <div className="space-y-6">
            {state.convertedData ? (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Ruckus One Import Preview</h4>
                  <div className="text-sm text-gray-600 mb-2">
                    Headers: {state.convertedData.headers.join(', ')}
                  </div>
                  <div className="text-sm text-gray-600">
                    Rows: {state.convertedData.rows.length}
                  </div>
                  <div className="mt-2 max-h-32 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          {state.convertedData.headers.map((header, i) => (
                            <th key={i} className="text-left p-1 bg-gray-100">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {state.convertedData.rows.slice(0, 3).map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j} className="p-1 border-t">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {state.convertedData.rows.length > 3 && (
                      <div className="text-xs text-gray-500 mt-1">
                        ... and {state.convertedData.rows.length - 3} more rows
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => downloadCsv(state.convertedData!, `ruckus-one-import-${Date.now()}.csv`)} 
                    className="btn btn-download flex-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Ruckus One Import CSV</span>
                  </button>
                  <button 
                    onClick={goToApiUploader} 
                    className="btn btn-download"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Upload via API</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Ruckus One import data will appear here after processing</p>
              </div>
            )}

            <button 
              onClick={resetConverter} 
              className="btn btn-copy w-full"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Converter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
