import { useState } from 'react'
import { ExternalLink, Github, Heart, FileText, X, ChevronDown } from 'lucide-react'

export function About() {
  const [showChangelog, setShowChangelog] = useState(false)

  const changelogContent = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-08-15

### Added
- **MSP R1 Mode Support**
  - Full MSP mode with target tenant delegation
  - End Customer management and selection
  - Target tenant routing for all API operations
  - Proper header management for MSP operations (\`x-rks-tenantid\`)
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

- **Multi-Region Support**
  - North America: \`https://api.ruckus.cloud\`
  - Europe: \`https://api.eu.ruckus.cloud\`
  - Asia: \`https://api.asia.ruckus.cloud\`
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
    - Get all venues in tenant with \`/venues\` endpoint
    - Click-to-copy venue IDs for easy reference
    - Visual feedback for copy actions
    - Copy and download functionality for venues data
  - **Enhanced AP Display**
    - Search functionality for large AP datasets
    - Pagination controls for better performance
    - List and Grid view modes
    - Improved display for datasets with 600+ Access Points
  - **Venue-Level API Support**
    - Venue ID required for AP Groups queries
    - Dynamic API path construction for AP Groups
    - Tenant-level queries for APs and WLANs

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
- Bulk operations for AP management`

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">About R1Helper v1.1.0</h1>
        <p className="text-gray-600 mt-2">
          Simplifying SmartZone to Ruckus One migration for network administrators everywhere.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* About Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What is R1Helper?</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                R1Helper is a privacy-focused web-based tool designed to streamline the migration 
                from SmartZone to Ruckus One cloud-managed networks. Whether you're converting 
                SmartZone exports or uploading APs directly to Ruckus One, R1Helper provides 
                the tools you need to work more efficiently and securely.
              </p>
              
              <p>
                Our mission is to simplify complex network migrations by providing 
                intuitive tools for converting SmartZone exports, managing assets, and 
                uploading configurations directly to Ruckus One.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>SmartZone to R1 Converter:</strong> Convert SmartZone AP exports to Ruckus One bulk import format</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Advanced Asset Viewer:</strong> View and manage APs, WLANs, AP Groups, and Venues with search and pagination</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Direct API Upload:</strong> Upload converted APs directly to Ruckus One via API</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Venue-Level Management:</strong> Venue ID support for AP Groups data access</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>MSP R1 Support:</strong> Full MSP mode with target tenant delegation and End Customer management</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Interactive Features:</strong> Click-to-copy functionality with visual feedback</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Validation:</strong> Built-in validation ensures data integrity and format compliance</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>User-Friendly:</strong> Intuitive interface that doesn't require deep API knowledge</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Technical Details & Contact */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Technology Stack</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Frontend</h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>React 18 with TypeScript</li>
                  <li>Vite for build tooling</li>
                  <li>Tailwind CSS for styling</li>
                  <li>React Hook Form for form handling</li>
                  <li>React Router for navigation</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">API Integration</h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Ruckus One API integration via secure proxy</li>
                  <li>OAuth2 client credentials authentication</li>
                  <li>Token caching and management</li>
                  <li>Multi-region support (NA, EU, Asia)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Privacy & Security</h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Client-side CSV processing and validation</li>
                  <li>No data stored on servers</li>
                  <li>Secure API proxy for CORS handling</li>
                  <li>Serverless functions with no data persistence</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                R1Helper is designed to be easy to use right out of the box:
              </p>
              
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Use the Asset Viewer to explore your Ruckus One infrastructure (APs, WLANs, AP Groups, Venues)</li>
                <li>Convert SmartZone exports using the SZ to R1 Converter</li>
                <li>Upload converted APs directly to Ruckus One via API</li>
                <li>Manage and monitor your network assets efficiently with search and pagination</li>
                <li>Use venue-level queries for granular data access when needed</li>
              </ol>
              
              <p className="text-sm text-gray-600">
                No registration required - start managing your Ruckus One network immediately!
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy & Data Security</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                Your data security and privacy are our top priorities:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-900 font-bold text-base">Client-Side Processing</p>
                    <p className="text-sm text-gray-600">All CSV conversion, validation, and data processing happens entirely in your browser. No data is sent to our servers.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-900 font-bold text-base">No Data Storage</p>
                    <p className="text-sm text-gray-600">We don't store any of your network data, credentials, or converted files on our servers.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-900 font-bold text-base">Secure API Proxy</p>
                    <p className="text-sm text-gray-600">API requests are proxied through secure serverless functions that don't store or process your data, only forward requests to Ruckus One.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Open Source</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                R1Helper is an open-source project. We welcome contributions, feedback, 
                and feature requests from the community.
              </p>
              
              <div className="flex space-x-6">
                <a
                  href="https://github.com/alekm/r1helper"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>View on GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => {
                    setShowChangelog(true);
                    // Scroll to the modal when it opens
                    setTimeout(() => {
                      const modal = document.querySelector('.changelog-modal');
                      if (modal) {
                        modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 100);
                  }}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Changelog</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Disclaimer</h3>
        <p className="text-yellow-700 text-sm">
          R1Helper is an independent tool and is not officially affiliated with or endorsed by 
          Ruckus Networks or CommScope. Always validate migrations in a test environment 
          before deploying to production networks. The conversion and upload processes follow 
          Ruckus One best practices but may need customization for your specific environment.
        </p>
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-gray-200">
        <p className="text-gray-600 flex items-center justify-center space-x-1">
          <span>Made with</span>
          <Heart className="w-4 h-4 text-red-500 fill-current" />
          <span>for the network admin community</span>
        </p>
      </div>

      {/* Changelog Modal */}
      {showChangelog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 changelog-modal">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Changelog</h2>
              <button
                onClick={() => setShowChangelog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                  {changelogContent}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
