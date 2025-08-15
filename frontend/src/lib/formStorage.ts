// Form data storage utility for persisting credentials across pages

export interface FormCredentials {
  tenantId: string
  clientId: string
  clientSecret: string
  r1Type: 'regular' | 'msp'
  mspId?: string
  targetTenantId?: string
  venueId: string
  region: 'na' | 'eu' | 'asia'
}

const STORAGE_KEY = 'r1helper_credentials'

export const saveCredentials = (credentials: FormCredentials) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials))
  } catch (error) {
    console.warn('Failed to save credentials to localStorage:', error)
  }
}

export const loadCredentials = (): FormCredentials => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Ensure all required fields exist with defaults
      return {
        tenantId: parsed.tenantId || '',
        clientId: parsed.clientId || '',
        clientSecret: parsed.clientSecret || '',
        r1Type: parsed.r1Type || 'regular',
        mspId: parsed.mspId || '',
        targetTenantId: parsed.targetTenantId || '',
        venueId: parsed.venueId || '',
        region: parsed.region || 'na'
      }
    }
  } catch (error) {
    console.warn('Failed to load credentials from localStorage:', error)
  }
  
  // Return default values if nothing is stored or error occurs
  return {
    tenantId: '',
    clientId: '',
    clientSecret: '',
    r1Type: 'regular',
    mspId: '',
    targetTenantId: '',
    venueId: '',
    region: 'na'
  }
}

export const clearCredentials = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear credentials from localStorage:', error)
  }
}
