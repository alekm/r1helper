import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { AssetViewer } from './pages/AssetViewer'
import { CsvConverter } from './pages/CsvConverter'
import { ApiUploader } from './pages/ApiUploader'
import { About } from './pages/About'
import { Speedtest } from './pages/Speedtest'

function AppContent() {
  const location = useLocation()
  const isSpeedtestPage = location.pathname === '/speedtest'

  return (
    <div className="app-container">
      {!isSpeedtestPage && <Navbar />}
      <main className={isSpeedtestPage ? '' : 'main-container'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assets" element={<AssetViewer />} />
          <Route path="/csv" element={<CsvConverter />} />
          <Route path="/upload" element={<ApiUploader />} />
          <Route path="/about" element={<About />} />
          <Route path="/speedtest" element={<Speedtest />} />
        </Routes>
      </main>
      {!isSpeedtestPage && <Footer />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
