import { ExternalLink, Github, Heart } from 'lucide-react'

export function About() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">About R1Helper v0.9b</h1>
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
                <span><strong>Asset Viewer:</strong> View and manage Ruckus One Access Points and WLANs</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Direct API Upload:</strong> Upload converted APs directly to Ruckus One via API</span>
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
                  <li>Direct Ruckus One API integration</li>
                  <li>OAuth2 client credentials authentication</li>
                  <li>Token caching and management</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Privacy & Security</h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>100% client-side processing</li>
                  <li>No data stored on servers</li>
                  <li>All operations happen in your browser</li>
                  <li>Direct API communication with Ruckus One</li>
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
                <li>Use the Asset Viewer to explore your Ruckus One infrastructure</li>
                <li>Convert SmartZone exports using the SZ to R1 Converter</li>
                <li>Upload converted APs directly to Ruckus One via API</li>
                <li>Manage and monitor your network assets efficiently</li>
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
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-900 font-bold text-base">Client-Side Processing</p>
                    <p className="text-sm text-gray-600">All CSV conversion, validation, and data processing happens entirely in your browser. No data is sent to our servers.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-900 font-bold text-base">No Data Storage</p>
                    <p className="text-sm text-gray-600">We don't store any of your network data, credentials, or converted files on our servers.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-gray-900 font-bold text-base">Direct API Communication</p>
                    <p className="text-sm text-gray-600">When uploading to Ruckus One, your data goes directly from your browser to Ruckus One's servers.</p>
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
              
              <div className="flex space-x-4">
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
    </div>
  )
}
