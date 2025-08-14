import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Home } from './pages/Home'
import { AssetViewer } from './pages/AssetViewer'
import { CsvConverter } from './pages/CsvConverter'
import { ApiUploader } from './pages/ApiUploader'
import { About } from './pages/About'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/assets" element={<AssetViewer />} />
              <Route path="/csv" element={<CsvConverter />} />
              <Route path="/upload" element={<ApiUploader />} />
              <Route path="/about" element={<About />} />
            </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
