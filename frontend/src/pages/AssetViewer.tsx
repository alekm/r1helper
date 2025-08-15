import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Download, Copy, Wifi, Server, AlertCircle, RefreshCw, FolderOpen } from 'lucide-react'
import { apiGet } from '../lib/ruckusApi'

interface AssetViewerData {
  r1Type: 'regular' | 'msp'
  tenantId: string
  clientId: string
  clientSecret: string
  mspId?: string
  region?: 'na' | 'eu' | 'asia'
  venueId?: string
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

interface AssetDataState {
  accessPoints?: AccessPoint[]
  wlans?: WLAN[]
  apGroups?: APGroup[]
  loading: boolean
  error?: string
}

export function AssetViewer() {
  const [state, setState] = useState<AssetDataState>({ loading: false })

  const { register, watch, formState: { errors } } = useForm<AssetViewerData>({
    defaultValues: {
      r1Type: 'regular',
      region: 'na',
    }
  })

  // Check if all required fields are filled
  const formData = watch()
  const isFormValid = formData.tenantId?.trim() && 
                     formData.clientId?.trim() && 
                     formData.clientSecret?.trim() &&
                     (formData.r1Type !== 'msp' || formData.mspId?.trim())

  // Check if venue ID is filled for AP Groups
  const isVenueValid = formData.venueId?.trim()

  // token retrieval handled via lib/ruckusApi

  const testConnection = async () => {
    setState({ loading: true })
    try {
      const data = watch()
      // Just attempt a token fetch to validate creds; then a lightweight call
      const testPath = ''
      await apiGet(
        data.r1Type,
        { tenantId: data.tenantId, clientId: data.clientId, clientSecret: data.clientSecret, region: data.region },
        testPath,
        data.r1Type === 'msp' && data.mspId ? { mspId: data.mspId } : undefined
      )
      setState({ loading: false })
    } catch (err) {
      setState({ loading: false, error: `Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}` })
    }
  }

  const pullAccessPoints = async () => {
    setState(prev => ({ ...prev, loading: true }))
    try {
      const data = watch()
      const response = await apiGet(
        data.r1Type,
        { tenantId: data.tenantId, clientId: data.clientId, clientSecret: data.clientSecret, region: data.region },
        '/venues/aps',
        data.r1Type === 'msp' && data.mspId ? { mspId: data.mspId } : undefined
      )
      const accessPoints = Array.isArray(response) ? response : (response as { data?: AccessPoint[] }).data || []
      setState(prev => ({ ...prev, loading: false, accessPoints }))
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: `Failed to pull access points: ${err instanceof Error ? err.message : 'Unknown error'}` }))
    }
  }

  const pullWLANs = async () => {
    setState(prev => ({ ...prev, loading: true }))
    try {
      const data = watch()
      const response = await apiGet(
        data.r1Type,
        { tenantId: data.tenantId, clientId: data.clientId, clientSecret: data.clientSecret, region: data.region },
        '/networks',
        data.r1Type === 'msp' && data.mspId ? { mspId: data.mspId } : undefined
      )
      const wifiNetworks = Array.isArray(response) ? response : (response as { data?: WLAN[] }).data || []
      setState(prev => ({ ...prev, loading: false, wlans: wifiNetworks }))
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: `Failed to pull WLANs: ${err instanceof Error ? err.message : 'Unknown error'}` }))
    }
  }

  const pullAPGroups = async () => {
    setState(prev => ({ ...prev, loading: true }))
    try {
      const data = watch()
      if (!data.venueId?.trim()) {
        throw new Error('Venue ID is required to pull AP Groups')
      }
      
      // First, get the list of AP Group IDs
      const groupIdsResponse = await apiGet(
        data.r1Type,
        { tenantId: data.tenantId, clientId: data.clientId, clientSecret: data.clientSecret, region: data.region },
        `/venues/${data.venueId}/apGroups`,
        data.r1Type === 'msp' && data.mspId ? { mspId: data.mspId } : undefined
      )
      
      const groupIds = Array.isArray(groupIdsResponse) ? groupIdsResponse : (groupIdsResponse as { data?: string[] }).data || []
      
      if (groupIds.length === 0) {
        setState(prev => ({ ...prev, loading: false, apGroups: [] }))
        return
      }
      
      // Then, fetch details for each AP Group
      const apGroups: APGroup[] = []
      for (const groupId of groupIds) {
        try {
          const groupResponse = await apiGet(
            data.r1Type,
            { tenantId: data.tenantId, clientId: data.clientId, clientSecret: data.clientSecret, region: data.region },
            `/venues/${data.venueId}/apGroups/${groupId}`,
            data.r1Type === 'msp' && data.mspId ? { mspId: data.mspId } : undefined
          )
          
          const groupData = Array.isArray(groupResponse) ? groupResponse[0] : groupResponse
          if (groupData && typeof groupData === 'object') {
            apGroups.push({
              id: String(groupData.id || groupId),
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
      
      setState(prev => ({ ...prev, loading: false, apGroups }))
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: `Failed to pull AP Groups: ${err instanceof Error ? err.message : 'Unknown error'}` }))
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
            {watch('r1Type') === 'msp' && (
              <div>
                <label className="form-label">MSP ID</label>
                <input type="text" {...register('mspId', { required: 'MSP ID is required for MSP mode' })} className="form-input" placeholder="your-msp-id" />
                {errors.mspId && (<p className="text-red-600 text-sm mt-1">{errors.mspId.message}</p>)}
              </div>
            )}
            <div>
              <label className="form-label">Venue ID (for AP Groups)</label>
              <input type="text" {...register('venueId')} className="form-input" placeholder="venue-id" />
              <p className="text-sm text-gray-600 mt-1">Required to pull AP Groups from a specific venue</p>
            </div>
            <button type="button" onClick={testConnection} disabled={state.loading || !isFormValid} className={`btn w-full ${state.loading ? 'btn-copy' : isFormValid ? 'btn-download' : 'btn-secondary'}`}>
              <Server className="w-4 h-4" />
              <span>{state.loading ? 'Testing...' : 'Test Connection'}</span>
            </button>
            {state.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{state.error}</span>
              </div>
            )}
          </form>
        </div>

        <div className="card">
          <div className="card-header"><h2 className="card-title">Pull Assets</h2></div>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Access Points</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={pullAccessPoints} disabled={state.loading || !isFormValid} className={`btn flex-1 ${state.loading ? 'btn-copy' : isFormValid ? 'btn-download' : 'btn-secondary'}`}>
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
                  <h4 className="font-medium text-gray-900 mb-2">Access Points ({state.accessPoints.length})</h4>
                  <div className="space-y-2">
                    {state.accessPoints.map((ap, index) => (
                      <div key={ap.id || index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div>
                          <div className="font-medium">{String(ap.name || ap.hostname || ap.id || '')}</div>
                          <div className="text-sm text-gray-600">{String(ap.model || ap.deviceModel || '')} • {String(ap.ipAddress || ap.ip || 'N/A')}</div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${(ap.status === 'online' || ap.state === 'online') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {String(ap.status || ap.state || 'unknown')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">WLANs</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={pullWLANs} disabled={state.loading || !isFormValid} className={`btn flex-1 ${state.loading ? 'btn-copy' : isFormValid ? 'btn-download' : 'btn-secondary'}`}>
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
                <button onClick={pullAPGroups} disabled={state.loading || !isFormValid || !isVenueValid} className={`btn flex-1 ${state.loading ? 'btn-copy' : (isFormValid && isVenueValid) ? 'btn-download' : 'btn-secondary'}`}>
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
                          <div className="font-medium">{String(group.name || group.id || '')}</div>
                          {group.description && (
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
                            ID: {String(group.id || '')}
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


