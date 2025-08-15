import { apiFetch } from './apiClient'

type R1Type = 'regular' | 'msp'

export type RuckusRegion = 'na' | 'eu' | 'asia'

export interface RuckusCredentials {
  tenantId: string
  clientId: string
  clientSecret: string
  region?: RuckusRegion
}

export interface MspScope {
  mspId: string
}

const TOKEN_COOKIE_PREFIX = 'r1tk_'

// Default to North America if no region specified
const DEFAULT_REGION: RuckusRegion = 'na'

function cookieKey(creds: RuckusCredentials): string {
  const region = creds.region || DEFAULT_REGION
  return `${TOKEN_COOKIE_PREFIX}${encodeURIComponent(creds.tenantId)}_${encodeURIComponent(creds.clientId)}_${region}`
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}; Path=/; SameSite=Lax`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

async function requestToken(
  path: string,
  body: URLSearchParams,
  headers: Record<string, string>,
  region: RuckusRegion
): Promise<{ access_token: string; expires_in?: number }> {
  const res = await apiFetch(region, path, {
    method: 'POST',
    headers,
    body,
  })
  // Some deployments return the token in a header (login-token) with empty body
  const headerToken = res.headers.get('login-token') || res.headers.get('Login-Token')
  if (res.ok) {
    if (headerToken) {
      return { access_token: headerToken }
    }
    try {
      return await res.json()
    } catch {
      // Try to get response as text for debugging
      const responseText = await res.text()
      console.error('JSON parse error: Response:', responseText.substring(0, 200))
      throw new Error(`${res.status} ${res.statusText} (invalid JSON response)`) 
    }
  }
  
  // Handle error responses
  let detail = ''
  try { 
    const errorResponse = await res.json()
    detail = JSON.stringify(errorResponse)
  } catch {
    // If JSON parsing fails, try to get as text
    try {
      const errorText = await res.text()
      detail = errorText.substring(0, 200) // Limit length for error message
    } catch {
      detail = 'Unable to parse error response'
    }
  }
  
  // Simplify authentication error messages
  if (res.status === 500 && detail.includes('maximum redirect reached')) {
    throw new Error('Authentication failed - please check your credentials')
  }
  
  throw new Error(`${res.status} ${res.statusText}${detail ? ` - ${detail}` : ''}`)
}

export async function getAccessToken(creds: RuckusCredentials): Promise<string> {
  const key = cookieKey(creds)
  const fromCookie = getCookie(key)
  if (fromCookie) {
    return fromCookie
  }

  const region = creds.region || DEFAULT_REGION

  // Use the tenant-scoped endpoint as the single source of truth
  const attempts: Array<() => Promise<{ access_token: string; expires_in?: number }>> = [
    // Preferred: client_id/client_secret in x-www-form-urlencoded body (per Postman flow)
    () => requestToken(
      `/oauth2/token/${encodeURIComponent(creds.tenantId)}`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
      }),
      {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      region
    ),
    // Fallback: Basic auth to the same tenant-scoped path (some deployments allow this)
    () => requestToken(
      `/oauth2/token/${encodeURIComponent(creds.tenantId)}`,
      new URLSearchParams({ grant_type: 'client_credentials' }),
      {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa(`${creds.clientId}:${creds.clientSecret}`),
      },
      region
    ),
    // Alternative: Standard OAuth2 endpoint without tenant in path
    () => requestToken(
      `/oauth2/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
      }),
      {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      region
    ),
  ]

  let lastErr: unknown
  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i]
    try {
      const data = await attempt()
      const token = data.access_token
      const expiresIn = Math.max(60, Number(data.expires_in) || 3600)
      
      setCookie(key, token, expiresIn - 30)
      return token
    } catch (e) {
      lastErr = e
      continue
    }
  }
  // Simplify token request error messages
  if (lastErr instanceof Error) {
    if (lastErr.message.includes('maximum redirect reached')) {
      throw new Error('Authentication failed - please check your credentials')
    }
    if (lastErr.message.includes('500')) {
      throw new Error('Authentication failed - please check your credentials')
    }
    throw new Error(`Authentication failed: ${lastErr.message}`)
  }
  throw new Error('Authentication failed - unknown error')
}

export function buildUrl(_r1Type: R1Type, tenantId: string, resourcePath: string): string {
  // Some resources are tenant-global and exposed at root (e.g., /venues/*, /networks, /mspCustomers)
  if (resourcePath.startsWith('/venues') || resourcePath.startsWith('/networks') || resourcePath.startsWith('/mspCustomers')) {
    return resourcePath
  }
  const tenantPath = `/tenants/${tenantId}`
  // For MSP-specific resources (non-tenant-global), if an MSP context is provided, include it if required by pathing.
  // If the API requires a path segment, adapt here once known. For now, default to tenant path.
  return `${tenantPath}${resourcePath}`
}

export async function apiGet(
  r1Type: R1Type,
  creds: RuckusCredentials,
  resourcePath: string,
  msp?: MspScope,
  targetTenantId?: string
): Promise<unknown> {
  const token = await getAccessToken(creds)
  const path = buildUrl(r1Type, creds.tenantId, resourcePath)
  const region = creds.region || DEFAULT_REGION
  
  // For MSP mode, use target tenant ID in header for customer-specific operations
  const tenantIdForHeader = r1Type === 'msp' && targetTenantId ? targetTenantId : creds.tenantId
  
  const finalHeaders = {
    Authorization: `Bearer ${token}`,
    ...(r1Type === 'msp' && !resourcePath.startsWith('/mspCustomers') ? { 'x-rks-tenantid': tenantIdForHeader } : {}),
    ...(r1Type === 'msp' && msp?.mspId && !resourcePath.startsWith('/mspCustomers') ? { 'X-MSP-ID': msp.mspId } : {}),
    Accept: '*/*',
  }

  const res = await apiFetch(region, path, {
    headers: finalHeaders,
  })
  if (!res.ok) {
    let detail = ''
    try { 
      detail = JSON.stringify(await res.json()) 
    } catch {
      // Ignore JSON parsing errors for error details
    }
    throw new Error(`API request failed: ${res.status} ${res.statusText}${detail ? ` - ${detail}` : ''}`)
  }
  
  const responseData = await res.json()
  return responseData
}

export async function apiPost(
  r1Type: R1Type,
  creds: RuckusCredentials,
  resourcePath: string,
  data: unknown,
  msp?: MspScope,
  targetTenantId?: string
): Promise<unknown> {
  const token = await getAccessToken(creds)
  const path = buildUrl(r1Type, creds.tenantId, resourcePath)
  const region = creds.region || DEFAULT_REGION
  
  // For MSP mode, use target tenant ID in header for customer-specific operations
  const tenantIdForHeader = r1Type === 'msp' && targetTenantId ? targetTenantId : creds.tenantId
  
  const finalHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...(r1Type === 'msp' && !resourcePath.startsWith('/mspCustomers') ? { 'x-rks-tenantid': tenantIdForHeader } : {}),
    ...(r1Type === 'msp' && msp?.mspId && !resourcePath.startsWith('/mspCustomers') ? { 'X-MSP-ID': msp.mspId } : {}),
  }
  
  const res = await apiFetch(region, path, {
    method: 'POST',
    headers: finalHeaders,
    body: JSON.stringify(data)
  })
  
  if (!res.ok) {
    let detail = ''
    try { 
      detail = JSON.stringify(await res.json()) 
    } catch {
      // Ignore JSON parsing errors for error details
    }
    throw new Error(`API request failed: ${res.status} ${res.statusText}${detail ? ` - ${detail}` : ''}`)
  }
  
  const responseData = await res.json()
  return responseData
}

export const RuckusEndpoints = {
  test: (r1Type: R1Type) => (r1Type === 'msp' ? '/organizations' : ''),
  accessPoints: '/access-points',
  wlans: '/wifi-networks',
}


