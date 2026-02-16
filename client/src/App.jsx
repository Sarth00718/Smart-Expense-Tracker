import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ExpenseProvider } from './context/ExpenseContext'
import { IncomeProvider } from './context/IncomeContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PWAInstallPrompt from './components/ui/PWAInstallPrompt'
import OfflineIndicator from './components/ui/OfflineIndicator'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { pageTransition } from './utils/animations'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-[#3a0ca3]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="spinner border-4 w-12 h-12"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.p
          className="mt-4 text-white text-lg"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          Loading...
        </motion.p>
      </motion.div>
    )
  }

  return user ? children : <Navigate to="/login" />
}

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
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

function App() {
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
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#fff',
                    color: '#1e293b',
                    padding: '16px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
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

export default App
