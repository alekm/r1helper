# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-08-15

### Added
- **MSP R1 Mode Support**
  - Full MSP mode with target tenant delegation
  - End Customer management and selection
  - Target tenant routing for all API operations
  - Proper header management for MSP operations (`x-rks-tenantid`)
  - Click-to-select functionality for End Customers and Venues
  - MSP customer selection in Asset Viewer and API Upload pages

### Fixed
- **Styling Issues**
  - Fixed tip notification styling with proper color classes
  - Added comprehensive Tailwind CSS utility classes
  - Fixed hover states, focus states, and disabled states
  - Improved visual consistency across all pages
  - Fixed progress bars, modal overlays, and status indicators

### Changed
- **API Upload Page**
  - Added MSP R1 mode support with target tenant selection
  - Added "Get Venues" functionality for MSP mode
  - Removed unnecessary MSP ID field requirement
  - Enhanced user experience with clickable venue selection

### Technical Improvements
- **CSS Architecture**
  - Added 213 new CSS utility classes
  - Improved responsive design and accessibility
  - Enhanced visual feedback and user interactions
  - Better color consistency and contrast ratios

## [1.0.0] - 2025-08-14

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
  - MSP R1 mode support with target tenant delegation

- **Multi-Region Support**
  - North America: `https://api.ruckus.cloud`
  - Europe: `https://api.eu.ruckus.cloud`
  - Asia: `https://api.asia.ruckus.cloud`
  - Automatic region selection in UI

- **Asset Viewer with Advanced Features**
  - Browse Ruckus One APs, WLANs, and AP Groups
  - Real-time API integration with venue-level support
  - Multi-region support
  - **AP Groups Management**
    - Two-step API process for detailed AP Group information
    - Display AP Group name, description, and default status
    - Copy and download functionality for AP Group data
  - **Venues Management**
    - Get all venues in tenant with `/venues` endpoint
    - Click-to-copy venue IDs for easy reference
    - Visual feedback for copy actions
    - Copy and download functionality for venues data
  - **Enhanced AP Display**
    - Search functionality for large AP datasets
    - Pagination controls for better performance
    - List and Grid view modes
    - Improved display for datasets with 600+ Access Points
  - **Venue-Level API Support**
    - Optional venue ID for APs and WLANs queries
    - Dynamic API path construction based on venue ID
    - Maintains backward compatibility with tenant-level queries
  - **MSP R1 Mode Support**
    - Full MSP mode with target tenant delegation
    - End Customer management and selection
    - Target tenant routing for all API operations
    - Proper header management for MSP operations (`x-rks-tenantid`)
    - Click-to-select functionality for End Customers and Venues

- **Privacy-Focused Architecture**
  - Client-side CSV processing
  - No data storage on servers
  - Minimal API proxy for CORS handling
  - Netlify Functions for production deployment

- **Modern UI/UX**
  - React 18 with TypeScript
  - Tailwind CSS styling
  - Responsive design
  - Intuitive navigation
  - **Enhanced Navigation**
    - Improved spacing between nav items and logo
    - Better visual separation for cleaner appearance
  - **Interactive Elements**
    - Click-to-copy functionality with visual feedback
    - Hover effects and transitions
    - Loading states and error handling

### Changed
- **Code Quality Improvements**
  - Comprehensive ESLint cleanup
  - TypeScript type safety enhancements
  - Removed unused variables and parameters
  - Fixed unnecessary escape characters
  - Improved error handling throughout application
- **UI/UX Enhancements**
  - Better visual feedback for user interactions
  - Improved spacing and layout consistency
  - Enhanced accessibility with proper tooltips
  - Cleaner navigation bar design

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
- Embedded changelog in About page

## [0.9b] - 2025-08-14

### Added
- Initial release with core CSV conversion functionality
- Basic API integration framework
- Multi-region support foundation
- Asset viewer with basic AP and WLAN browsing

### Technical Features
- React 18 with TypeScript setup
- Tailwind CSS styling
- Vite development environment
- Netlify deployment configuration

## [Unreleased]

### Planned Features
- Additional CSV format support
- Batch processing improvements
- Enhanced error handling
- Performance optimizations
- Additional Ruckus One API endpoints
- Advanced filtering and search capabilities
- Bulk operations for AP management
