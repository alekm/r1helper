# R1Helper.com Deployment Guide

## Quick Start

### Frontend (React + Vite)

1. **Start the development server:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5174`

### Architecture

This application is a standalone frontend that directly integrates with the Ruckus One API. No backend server is required.

## Features

### Current Features

✅ **Asset Viewer**
- View and manage Ruckus One Access Points
- List and inspect WLANs/Networks
- Regular R1 and MSP-aware tenant routing
- OAuth2 client-credentials with token caching
- Copy or download results as JSON

✅ **SmartZone to R1 AP Converter**
- Convert SmartZone AP exports to Ruckus One format
- Bulk import preparation with validation
- Duplicate detection for AP names and serials
- Configurable AP Group, Latitude, and Longitude

✅ **Modern UI**
- Responsive design with Tailwind CSS
- TypeScript for type safety
- React Hook Form for form handling
- Loading states and error handling

### Asset Management

- **Access Points**: View, filter, and export AP data from Ruckus One
- **WLANs**: Manage wireless networks with security and VLAN information
- **Export Options**: Download data as JSON or CSV formats

### SmartZone Migration

- **CSV Import**: Upload SmartZone AP export files
- **Format Conversion**: Transform to Ruckus One bulk import format
- **Validation**: Check for required fields and duplicates
- **Bulk Configuration**: Set AP Group, Latitude, and Longitude for all APs

## Configuration

### Environment Variables

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8000  # or 3001 for Node.js
```

#### FastAPI Backend (.env)
```bash
RUCKUS_API_ENDPOINT=https://api.ruckuswireless.com/v1
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Node.js Backend (.env)
```bash
PORT=3001
RUCKUS_API_ENDPOINT=https://api.ruckuswireless.com/v1
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
NODE_ENV=development
```

## Production Deployment

### Frontend (Static Build)

```bash
cd frontend
npm run build
```

Deploy the `dist/` folder to:
- Netlify
- Vercel  
- AWS S3 + CloudFront
- Traditional web server

### Backend Deployment

#### FastAPI (Python)
```bash
# Using Gunicorn
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker

# Using Docker
docker build -t r1helper-api .
docker run -p 8000:8000 r1helper-api
```

#### Node.js
```bash
# Production build
npm run build
npm start

# Using PM2
npm install -g pm2
pm2 start dist/server.js --name r1helper-api
```

## Architecture

```
r1helper.com/
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── lib/           # Utilities and helpers
│   │   └── App.tsx        # Main application component
│   └── package.json
├── backend/
│   ├── fastapi/       # Python API server
│   │   ├── main.py        # FastAPI application
│   │   └── requirements.txt
│   └── nodejs/        # Node.js API server  
│       ├── src/
│       │   ├── routes/    # API route handlers
│       │   ├── services/  # Business logic
│       │   └── server.ts  # Express application
│       └── package.json
├── shared/            # Shared TypeScript types
└── docs/              # Documentation
```

## API Reference

### Template Generation

**POST** `/api/templates/generate`

```json
{
  "templateType": "basic-wifi",
  "organizationName": "Example Corp",
  "siteName": "Main Office", 
  "networkName": "CorpWiFi",
  "ssid": "Example-WiFi",
  "securityType": "wpa2",
  "vlanId": "10",
  "bandwidth": "100Mbps",
  "deviceType": "access-point"
}
```

**Response:**
```json
{
  "success": true,
  "config": "# Generated configuration...",
  "format": "yaml"
}
```

### API Script Generation

**POST** `/api/scripts/generate`

```json
{
  "apiEndpoint": "https://api.ruckuswireless.com/v1",
  "apiKey": "your-api-key",
  "organizationId": "org-123456",
  "siteId": "site-789012", 
  "authMethod": "api-key",
  "format": "python"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test` (frontend) or `pytest` (FastAPI)
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS_ORIGINS includes frontend URL
   - Check that frontend VITE_API_URL points to correct backend

2. **Port Conflicts**
   - Frontend default: 5173
   - FastAPI default: 8000  
   - Node.js default: 3001

3. **Package Installation Issues**
   - Delete `node_modules` and `package-lock.json`, then `npm install`
   - For Python: create fresh virtual environment

### Getting Help

- Check the [Issues](https://github.com/yourusername/r1helper/issues) page
- Join the discussion in [Discussions](https://github.com/yourusername/r1helper/discussions)
- Contact: [support@r1helper.com](mailto:support@r1helper.com)

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**R1Helper.com** - Simplifying Ruckus One configuration management
