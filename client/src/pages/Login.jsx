import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Wallet, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, Fingerprint } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [biometricType, setBiometricType] = useState('Biometric')
  const { login, biometricLogin, biometricService } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    checkBiometricAvailability()
  }, [])

  const checkBiometricAvailability = async () => {
    const available = await biometricService.isAvailable()
    setBiometricAvailable(available)
    
    if (available) {
      const type = await biometricService.getBiometricType()
      setBiometricType(type)
      
      // Check if user has biometric enabled
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.id) {
        const enabled = biometricService.isBiometricEnabled(user.id)
        setBiometricEnabled(enabled)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
    setError('')
    setLoading(true)

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!user.id) {
        throw new Error('No user found. Please login with email and password first.')
      }

      await biometricLogin(user.id)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = err.message || 'Biometric authentication failed'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setGoogleLoading(true)

    try {
      await googleLogin()
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Google sign-in failed'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-purple-900 px-3 sm:px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full mb-3 sm:mb-4">
              <Wallet className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Sign in to continue tracking your expenses
            </p>
          </div>

          {/* Biometric Login Button */}
          {biometricAvailable && biometricEnabled && (
            <button
              onClick={handleBiometricLogin}
              disabled={loading}
              className="btn btn-secondary w-full py-2.5 sm:py-3 text-sm sm:text-base tap-target mb-4"
            >
              <Fingerprint className="w-5 h-5" />
              Sign in with {biometricType}
            </button>
          )}

          {/* Divider */}
          {biometricAvailable && biometricEnabled && (
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-3 sm:px-4 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="input pl-11"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="input pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-2.5 sm:py-3 text-sm sm:text-base tap-target"
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-3 sm:px-4 bg-white text-gray-500">New to Expense Tracker?</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <Link
              to="/register"
              className="text-sm sm:text-base text-primary hover:text-primary-dark font-semibold transition-colors"
            >
              Create an account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/80 text-xs sm:text-sm mt-4 sm:mt-6">
          Track smarter, save better 💰
        </p>
      </div>
    </div>
  )
}

export default Login
