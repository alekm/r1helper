import type { RuckusRegion } from './ruckusApi';

// Determine if we're in development or production
const isDevelopment = import.meta.env.DEV;

// Base URL for API calls
function getApiBaseUrl(region: RuckusRegion): string {
  if (isDevelopment) {
    // Use Vite proxy in development
    const proxyPaths = {
      na: '/r1',
      eu: '/r1-eu',
      asia: '/r1-asia'
    };
    return proxyPaths[region];
  } else {
    // Use Netlify functions in production
    return '/api';
  }
}

// Build the full API URL
export function buildApiUrl(region: RuckusRegion, path: string): string {
  const baseUrl = getApiBaseUrl(region);
  
  if (isDevelopment) {
    // In development, just append the path to the proxy base
    return `${baseUrl}${path}`;
  } else {
    // In production, add region as query parameter
    const url = new URL(`${baseUrl}${path}`, window.location.origin);
    url.searchParams.set('region', region);
    return url.toString();
  }
}

// Enhanced fetch wrapper for API calls
export async function apiFetch(
  region: RuckusRegion,
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = buildApiUrl(region, path);
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}
