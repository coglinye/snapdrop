import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Transfer from './pages/Transfer'
import Download from './pages/Download'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="transfer/:id" element={<Transfer />} />
        <Route path="download/:id" element={<Download />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App