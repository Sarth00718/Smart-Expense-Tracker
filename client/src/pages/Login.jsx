import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { biometricService, isBiometricSupported } from '../services/biometricService'
import toast from 'react-hot-toast'
import { Wallet, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, TrendingUp, Shield, Zap, Sparkles, ArrowRight, Fingerprint } from 'lucide-react'

const ButtonSpinner = () => (
  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
)

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [focusedField, setFocusedField] = useState(null)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricLoading, setBiometricLoading] = useState(false)
  const { login, loginWithGoogle, setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
    // Check if biometric is available
    if (isBiometricSupported() && biometricService.isRegistered()) {
      setBiometricAvailable(true)
    }
  }, [])

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleEmailBlur = () => {
    setFocusedField(null)
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError('')
    }
  }

  const handlePasswordBlur = () => {
    setFocusedField(null)
    // Don't validate password length on login - backend will handle it
    // Only validate on registration
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setEmailError('')
    setPasswordError('')

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    if (!password) {
      setPasswordError('Password is required')
      return
    }

    setLoading(true)

    try {
      await login(email, password)
      toast.success('Welcome back!', {
        icon: '🔓',
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
        },
      })

      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)

      // Extract error message from different possible error structures
      let errorMsg = 'Login failed. Please try again.'

      if (err.response?.data?.error || err.response?.data?.message) {
        // Backend API error
        errorMsg = err.response.data.error || err.response.data.message
      } else if (err.message) {
        // Error with message (Firebase or other)
        errorMsg = err.message
      } else if (err.response?.status === 401) {
        // Unauthorized - wrong credentials
        errorMsg = 'Invalid email or password'
      } else if (err.response?.status === 429) {
        // Rate limit
        errorMsg = 'Too many login attempts. Please wait and try again'
      }

      setError(errorMsg)

      // Show toast notification
      toast.error(errorMsg, {
        duration: 4000,
        style: {
          borderRadius: '12px',
          background: '#fff',
          color: '#1e293b',
          border: '2px solid #ef4444',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
        },
        iconTheme: {
          primary: '#ef4444',
          secondary: '#fff',
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setGoogleLoading(true)

    try {
      await loginWithGoogle()
      toast.success('Welcome back!', {
        icon: '✨',
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
        },
      })

      navigate('/dashboard')
    } catch (err) {
      console.error('Google login error:', err)

      let errorMsg = 'Google sign-in failed. Please try again.'

      if (err.response?.data?.error || err.response?.data?.message) {
        errorMsg = err.response.data.error || err.response.data.message
      } else if (err.message) {
        errorMsg = err.message
      } else if (err.response?.status === 429) {
        errorMsg = 'Too many attempts. Please wait and try again'
      }

      setError(errorMsg)

      toast.error(errorMsg, {
        duration: 4000,
        style: {
          borderRadius: '12px',
          background: '#fff',
          color: '#1e293b',
          border: '2px solid #ef4444',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
        },
        iconTheme: {
          primary: '#ef4444',
          secondary: '#fff',
        },
      })
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
    setError('')
    setBiometricLoading(true)

    try {
      const result = await biometricService.authenticate()

      if (result.user) {
        setUser(result.user)
      }

      toast.success('Welcome back!', {
        icon: '🔐',
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
        },
      })

      navigate('/dashboard')
    } catch (err) {
      console.error('Biometric login error:', err)
      const errorMsg = err.message || 'Biometric authentication failed'
      setError(errorMsg)

      toast.error(errorMsg, {
        duration: 4000,
        style: {
          borderRadius: '12px',
          background: '#fff',
          color: '#1e293b',
          border: '2px solid #ef4444',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
        },
        iconTheme: {
          primary: '#ef4444',
          secondary: '#fff',
        },
      })

      if (errorMsg.includes('credential') || errorMsg.includes('register')) {
        toast('Try using email/password or Google sign-in', {
          icon: '💡',
          duration: 3000,
        })
      }
    } finally {
      setBiometricLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 via-blue-600 to-blue-900 p-4 sm:p-6 lg:p-6 xl:p-8 relative overflow-hidden font-sans antialiased">
      {/* Simple background pattern instead of AnimatedBackground */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className={`w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Left Side - Enhanced Branding */}
        <div className="hidden lg:block text-white space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 hover:scale-110 transition-transform duration-300">
              <Wallet className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span className="text-xs font-semibold text-yellow-300 uppercase tracking-widest">Welcome Back</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-3">
                Smart Expense
                <span className="block bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent mt-1 animate-gradient">
                  Tracker
                </span>
              </h1>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed tracking-normal">
                AI-powered expense tracking with voice input, receipt scanning, and smart analytics
              </p>
            </div>
          </div>

          {/* Enhanced Feature Cards */}
          <div className="space-y-3">
            {[
              { icon: TrendingUp, title: 'AI-Powered Insights', desc: 'Get personalized financial advice', gradient: 'from-emerald-500 to-teal-600' },
              { icon: Shield, title: 'Receipt Scanner', desc: 'OCR-powered expense capture', gradient: 'from-purple-500 to-indigo-600' },
              { icon: Zap, title: 'Voice Commands', desc: 'Add expenses hands-free', gradient: 'from-blue-500 to-cyan-600' }
            ].map((feature, index) => (
              <div
                key={index}
                className="group flex items-center gap-3 p-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm tracking-tight mb-0.5">{feature.title}</h3>
                  <p className="text-xs text-white/80 leading-snug">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20">
            {[
              { label: 'PWA Support', icon: '📱' },
              { label: 'Offline Mode', icon: '🔄' },
              { label: 'PDF Reports', icon: '📄' },
              { label: 'Achievements', icon: '🏅' }
            ].map((feature, index) => (
              <div key={index} className="text-center p-2 bg-white/5 rounded-lg backdrop-blur-sm">
                <div className="text-2xl mb-1">{feature.icon}</div>
                <div className="text-xs text-white/90 font-medium tracking-tight">{feature.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Enhanced Login Form */}
        <div className="w-full">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-sm text-white/80 tracking-normal">Sign in to continue your journey</p>
          </div>

          {/* Enhanced Glass Card */}
          <div className="relative bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 lg:p-8 border border-white/30 overflow-hidden font-sans">
            {/* Decorative corner gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/30 via-purple-200/20 to-transparent rounded-bl-full blur-2xl"></div>

            <div className="relative z-10">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2 tracking-tight">
                  Sign In
                  <span className="text-xl">👋</span>
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">Enter your credentials to access your account</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl flex items-start gap-3 animate-shake shadow-sm">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 font-medium tracking-tight">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${emailError ? 'text-red-500' : focusedField === 'email' ? 'text-primary-500 scale-110' : email ? 'text-primary-500' : 'text-gray-400'
                      }`} />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setEmailError('')
                      }}
                      onFocus={() => setFocusedField('email')}
                      onBlur={handleEmailBlur}
                      required
                      placeholder="you@example.com"
                      className={`input-auth ${emailError ? 'input-auth-error' : ''}`}
                    />
                    {focusedField === 'email' && !emailError && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/5 to-secondary-purple/5 pointer-events-none"></div>
                    )}
                  </div>
                  {emailError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-medium animate-shake">
                      <AlertCircle className="w-4 h-4" />
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${passwordError ? 'text-red-500' : focusedField === 'password' ? 'text-primary-500 scale-110' : password ? 'text-primary-500' : 'text-gray-400'
                      }`} />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setPasswordError('')
                      }}
                      onFocus={() => setFocusedField('password')}
                      onBlur={handlePasswordBlur}
                      required
                      placeholder="Enter your password"
                      className={`input-auth ${passwordError ? 'input-auth-error' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-all hover:scale-110"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {focusedField === 'password' && !passwordError && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/5 to-secondary-purple/5 pointer-events-none"></div>
                    )}
                  </div>
                  {passwordError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-medium animate-shake">
                      <AlertCircle className="w-4 h-4" />
                      {passwordError}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || emailError || passwordError}
                  className="group relative w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-base rounded-xl tracking-tight focus:outline-none focus:ring-4 focus:ring-primary-500/50 transition-all duration-300 hover:scale-[1.02] hover:from-primary-600 hover:to-primary-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-secondary-purple to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <ButtonSpinner size="md" />
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        <span>Sign In</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-semibold text-sm tracking-tight">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="group w-full py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold text-base rounded-xl tracking-tight hover:bg-gray-50 hover:border-primary-500 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {googleLoading ? (
                  <ButtonSpinner size="md" className="border-gray-300 border-t-gray-700" />
                ) : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Biometric Sign In */}
              {biometricAvailable && (
                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  disabled={biometricLoading}
                  className="group w-full py-4 bg-white border-2 border-primary-500 text-primary-600 font-semibold text-base rounded-xl tracking-tight hover:bg-primary-500 hover:text-white hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-500/50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 mt-3"
                >
                  {biometricLoading ? (
                    <ButtonSpinner size="md" className="border-purple-600/30 border-t-purple-600" />
                  ) : (
                    <>
                      <Fingerprint className="w-6 h-6" />
                      <span>Sign in with Biometric</span>
                    </>
                  )}
                </button>
              )}

              {/* Register Link */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600 mb-3 tracking-normal">Don't have an account?</p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-base sm:text-lg transition-all group tracking-tight"
                >
                  <span>Create an account</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-white/90 text-xs mt-4 font-medium tracking-tight">
            Smart tracking with AI, voice & receipt scanning 💰✨
          </p>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default Login
