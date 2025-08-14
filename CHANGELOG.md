# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9b] - 2025-08-14

### Added
- **SmartZone to Ruckus One CSV Converter**
  - Convert SmartZone AP exports to Ruckus One bulk import format
  - Comprehensive validation for AP names, serial numbers, and coordinates
  - Support for AP Group, Latitude, and Longitude settings
  - Duplicate detection for AP names and serial numbers
  - CSV download with proper formatting

- **Direct API Integration**
  - Upload APs directly to Ruckus One via API
  - Pre-upload validation for AP Groups
  - Support for multiple Ruckus One regions (NA, EU, Asia)
  - OAuth2 client credentials authentication
  - Token caching and management

- **Multi-Region Support**
  - North America: `https://api.ruckus.cloud`
  - Europe: `https://api.eu.ruckus.cloud`
  - Asia: `https://api.asia.ruckus.cloud`
  - Automatic region selection in UI

- **Privacy-Focused Architecture**
  - Client-side CSV processing
  - No data storage on servers
  - Minimal API proxy for CORS handling
  - Netlify Functions for production deployment

- **Asset Viewer**
  - Browse Ruckus One APs and WLANs
  - Real-time API integration
  - Multi-region support

- **Modern UI/UX**
  - React 18 with TypeScript
  - Tailwind CSS styling
  - Responsive design
  - Intuitive navigation

### Technical Features
- **Development Environment**
  - Vite development server with proxy
  - Hot module replacement
  - TypeScript compilation
  - ESLint and Prettier configuration

- **Production Deployment**
  - Netlify Functions for API proxying
  - Static site generation
  - HTTPS enforcement
  - CORS handling

### Security & Privacy
- No sensitive data storage
- Client-side processing
- Minimal server exposure
- Secure API communication
- Token-based authentication

### Documentation
- Comprehensive README
- Netlify deployment guide
- API integration documentation
- Privacy and security documentation

## [Unreleased]

### Planned Features
- Additional CSV format support
- Batch processing improvements
- Enhanced error handling
- Performance optimizations
- Additional Ruckus One API endpoints
