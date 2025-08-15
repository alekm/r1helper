import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Download, Copy, Wifi, Server, AlertCircle, RefreshCw, FolderOpen, Search, ChevronLeft, ChevronRight, Grid, List, CheckCircle, Users } from 'lucide-react'
import { apiGet } from '../lib/ruckusApi'
import { saveCredentials, loadCredentials, clearCredentials } from '../lib/formStorage'
import React from 'react' // Added missing import for React.useEffect

interface AssetViewerData {
  r1Type: 'regular' | 'msp'
  tenantId: string
  clientId: string
  clientSecret: string
  region?: 'na' | 'eu' | 'asia'
  venueId?: string
  targetTenantId?: string
}

interface AccessPoint {
  id: string
  name: string
  serialNumber: string
  type: string
  ipAddress?: string
  status: string
  hostname?: string
  serial?: string
  serial_no?: string
  mac?: string
  macAddress?: string
  model?: string
  deviceModel?: string
  state?: string
  [key: string]: unknown
}

interface WLAN {
  id: string
  name: string
  ssid: string
  security: string
  vlan?: number
  wlan?: {
    ssid: string
    wlanSecurity: string
    enabled: boolean
    vlanId?: number
  }
  securityType?: string
  enabled?: boolean
  vlanId?: number
  [key: string]: unknown
}

interface APGroup {
  id: string
  name: string
  description: string
  isDefault: boolean
  [key: string]: unknown
}

interface Venue {
  id: string
  name: string
  [key: string]: unknown
}

interface MspCustomer {
  name: string
  tenant_id: string
  [key: string]: unknown
}

interface AssetDataState {
  accessPoints?: AccessPoint[]
  wlans?: WLAN[]
  apGroups?: APGroup[]
  venues?: Venue[]
  mspCustomers?: MspCustomer[]
  loading: boolean
  error?: string
  success?: string
}

export function AssetViewer() {
  const [state, setState] = useState<AssetDataState>({ loading: false })
  
  // AP display controls
  const [apSearchTerm, setApSearchTerm] = useState('')
  const [apCurrentPage, setApCurrentPage] = useState(1)
  const [apViewMode, setApViewMode] = useState<'list' | 'grid'>('list')
  const [apItemsPerPage] = useState(20)

  const { register, watch, setValue, formState: { errors } } = useForm<AssetViewerData>({
    defaultValues: {
      ...loadCredentials() // Load saved credentials with defaults
    }
  })

  // Watch form data and save to localStorage when it changes
  const formData = watch()
  
  // Save credentials whenever form data changes
  React.useEffect(() => {
    saveCredentials({
      tenantId: formData.tenantId || '',
      clientId: formData.clientId || '',
      clientSecret: formData.clientSecret || '',
      r1Type: formData.r1Type || 'regular',
      venueId: formData.venueId || '',
      region: formData.region || 'na'
    })
  }, [formData.tenantId, formData.clientId, formData.clientSecret, formData.r1Type, formData.venueId, formData.region])

  // Check if all required fields are filled
  const isFormValid = formData.tenantId?.trim() && 
                     formData.clientId?.trim() && 
                     formData.clientSecret?.trim()

  // Check if venue ID is filled for AP Groups
  const isVenueValid = formData.venueId?.trim()

  // Check if form is valid for AP Groups (requires venue ID)
  const isAPGroupsValid = isFormValid && isVenueValid

  // Check if form is valid for APs and WLANs (venue ID is optional)
  const isAPsAndWLANsValid = isFormValid

  // Check if form is valid for MSP Customers (requires tenant ID for MSP mode)
  const isMspCustomersValid = formData.clientId?.trim() && 
                             formData.clientSecret?.trim() &&
                             formData.r1Type === 'msp' && 
                             formData.tenantId?.trim()



  // Clear form function
  const clearForm = () => {
    clearCredentials()
    setValue('tenantId', '')
    setValue('clientId', '')
    setValue('clientSecret', '')
    setValue('r1Type', 'regular')
    setValue('venueId', '')
    setValue('targetTenantId', '')
    setValue('region', 'na')
    setState(prev => ({ ...prev, error: undefined, success: undefined }))
  }

  // token retrieval handled via lib/ruckusApi

  const testConnection = async () => {
    setState({ loading: true, error: undefined, success: undefined })
    try {
      const data = watch()
      // Just attempt a token fetch to validate creds; then a lightweight call
      const testPath = ''
      await apiGet(
        data.r1Type,
        { tenantId: data.tenantId, clientId: data.clientId, clientSecret: data.clientSecret, region: data.region },
        testPath,
        undefined
      )
      setState({ loading: false, success: 'Connection successful! Your credentials are valid.' })
    } catch (err) {
      setState({ loading: false, error: `Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}` })
    }
  }

  const pullAccessPoints = async () => {
    setState(prev => ({ ...prev, loading: true, error: undefined, success: undefined }))
    try {
      const data = watch()
      
      console.log('APs API path: /venues/aps')
      
      const response = await apiGet(
        data.r1Type,
        { tenantId: data.tenantId, clientId: data.clientId, clientSecret: data.clientSecret, region: data.region },
        '/venues/aps',
        undefined,
        data.r1Type === 'msp' ? data.targetTenantId : undefined
      )
      const accessPoints = Array.isArray(response) ? response : (response as { data?: AccessPoint[] }).data || []
      setState(prev => ({ ...prev, loading: false, accessPoints, success: `Successfully pulled ${accessPoints.length} Access Points` }))
      resetAPDisplay() // Reset display controls when new data is loaded
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: `Failed to pull access points: ${err instanceof Error ? err.message : 'Unknown error'}` }))
    }
  }

  const pullWLANs = async () => {
    setState(prev => ({ ...prev, loading: true, error: undefined, success: undefined }))
    try {
      const data = watch()
      
      console.log('WLANs API path: /networks')
      
      const response = await apiGet(
        data.r1Type,
        { tenantId: data.tenantId, clientId: data.clientId, clientSecret: data.clientSecret, region: data.region },
        '/networks',
        undefined,
        data.r1Type === 'msp' ? data.targetTenantId : undefined
      )
      const wifiNetworks = Array.isArray(response) ? response : (response as { data?: WLAN[] }).data || []
      setState(prev => ({ ...prev, loading: false, wlans: wifiNetworks, success: `Successfully pulled ${wifiNetworks.length} WLANs` }))
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: `Failed to pull WLANs: ${err instanceof Error ? err.message : 'Unknown error'}` }))
    }
  }

  const pullAPGroups = async () => {
    setState(prev => ({ ...prev, loading: true, error: undefined, success: undefined }))
    try {
      const data = watch()
      if (!data.venueId?.trim()) {
        throw new Error('Venue ID is required to pull AP Groups')
      }
      
      // Get the list of AP Group IDs for the specific venue
      const basePath = `/venues/${data.venueId}/apGroups`
      
      console.log('AP Groups base path:', basePath)
      
      // First, get the list of AP Group IDs
      const groupIdsResponse = await apiGet(
        data.r1Type,
        { tenantId: data.tenantId, clientId: data.clientId, clientSecret: data.clientSecret, region: data.region },
        basePath,
        undefined
      )
      
      const groupIds = Array.isArray(groupIdsResponse) ? groupIdsResponse : (groupIdsResponse as { data?: string[] }).data || []
      
      console.log('AP Groups response:', groupIdsResponse)
      console.log('Extracted group IDs:', groupIds)
      
      if (groupIds.length === 0) {
        setState(prev => ({ ...prev, loading: false, apGroups: [], success: 'No AP Groups found for this venue' }))
        return
      }
      
      // Then, fetch details for each AP Group
      const apGroups: APGroup[] = []
      for (const groupId of groupIds) {
        try {
          // Ensure groupId is a string
          const groupIdString = typeof groupId === 'string' ? groupId : 
                               typeof groupId === 'object' && groupId !== null ? String(groupId.id || groupId) : 
                               String(groupId)
          
          // Get AP Group details for the specific venue
          const detailPath = `/venues/${data.venueId}/apGroups/${groupIdString}`
          
          console.log('Fetching AP Group details for ID:', groupIdString, 'Path:', detailPath)
          
          const groupResponse = await apiGet(
            data.r1Type,
            { tenantId: data.tenantId, clientId: data.clientId, clientSecret: data.clientSecret, region: data.region },
            detailPath,
            undefined
          )
          
          const groupData = Array.isArray(groupResponse) ? groupResponse[0] : groupResponse
          if (groupData && typeof groupData === 'object') {
            apGroups.push({
              id: String(groupData.id || groupIdString),
              name: String(groupData.name || ''),
              description: String(groupData.description || ''),
              isDefault: Boolean(groupData.isDefault)
            })
          }
        } catch (groupErr) {
          console.warn(`Failed to fetch details for AP Group ${groupId}:`, groupErr)
          // Continue with other groups even if one fails
        }
      }
      
      setState(prev => ({ ...prev, loading: false, apGroups, success: `Successfully pulled ${apGroups.length} AP Groups` }))
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: `Failed to pull AP Groups: ${err instanceof Error ? err.message : 'Unknown error'}` }))
    }
  }

  const pullVenues = async () => {
    setState(prev => ({ ...prev, loading: true, error: undefined, success: undefined }))
    try {
      const data = watch()
      
      console.log('Venues API path: /venues')
      
      const response = await apiGet(
        data.r1Type,
        { tenantId: data.tenantId, clientId: data.clientId, clientSecret: data.clientSecret, region: data.region },
        '/venues',
        undefined,
        data.r1Type === 'msp' ? data.targetTenantId : undefined
      )
      
      const venues = Array.isArray(response) ? response : (response as { data?: Venue[] }).data || []
      setState(prev => ({ ...prev, loading: false, venues, success: `Successfully pulled ${venues.length} Venues` }))
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: `Failed to pull venues: ${err instanceof Error ? err.message : 'Unknown error'}` }))
    }
  }

  const pullMspCustomers = async () => {
    setState(prev => ({ ...prev, loading: true, error: undefined, success: undefined }))
    try {
      const data = watch()
      
      console.log('MSP Customers API path: /mspCustomers')
      
      const response = await apiGet(
        data.r1Type,
        { tenantId: data.tenantId, clientId: data.clientId, clientSecret: data.clientSecret, region: data.region },
        '/mspCustomers',
        undefined // No MSP scope needed, uses tenant ID from credentials
      )
      
      const mspCustomers = Array.isArray(response) ? response : (response as { data?: MspCustomer[] }).data || []
      setState(prev => ({ ...prev, loading: false, mspCustomers, success: `Successfully pulled ${mspCustomers.length} End Customers` }))
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: `Failed to pull MSP customers: ${err instanceof Error ? err.message : 'Unknown error'}` }))
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

  const downloadApsCsv = (aps: AccessPoint[]) => {
    const headers = [
      'serial number',
      'name',
      'type',
      'ip address',
      'status',
    ]

    const toCsvValue = (value: unknown): string => {
      if (value === undefined || value === null) return ''
      const str = String(value)
      if (str.includes('"')) {
        // escape embedded quotes
        const escaped = str.replace(/"/g, '""')
        return `"${escaped}"`
      }
      return (str.includes(',') || str.includes('\n') || str.includes('\r')) ? `"${str}"` : str
    }

    const rows = aps.map((ap) => {
      const serial = ap.serialNumber || ap.serial || ap.serial_no || ap.mac || ap.macAddress || ''
      const name = ap.name || ap.hostname || ap.id || ''
      const type = ap.model || ap.deviceModel || ap.type || ''
      const ip = ap.ipAddress || ap.ip || ''
      const status = ap.status || ap.state || 'unknown'
      return [serial, name, type, ip, status].map(toCsvValue).join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ruckus-one-access-points-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // AP display helpers
  const filteredAPs = state.accessPoints?.filter(ap => {
    if (!apSearchTerm) return true
    const searchLower = apSearchTerm.toLowerCase()
    const name = String(ap.name || ap.hostname || ap.id || '').toLowerCase()
    const model = String(ap.model || ap.deviceModel || '').toLowerCase()
    const ip = String(ap.ipAddress || ap.ip || '').toLowerCase()
    const status = String(ap.status || ap.state || '').toLowerCase()
    return name.includes(searchLower) || model.includes(searchLower) || ip.includes(searchLower) || status.includes(searchLower)
  }) || []

  const totalPages = Math.ceil(filteredAPs.length / apItemsPerPage)
  const startIndex = (apCurrentPage - 1) * apItemsPerPage
  const endIndex = startIndex + apItemsPerPage
  const currentAPs = filteredAPs.slice(startIndex, endIndex)

  const resetAPDisplay = () => {
    setApSearchTerm('')
    setApCurrentPage(1)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Asset Viewer</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">View and pull assets from your Ruckus One instance</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h2 className="card-title">API Configuration</h2></div>
          <form className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">R1 Type</label>
                <select {...register('r1Type', { required: 'R1 type is required' })} className="form-select">
                  <option value="regular">Regular R1</option>
                  <option value="msp">MSP R1</option>
                </select>
              </div>
              <div>
                <label className="form-label">Region</label>
                <select {...register('region')} className="form-select">
                  <option value="na">North America</option>
                  <option value="eu">Europe</option>
                  <option value="asia">Asia</option>
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">Tenant ID</label>
              <input type="text" {...register('tenantId', { required: 'Tenant ID is required' })} className="form-input" placeholder="your-tenant-id" />
              {errors.tenantId && (<p className="text-red-600 text-sm mt-1">{errors.tenantId.message}</p>)}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Client ID</label>
                <input type="text" {...register('clientId', { required: 'Client ID is required' })} className="form-input" placeholder="your-client-id" />
                {errors.clientId && (<p className="text-red-600 text-sm mt-1">{errors.clientId.message}</p>)}
              </div>
              <div>
                <label className="form-label">Client Secret</label>
                <input type="password" {...register('clientSecret', { required: 'Client Secret is required' })} className="form-input" placeholder="your-client-secret" />
                {errors.clientSecret && (<p className="text-red-600 text-sm mt-1">{errors.clientSecret.message}</p>)}
              </div>
            </div>

                                      <div>
                            <label className="form-label">Venue ID (for AP Groups)</label>
                            <input type="text" {...register('venueId')} className="form-input" placeholder="venue-id" />
                            <p className="text-sm text-gray-600 mt-1">Required for AP Groups only.</p>
                          </div>
                          {watch('r1Type') === 'msp' && (
                            <div>
                              <label className="form-label">Target Tenant ID (for customer operations)</label>
                              <input type="text" {...register('targetTenantId')} className="form-input" placeholder="customer-tenant-id" />
                              <p className="text-sm text-gray-600 mt-1">Fill this by clicking on a customer name below.</p>
                            </div>
                          )}
            <button type="button" onClick={testConnection} disabled={state.loading || !isFormValid} className={`btn w-full ${state.loading ? 'btn-copy' : isFormValid ? 'btn-download' : 'btn-secondary'}`}>
              <Server className="w-4 h-4" />
              <span>{state.loading ? 'Testing...' : 'Test Connection'}</span>
            </button>
            <button type="button" onClick={clearForm} className="btn btn-secondary w-full">
              <AlertCircle className="w-4 h-4" />
              <span>Clear Form</span>
            </button>
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
          </form>
        </div>

        <div className="card">
          <div className="card-header"><h2 className="card-title">Pull Assets</h2></div>
          <div className="space-y-6">
            {/* MSP Customers Section - Only show when MSP mode is selected */}
            {watch('r1Type') === 'msp' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">End Customers</h3>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-md p-3 mb-2">
                  <div className="flex items-center gap-2 text-purple-700">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">MSP Feature:</span>
                    <span className="text-sm">View all End Customers (ECs) managed by this MSP account. Click on any customer name to fill the Tenant ID field for that customer.</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={pullMspCustomers} disabled={state.loading || !isMspCustomersValid} className={`btn flex-1 ${state.loading ? 'btn-copy' : isMspCustomersValid ? 'btn-download' : 'btn-secondary'}`}>
                    <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} />
                    <span>Get End Customers</span>
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
                                setValue('targetTenantId', String(customer.tenant_id || ''));
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
            )}

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
                <button onClick={pullVenues} disabled={state.loading || !isAPsAndWLANsValid} className={`btn flex-1 ${state.loading ? 'btn-copy' : isAPsAndWLANsValid ? 'btn-download' : 'btn-secondary'}`}>
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
                              // Fill the venue-id input field with the venue ID using React Hook Form
                              setValue('venueId', String(venue.id || ''));
                              // Show brief visual feedback
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

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Access Points</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={pullAccessPoints} disabled={state.loading || !isAPsAndWLANsValid} className={`btn flex-1 ${state.loading ? 'btn-copy' : isAPsAndWLANsValid ? 'btn-download' : 'btn-secondary'}`}>
                  <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} />
                  <span>Pull APs</span>
                </button>
                {state.accessPoints && (
                  <>
                    <button onClick={() => copyToClipboard(state.accessPoints)} className="btn btn-copy"><Copy className="w-4 h-4" /><span>Copy</span></button>
                    <button onClick={() => downloadApsCsv(state.accessPoints!)} className="btn btn-download"><Download className="w-4 h-4" /><span>Download CSV</span></button>
                  </>
                )}
              </div>
              {state.accessPoints && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">
                      Access Points ({filteredAPs.length} of {state.accessPoints.length})
                      {apSearchTerm && <span className="text-sm text-gray-500 ml-2">(filtered)</span>}
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setApViewMode('list')}
                        className={`p-1 rounded ${apViewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setApViewMode('grid')}
                        className={`p-1 rounded ${apViewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search APs by name, model, IP, or status..."
                        value={apSearchTerm}
                        onChange={(e) => {
                          setApSearchTerm(e.target.value)
                          setApCurrentPage(1) // Reset to first page when searching
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* AP List/Grid */}
                  {currentAPs.length > 0 ? (
                    <>
                      <div className={apViewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-2'}>
                        {currentAPs.map((ap, index) => (
                          <div key={ap.id || index} className={`flex items-center justify-between p-3 bg-white rounded border ${apViewMode === 'grid' ? 'flex-col items-start space-y-2' : ''}`}>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{String(ap.name || ap.hostname || ap.id || '')}</div>
                              <div className="text-sm text-gray-600 truncate">
                                {String(ap.model || ap.deviceModel || '')} • {String(ap.ipAddress || ap.ip || 'N/A')}
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${(ap.status === 'online' || ap.state === 'online') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {String(ap.status || ap.state || 'unknown')}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                          <div className="text-sm text-gray-600">
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredAPs.length)} of {filteredAPs.length} APs
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setApCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={apCurrentPage === 1}
                              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-600">
                              Page {apCurrentPage} of {totalPages}
                            </span>
                            <button
                              onClick={() => setApCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={apCurrentPage === totalPages}
                              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {apSearchTerm ? 'No APs match your search criteria' : 'No APs found'}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">WLANs</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={pullWLANs} disabled={state.loading || !isAPsAndWLANsValid} className={`btn flex-1 ${state.loading ? 'btn-copy' : isAPsAndWLANsValid ? 'btn-download' : 'btn-secondary'}`}>
                  <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} />
                  <span>Pull WLANs</span>
                </button>
                {state.wlans && (
                  <>
                    <button onClick={() => copyToClipboard(state.wlans)} className="btn btn-copy"><Copy className="w-4 h-4" /><span>Copy</span></button>
                    <button onClick={() => downloadJson(state.wlans, 'wlans')} className="btn btn-download"><Download className="w-4 h-4" /><span>Download</span></button>
                  </>
                )}
              </div>
              {state.wlans && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">WLANs ({state.wlans.length})</h4>
                  <div className="space-y-2">
                    {state.wlans.map((w, index) => {
                      const name = w.name || w.wlan?.ssid || w.ssid
                      const ssid = w.wlan?.ssid || w.ssid
                      const security = w.wlan?.wlanSecurity || w.security || w.securityType || 'N/A'
                      const enabled = (w.wlan?.enabled ?? w.enabled) === true
                      const vlanId = w.wlan?.vlanId ?? w.vlanId
                      const type = w.type
                      return (
                        <div key={w.id || index} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div>
                            <div className="font-medium">{name}</div>
                            <div className="text-sm text-gray-600">
                              {ssid ? `SSID: ${ssid}` : null}
                              {ssid ? ' • ' : ''}
                              Security: {security}
                              {vlanId ? ` • VLAN: ${vlanId}` : ''}
                              {type ? ` • Type: ${type}` : ''}
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${enabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {enabled ? 'enabled' : 'disabled'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FolderOpen className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">AP Groups</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={pullAPGroups} disabled={state.loading || !isAPGroupsValid} className={`btn flex-1 ${state.loading ? 'btn-copy' : isAPGroupsValid ? 'btn-download' : 'btn-secondary'}`}>
                  <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} />
                  <span>Get AP Groups</span>
                </button>
                {state.apGroups && (
                  <>
                    <button onClick={() => copyToClipboard(state.apGroups)} className="btn btn-copy"><Copy className="w-4 h-4" /><span>Copy</span></button>
                    <button onClick={() => downloadJson(state.apGroups, 'ap-groups')} className="btn btn-download"><Download className="w-4 h-4" /><span>Download</span></button>
                  </>
                )}
              </div>
              {state.apGroups && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">AP Groups ({state.apGroups.length})</h4>
                  <div className="space-y-2">
                    {state.apGroups.map((group, index) => (
                      <div key={group.id || index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div>
                          <div className="font-medium">
                            {group.name && group.name.trim() ? String(group.name) : `AP Group ${String(group.id || '').substring(0, 8)}...`}
                          </div>
                          {group.description && group.description.trim() && (
                            <div className="text-sm text-gray-600">{String(group.description)}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {group.isDefault && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Default
                            </span>
                          )}
                          <div className="text-xs text-gray-500">
                            ID: {String(group.id || '').substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


