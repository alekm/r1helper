const fetch = require('node-fetch');

// Regional API endpoints mapping
const REGIONAL_ENDPOINTS = {
  na: 'https://api.ruckus.cloud',
  eu: 'https://api.eu.ruckus.cloud',
  asia: 'https://api.asia.ruckus.cloud'
};

exports.handler = async (event, context) => {
  // Enable CORS for browser requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Tenant-ID, X-MSP-ID',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Parse the path to determine region and target endpoint
    let path = event.path.replace('/.netlify/functions/api-proxy', '');
    
    // Remove /api prefix if present (for production routing)
    if (path.startsWith('/api')) {
      path = path.substring(4); // Remove '/api'
    }
    
    // Extract region from query parameters or default to 'na'
    const region = event.queryStringParameters?.region || 'na';
    const apiBase = REGIONAL_ENDPOINTS[region];
    
    if (!apiBase) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid region specified' })
      };
    }

    // Construct the target URL
    const targetUrl = `${apiBase}${path}`;
    
    // Debug logging
    console.log('Proxy request:', {
      method: event.httpMethod,
      path: path,
      region: region,
      apiBase: apiBase,
      targetUrl: targetUrl,
      hasBody: !!event.body
    });
    
    // Prepare headers for the upstream request
    const upstreamHeaders = {};
    
    // Copy relevant headers from the original request
    if (event.headers.authorization) {
      upstreamHeaders.authorization = event.headers.authorization;
    }
    if (event.headers['x-tenant-id']) {
      upstreamHeaders['x-tenant-id'] = event.headers['x-tenant-id'];
    }
    if (event.headers['x-msp-id']) {
      upstreamHeaders['x-msp-id'] = event.headers['x-msp-id'];
    }
    if (event.headers['content-type']) {
      upstreamHeaders['content-type'] = event.headers['content-type'];
    }
    
    // Add Accept header for JSON responses
    upstreamHeaders.accept = 'application/json';

    // Prepare the request options
    const requestOptions = {
      method: event.httpMethod,
      headers: upstreamHeaders
    };

    // Add body for POST/PUT requests
    if (event.body && ['POST', 'PUT', 'PATCH'].includes(event.httpMethod)) {
      requestOptions.body = event.body;
    }

    // Make the request to Ruckus One API
    const response = await fetch(targetUrl, requestOptions);
    
    // Get response body and handle different content types
    let responseBody;
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType && contentType.includes('application/json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }
    } catch (parseError) {
      console.error('Response parsing error:', parseError.message);
      responseBody = await response.text();
    }

    // Debug logging for response
    console.log('Proxy response:', {
      status: response.status,
      contentType: contentType,
      bodyType: typeof responseBody,
      bodyLength: typeof responseBody === 'string' ? responseBody.length : 'object'
    });

    // Return the response
    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'content-type': contentType || 'application/json'
      },
      body: typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)
    };

  } catch (error) {
    console.error('Proxy error:', error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
