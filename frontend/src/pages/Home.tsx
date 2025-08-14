import { Link } from 'react-router-dom'
import { Settings, CheckCircle, Sparkles, Zap, Server, FileText, Upload } from 'lucide-react'

export function Home() {
  const features = [
    "Convert SmartZone AP exports to Ruckus One format",
    "View live inventory of Access Points (APs)",
    "Upload APs directly to Ruckus One via API",
    "List and inspect WLANs/Networks with security and VLANs",
    "Regular R1 and MSP-aware tenant routing",
    "OAuth2 client-credentials with token caching"
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-icon">
          <div className="hero-icon-inner">
            <Settings className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="hero-title">R1Helper</h1>
        <p className="hero-subtitle">SmartZone to Ruckus One Migration Tool</p>
        <p className="hero-description">Convert SmartZone exports, manage Ruckus One assets, and upload configurations seamlessly.</p>
        
        <div className="hero-buttons">
          <Link to="/csv" className="btn-primary">
            <FileText className="w-5 h-5" />
            <span>Convert SmartZone Data</span>
          </Link>
          <Link to="/assets" className="btn-secondary">
            <Server className="w-5 h-5" />
            <span>Asset Viewer</span>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What you can do</h2>
          <p className="text-gray-600 text-lg">Everything you need to migrate from SmartZone and manage your Ruckus One tenant</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border border-green-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">SmartZone Converter</h3>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">Convert SmartZone AP exports to Ruckus One bulk import format with validation.</p>
            <div className="flex items-center space-x-2 text-green-600 font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Seamless migration</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
                <Server className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Asset Viewer</h3>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">View Access Points and WLANs across your tenant with detailed information.</p>
            <div className="flex items-center space-x-2 text-blue-600 font-medium">
              <Zap className="w-4 h-4" />
              <span>Real-time data</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl border border-purple-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">API Upload</h3>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">Upload converted APs directly to Ruckus One via API with AP Group validation.</p>
            <div className="flex items-center space-x-2 text-purple-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Direct integration</span>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-8 text-center">Key Features</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 font-medium leading-relaxed">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>




    </div>
  )
}
