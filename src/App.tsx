import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import { StoreProvider } from './lib/store'
import ErrorBoundary from './components/ErrorBoundary'
import { Toaster } from '@/components/ui/sonner'

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
        <Toaster position="top-center" richColors closeButton />
      </StoreProvider>
    </ErrorBoundary>
  )
}
