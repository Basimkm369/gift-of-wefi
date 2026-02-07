import './App.css'
import Dashboard from './pages/Dashboard'
import Viewer from './pages/Viewer'

function App() {
  const params = new URLSearchParams(window.location.search)
  const file = params.get('file')
  const title = params.get('title')

  if (file) {
    return <Viewer fileUrl={file} title={title} />
  }

  return <Dashboard />
}

export default App
