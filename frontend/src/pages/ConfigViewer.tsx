import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Download, Copy, Wifi, Server, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface ConfigViewerData {
  r1Type: 'regular' | 'msp'
  apiEndpoint: string
  tenantId: string
  clientId: string
  clientSecret: string
  organizationId: string
  siteId: string
}

interface ConfigData {
  accessPoints?: any[]
  wlans?: any[]
  loading: boolean
  error?: string
}

export function ConfigViewer() {
  const [configData, setConfigData] = useState<ConfigData>({ loading: false })
  
  const { register, watch, formState: { errors } } = useForm<ConfigViewerData>({
    defaultValues: {
      r1Type: 'regular',
      apiEndpoint: 'https://api.ruckuswireless.com/v1',
    }
  })

  // const r1Type = watch('r1Type')

  const getAccessToken = async (data: ConfigViewerData): Promise<string> => {
    try {
      const tokenUrl = `${data.apiEndpoint}/oauth/token`
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: data.clientId,
          client_secret: data.clientSecret,
          scope: 'read write'
        })
      })
      
      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status} ${response.statusText}`)
      }
      
      const tokenData = await response.json()
      return tokenData.access_token
    } catch (error) {
      console.error('Error getting access token:', error)
      throw error
    }
  }

  const testConnection = async () => {
    setConfigData({ loading: true })
    
    try {
      const data = watch()
      
      // Get access token
      const accessToken = await getAccessToken(data)
      
      // Test the connection by getting organization info
      const baseUrl = data.apiEndpoint
      const orgId = data.organizationId
      const tenantPath = data.r1Type === 'msp' ? `/tenants/${data.tenantId}` : ''
      
      const apiUrl = `${baseUrl}${tenantPath}/organizations/${orgId}`
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }
      
      setConfigData({ loading: false })
    } catch (error) {
      console.error('Error testing connection:', error)
      setConfigData({ 
        loading: false, 
        error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
    }
  }

  const pullAccessPoints = async (data: ConfigViewerData) => {
    setConfigData({ loading: true })
    
    try {
      // Get access token
      const accessToken = await getAccessToken(data)
      
      // Build the API URL based on R1 type
      const baseUrl = data.apiEndpoint
      const orgId = data.organizationId
      const siteId = data.siteId
      const tenantPath = data.r1Type === 'msp' ? `/tenants/${data.tenantId}` : ''
      
      const apiUrl = `${baseUrl}${tenantPath}/organizations/${orgId}/sites/${siteId}/access-points`
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }
      
      const accessPoints = await response.json()
      
      setConfigData({ 
        loading: false, 
        accessPoints: accessPoints.data || accessPoints,
        wlans: configData.wlans 
      })
    } catch (error) {
      console.error('Error pulling access points:', error)
      setConfigData({ 
        loading: false, 
        error: `Failed to pull access points: ${error instanceof Error ? error.message : 'Unknown error'}`,
        accessPoints: configData.accessPoints,
        wlans: configData.wlans 
      })
    }
  }

  const pullWLANs = async (data: ConfigViewerData) => {
    setConfigData({ loading: true })
    
    try {
      // Get access token
      const accessToken = await getAccessToken(data)
      
      // Build the API URL based on R1 type
      const baseUrl = data.apiEndpoint
      const orgId = data.organizationId
      const siteId = data.siteId
      const tenantPath = data.r1Type === 'msp' ? `/tenants/${data.tenantId}` : ''
      
      const apiUrl = `${baseUrl}${tenantPath}/organizations/${orgId}/sites/${siteId}/wifi-networks`
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }
      
      const wlans = await response.json()
      
      setConfigData({ 
        loading: false, 
        wlans: wlans.data || wlans,
        accessPoints: configData.accessPoints 
      })
    } catch (error) {
      console.error('Error pulling WLANs:', error)
      setConfigData({ 
        loading: false, 
        error: `Failed to pull WLANs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        wlans: configData.wlans,
        accessPoints: configData.accessPoints 
      })
    }
  }

  const copyToClipboard = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
  }

  const downloadConfig = (data: any, type: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ruckus-one-${type}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Config Viewer
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          View and pull configuration data from your Ruckus One instance
        </p>
      </div>

      <div className="grid-2">
        {/* API Configuration */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">API Configuration</h2>
          </div>
          
          <form className="space-y-6">
            <div>
              <label className="form-label">
                R1 Type
              </label>
              <select
                {...register('r1Type', { required: 'R1 type is required' })}
                className="form-select"
              >
                <option value="regular">Regular R1</option>
                <option value="msp">MSP R1</option>
              </select>
            </div>

            <div>
              <label className="form-label">
                API Endpoint
              </label>
              <input
                type="url"
                {...register('apiEndpoint', { required: 'API endpoint is required' })}
                className="form-input"
                placeholder="https://api.ruckuswireless.com/v1"
              />
              {errors.apiEndpoint && (
                <p className="text-red-600 text-sm mt-1">{errors.apiEndpoint.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">
                Tenant ID
              </label>
              <input
                type="text"
                {...register('tenantId', { required: 'Tenant ID is required' })}
                className="form-input"
                placeholder="your-tenant-id"
              />
              {errors.tenantId && (
                <p className="text-red-600 text-sm mt-1">{errors.tenantId.message}</p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  Client ID
                </label>
                <input
                  type="text"
                  {...register('clientId', { required: 'Client ID is required' })}
                  className="form-input"
                  placeholder="your-client-id"
                />
                {errors.clientId && (
                  <p className="text-red-600 text-sm mt-1">{errors.clientId.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">
                  Client Secret
                </label>
                <input
                  type="password"
                  {...register('clientSecret', { required: 'Client Secret is required' })}
                  className="form-input"
                  placeholder="your-client-secret"
                />
                {errors.clientSecret && (
                  <p className="text-red-600 text-sm mt-1">{errors.clientSecret.message}</p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  Organization ID
                </label>
                <input
                  type="text"
                  {...register('organizationId', { required: 'Organization ID is required' })}
                  className="form-input"
                  placeholder="org-123456"
                />
                {errors.organizationId && (
                  <p className="text-red-600 text-sm mt-1">{errors.organizationId.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">
                  Site ID
                </label>
                <input
                  type="text"
                  {...register('siteId', { required: 'Site ID is required' })}
                  className="form-input"
                  placeholder="site-789012"
                />
                {errors.siteId && (
                  <p className="text-red-600 text-sm mt-1">{errors.siteId.message}</p>
                )}
              </div>
            </div>



            <button
              type="button"
              onClick={testConnection}
              disabled={configData.loading}
              className={`btn w-full ${configData.loading ? 'btn-copy' : 'btn-download'}`}
            >
              <Server className="w-4 h-4" />
              <span>
                {configData.loading ? 'Testing...' : 'Test Connection'}
              </span>
            </button>

            {configData.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{configData.error}</span>
              </div>
            )}

            {!configData.loading && !configData.error && configData.accessPoints === undefined && configData.wlans === undefined && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700">Connection successful! You can now pull configuration data.</span>
              </div>
            )}
          </form>
        </div>

        {/* Configuration Actions */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Pull Configuration</h2>
          </div>
          
          <div className="space-y-6">
            {/* Access Points Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Access Points</h3>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => pullAccessPoints(watch())}
                  disabled={configData.loading}
                  className="btn btn-download flex-1"
                >
                  <RefreshCw className={`w-4 h-4 ${configData.loading ? 'animate-spin' : ''}`} />
                  <span>Pull APs</span>
                </button>
                
                {configData.accessPoints && (
                  <>
                    <button
                      onClick={() => copyToClipboard(configData.accessPoints)}
                      className="btn btn-copy"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={() => downloadConfig(configData.accessPoints, 'access-points')}
                      className="btn btn-download"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </>
                )}
              </div>

              {configData.accessPoints && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Access Points ({configData.accessPoints.length})</h4>
                  <div className="space-y-2">
                    {configData.accessPoints.map((ap, index) => (
                      <div key={ap.id || index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div>
                          <div className="font-medium">{ap.name || ap.hostname || ap.id}</div>
                          <div className="text-sm text-gray-600">
                            {ap.model || ap.deviceModel} • {ap.ipAddress || ap.ip || 'N/A'}
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          (ap.status === 'online' || ap.state === 'online') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {ap.status || ap.state || 'unknown'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* WLANs Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">WLANs</h3>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => pullWLANs(watch())}
                  disabled={configData.loading}
                  className="btn btn-download flex-1"
                >
                  <RefreshCw className={`w-4 h-4 ${configData.loading ? 'animate-spin' : ''}`} />
                  <span>Pull WLANs</span>
                </button>
                
                {configData.wlans && (
                  <>
                    <button
                      onClick={() => copyToClipboard(configData.wlans)}
                      className="btn btn-copy"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={() => downloadConfig(configData.wlans, 'wlans')}
                      className="btn btn-download"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </>
                )}
              </div>

              {configData.wlans && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">WLANs ({configData.wlans.length})</h4>
                  <div className="space-y-2">
                    {configData.wlans.map((wlan, index) => (
                      <div key={wlan.id || index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div>
                          <div className="font-medium">{wlan.name || wlan.ssid}</div>
                          <div className="text-sm text-gray-600">
                            {wlan.ssid} • {wlan.security || wlan.securityType || 'N/A'}
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          (wlan.status === 'active' || wlan.enabled === true) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {wlan.status || (wlan.enabled ? 'active' : 'inactive')}
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
