import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import { StoreProvider } from './lib/store'
import { Toaster } from '@/components/ui/sonner'

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Toaster position="top-center" richColors closeButton />
    </StoreProvider>
  )
}
