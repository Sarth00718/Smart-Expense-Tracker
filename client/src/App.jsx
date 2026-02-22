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
import PWAInstallPrompt from './components/ui/PWAInstallPrompt'
import OfflineIndicator from './components/ui/OfflineIndicator'
import ErrorBoundary from './components/ui/ErrorBoundary'
import LoadingSpinner from './components/ui/LoadingSpinner'
import { pageTransition } from './utils/animations'
import api from './services/api'

// Lazy load SnowEffect to not block initial render
const SnowEffect = lazy(() => import('./components/ui/SnowEffect'))

// Keep-alive ping to prevent server sleep
const useServerKeepAlive = () => {
  useEffect(() => {
    // Ping server every 5 minutes to keep it awake
    const pingInterval = setInterval(async () => {
      try {
        await api.get('/health/ping', {
          timeout: 5000,
          retry: 0 // Don't retry pings
        })
      } catch (error) {
        // Silently fail - this is just a keep-alive
        console.log('Keep-alive ping failed (server may be sleeping)')
      }
    }, 5 * 60 * 1000) // 5 minutes

    // Defer initial ping to not block page load
    const initialPing = setTimeout(() => {
      api.get('/health/ping', { timeout: 5000, retry: 0 }).catch(() => { })
    }, 3000)

    return () => {
      clearInterval(pingInterval)
      clearTimeout(initialPing)
    }
  }, [])
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  // Keep server alive when user is logged in
  useServerKeepAlive()

  if (loading) {
    return (
      <LoadingSpinner fullScreen text="Loading..." variant="logo" />
    )
  }

  return user ? children : <Navigate to="/login" />
}

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <LoadingSpinner fullScreen text="Loading..." />
    )
  }

  return !user ? children : <Navigate to="/dashboard" />
}

// Animated Routes wrapper
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <motion.div {...pageTransition}>
                <Login />
              </motion.div>
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <motion.div {...pageTransition}>
                <Register />
              </motion.div>
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AnimatePresence>
  );
};

// App content wrapper to access theme context
const AppContent = () => {
  const { isDark } = useTheme()

  // Setup offline sync listeners
  useEffect(() => {
    const handleSyncComplete = (event) => {
      const { processed, failed } = event.detail
      if (processed > 0) {
        toast.success(`${processed} offline ${processed === 1 ? 'change' : 'changes'} synced!`, {
          icon: '🔄',
          duration: 4000,
        })
      }
    }

    const handleSyncFailed = (event) => {
      const { failed } = event.detail
      if (failed > 0) {
        toast.error(`${failed} ${failed === 1 ? 'change' : 'changes'} failed to sync`, {
          duration: 5000,
        })
      }
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
              {/* Lazy load SnowEffect - loads after page is interactive */}
              <Suspense fallback={null}>
                <SnowEffect intensity={30} speed="medium" />
              </Suspense>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: isDark ? '#1e293b' : '#fff',
                    color: isDark ? '#f1f5f9' : '#1e293b',
                    padding: '16px',
                    borderRadius: '8px',
                    boxShadow: isDark 
                      ? '0 4px 6px -1px rgba(0, 0, 0, 0.4)' 
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: isDark ? '1px solid #334155' : 'none',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: isDark ? '#1e293b' : '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: isDark ? '#1e293b' : '#fff',
                    },
                  },
                }}
              />
              <OfflineIndicator />
              <PWAInstallPrompt />
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
