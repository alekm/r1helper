# R1Helper v1.1.0

A comprehensive, privacy-focused tool for SmartZone to Ruckus One migration, featuring CSV conversion and direct API integration.

## 🚀 Version 1.1.0 Features

- **SmartZone CSV Converter**: Convert SmartZone AP exports to Ruckus One bulk import format
- **Direct API Integration**: Upload APs directly to Ruckus One via API
- **Multi-Region Support**: North America, Europe, and Asia endpoints
- **Privacy-Focused**: Client-side processing with minimal server exposure
- **Asset Viewer**: Browse and manage Ruckus One assets
- **Netlify Ready**: Production deployment with serverless functions

## Project Structure

```
r1helper/
├── frontend/                 # React frontend application
│   ├── src/                 # Source code
│   ├── dist/                # Built files (for deployment)
│   └── package.json         # Frontend dependencies
├── netlify/                 # Netlify deployment configuration
│   ├── functions/           # Serverless functions
│   └── netlify.toml         # Netlify configuration
├── docs/                    # Documentation
├── package.json             # Root project configuration
└── README.md               # This file
```

## Features

- 🎨 Modern React frontend with TypeScript
- 📊 Asset Viewer for Ruckus One APs and WLANs
- 🔄 SmartZone to Ruckus One AP Converter
- 📡 Direct API integration with Ruckus One
- 🎯 User-friendly interface for asset management
- 🌍 Multi-region API support (NA, EU, Asia)
- 🔒 Privacy-focused architecture
- ☁️ Netlify deployment ready

## Getting Started

### Development
```bash
# Install dependencies
npm run install-deps

# Start development server
npm run dev
```

The application will be available at `http://localhost:5174`

### Production Deployment

See [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md) for detailed deployment instructions.

```bash
# Build for production
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=frontend/dist
```

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- React Hook Form for form handling

### API Integration
- Direct integration with Ruckus One API
- OAuth2 client credentials authentication
- Token caching and management
- Multi-region endpoint support
- Privacy-focused proxy architecture

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
