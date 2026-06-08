import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Inicio from './pages/Inicio'
import Fundamentos from './pages/Fundamentos'
import Indicadores from './pages/Indicadores'

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '64px', minHeight: 'calc(100vh - 64px)' }}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/fundamentos" element={<Fundamentos />} />
          <Route path="/indicadores" element={<Indicadores />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
