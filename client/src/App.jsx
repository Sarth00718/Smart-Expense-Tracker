import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, lazy, Suspense } from 'react'

import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { ExpenseProvider } from './context/ExpenseContext'
import { IncomeProvider } from './context/IncomeContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import OfflineIndicator from './components/ui/OfflineIndicator'
import ErrorBoundary from './components/ui/ErrorBoundary'
import LoadingSpinner from './components/ui/LoadingSpinner'
import PWAUpdatePrompt from './components/ui/PWAUpdatePrompt'
import { pageTransition } from './utils/animations'
import api from './services/api'
import { HEALTH } from './config/apiEndpoints'

const useServerKeepAlive = () => {
  useEffect(() => {
    const pingInterval = setInterval(async () => {
      try { await api.get(HEALTH.PING, { timeout: 5000, retry: 0 }) } catch {}
    }, 5 * 60 * 1000)
    const initialPing = setTimeout(() => {
      api.get(HEALTH.PING, { timeout: 5000, retry: 0 }).catch(() => {})
    }, 3000)
    return () => { clearInterval(pingInterval); clearTimeout(initialPing) }
  }, [])
}

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  useServerKeepAlive()
  if (loading) return <LoadingSpinner fullScreen text="Loading..." variant="logo" />
  return user ? children : <Navigate to="/login" />
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullScreen text="Loading..." />
  return !user ? children : <Navigate to="/dashboard" />
}

const AnimatedRoutes = () => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PublicRoute><motion.div {...pageTransition}><Login /></motion.div></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><motion.div {...pageTransition}><Register /></motion.div></PublicRoute>} />
        <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AnimatePresence>
  )
}

const AppContent = () => {
  const { isDark } = useTheme()

  useEffect(() => {
    const handleSyncComplete = (event) => {
      const { processed, failed } = event.detail
      if (processed > 0) toast.success(`${processed} offline ${processed === 1 ? 'change' : 'changes'} synced!`, { icon: '🔄', duration: 4000 })
    }
    const handleSyncFailed = (event) => {
      const { failed } = event.detail
      if (failed > 0) toast.error(`${failed} ${failed === 1 ? 'change' : 'changes'} failed to sync`, { duration: 5000 })
    }
    window.addEventListener('offline-sync-complete', handleSyncComplete)
    window.addEventListener('offline-sync-failed', handleSyncFailed)
    return () => {
      window.removeEventListener('offline-sync-complete', handleSyncComplete)
      window.removeEventListener('offline-sync-failed', handleSyncFailed)
    }
  }, [])

  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <ExpenseProvider>
            <IncomeProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: isDark ? 'hsl(222.2 84% 4.9%)' : '#fff',
                    color: isDark ? 'hsl(210 40% 98%)' : 'hsl(222.2 84% 4.9%)',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: isDark ? '1px solid hsl(217.2 32.6% 17.5%)' : '1px solid hsl(214.3 31.8% 91.4%)',
                    fontSize: '14px',
                    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)',
                  },
                  success: { iconTheme: { primary: '#10b981', secondary: isDark ? '#0f172a' : '#fff' } },
                  error: { iconTheme: { primary: '#ef4444', secondary: isDark ? '#0f172a' : '#fff' } },
                }}
              />
              <OfflineIndicator />
              <PWAUpdatePrompt />
              <AnimatedRoutes />
            </IncomeProvider>
          </ExpenseProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
