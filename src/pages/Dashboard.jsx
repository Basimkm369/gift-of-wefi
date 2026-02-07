import Header from '../components/Header'
import Hero from '../components/Hero'
import Materials from '../components/Materials'
import Footer from '../components/Footer'

const subjects = [
  {
    file: 'SSLC BIOLOGY ENGLISH MEDIUM.pdf',
  },
]

function Dashboard() {
  return (
    <div className="page">
      <Header />
      <main className="main">
        <Hero />
        <Materials subjects={subjects} />
      </main>
      <Footer />
    </div>
  )
}

export default Dashboard
