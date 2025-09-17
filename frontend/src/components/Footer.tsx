import { ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-left">
            <p className="footer-text">
              R1Helper is part of the{' '}
              <a 
                href="https://r1tools.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-link"
              >
                R1Tools <ExternalLink className="w-3 h-3 inline" />
              </a>{' '}
              suite of Ruckus One management tools.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
