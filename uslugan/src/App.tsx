import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProviderProfile from './pages/ProviderProfile'
import Profile from './pages/Profile'
import Moderation from './pages/Moderation'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/provider/:id" element={<ProviderProfile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/moderation" element={<Moderation />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}