import { Link, useLocation } from 'react-router-dom'
import { Home, Info, Sparkles, Server, FileText, Upload } from 'lucide-react'


export function Navbar() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/assets', label: 'Asset Viewer', icon: Server },
    { path: '/csv', label: 'SZ to R1 Converter', icon: FileText },
    { path: '/upload', label: 'R1 AP Upload', icon: Upload },
    { path: '/about', label: 'About', icon: Info },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="flex justify-between items-center">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="logo-text">R1Helper</div>
              <div className="logo-subtitle">Configuration Helper</div>
            </div>
          </Link>
          
          <div className="nav-links">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`nav-link ${location.pathname === path ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
