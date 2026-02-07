import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Materials from '../components/Materials'
import Footer from '../components/Footer'

function Dashboard() {
  const [subjects, setSubjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPdfs = async () => {
      try {
        const response = await fetch('/pdfs/index.json')
        if (!response.ok) return
        const files = await response.json()
        if (!Array.isArray(files)) return
        const mapped = files.map((file) => ({
          file,
          url: `/pdfs/${encodeURIComponent(file)}`,
        }))
        setSubjects(mapped)
      } catch (error) {
        console.error('Failed to load PDF list', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPdfs()
  }, [])

  return (
    <div className="page">
      <Header />
      <main className="main">
        <Hero />
        {isLoading ? (
          <div className="dashboard-loading" role="status" aria-live="polite">
            <div className="dashboard-loading-inner">
              <svg
                className="spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="spin-track"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="spin-head"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.963 7.963 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Loading PDFs...</span>
            </div>
          </div>
        ) : (
          <Materials subjects={subjects} />
        )}
      </main>
      <Footer />
    </div>
  )
}

export default Dashboard
