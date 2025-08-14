# Netlify Deployment Guide

## Overview

This application is designed to be deployed on Netlify with a privacy-focused architecture that minimizes data exposure while providing full functionality.

## Architecture

### Development vs Production

**Development:**
- Uses Vite proxy (`/r1`, `/r1-eu`, `/r1-asia`) to avoid CORS issues
- All API calls go through the development server

**Production (Netlify):**
- Uses Netlify Functions as a minimal API proxy
- Functions forward requests without storing or processing data
- Maintains privacy by not logging sensitive information

## Privacy Features

### Netlify Functions (`netlify/functions/api-proxy.js`)
- ✅ **No data storage** - Functions don't persist any data
- ✅ **No logging** - Sensitive credentials are not logged
- ✅ **Minimal processing** - Only forwards requests and responses
- ✅ **CORS handling** - Proper CORS headers for browser requests
- ✅ **Regional support** - Supports NA, EU, and Asia endpoints

### Data Flow
1. Browser → Netlify Function → Ruckus One API
2. Ruckus One API → Netlify Function → Browser
3. No data stored or processed in between

## Deployment Steps

### 1. Build the Application
```bash
cd frontend
npm run build
```

### 2. Deploy to Netlify

**Option A: Netlify CLI**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=frontend/dist
```

**Option B: Netlify Dashboard**
1. Connect your Git repository to Netlify
2. Set build settings:
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/dist`
   - Functions directory: `netlify/functions`

### 3. Environment Variables (Optional)
If you need to customize the deployment, you can set environment variables in the Netlify dashboard:
- `NODE_VERSION`: Set to `18` (default)

## File Structure

```
├── frontend/                 # React application
│   ├── dist/                # Built files (deployed to Netlify)
│   └── src/
│       └── lib/
│           ├── apiClient.ts # Handles dev/prod API routing
│           └── ruckusApi.ts # Ruckus One API integration
├── netlify/
│   ├── functions/
│   │   ├── api-proxy.js     # Privacy-focused API proxy
│   │   └── package.json     # Function dependencies
│   └── netlify.toml         # Netlify configuration
└── netlify.toml             # Root Netlify config
```

## Security Considerations

### What the Netlify Function Does NOT Do:
- ❌ Store credentials or tokens
- ❌ Log API requests or responses
- ❌ Process or modify data
- ❌ Cache sensitive information
- ❌ Track user behavior

### What the Netlify Function Does:
- ✅ Forwards API requests to Ruckus One
- ✅ Handles CORS headers
- ✅ Supports multiple regions
- ✅ Returns responses to the browser
- ✅ Provides error handling

## Testing the Deployment

1. **Test API Connectivity:**
   ```bash
   curl -X POST https://your-site.netlify.app/api/oauth2/token/your-tenant-id \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=client_credentials&client_id=test&client_secret=test" \
     -G -d "region=na"
   ```

2. **Test Regional Endpoints:**
   - North America: `?region=na`
   - Europe: `?region=eu`
   - Asia: `?region=asia`

## Troubleshooting

### Common Issues

1. **Function Timeout:**
   - Netlify Functions have a 10-second timeout
   - If API calls are slow, consider implementing retry logic

2. **CORS Errors:**
   - Ensure the function is properly handling preflight requests
   - Check that headers are being forwarded correctly

3. **Authentication Issues:**
   - Verify that the region parameter is being passed correctly
   - Check that credentials are being forwarded in headers

### Debugging

Enable function logs in Netlify dashboard:
1. Go to Functions tab
2. Click on `api-proxy`
3. View real-time logs

## Privacy Compliance

This deployment architecture ensures:
- **GDPR Compliance**: No personal data stored
- **Data Minimization**: Only necessary data is processed
- **Transparency**: Clear data flow documentation
- **Security**: HTTPS-only communication

## Support

For issues with:
- **Netlify Deployment**: Check Netlify documentation
- **API Integration**: Review Ruckus One API documentation
- **Privacy Concerns**: Review the privacy features above
