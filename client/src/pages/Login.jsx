import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Wallet, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, TrendingUp, Shield, Zap, Sparkles, ArrowRight } from 'lucide-react'

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
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
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
    if (password && password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
    } else {
      setPasswordError('')
    }
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

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await login(email, password)
      toast.success('Welcome back!', {
        icon: '👋',
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
        },
      })
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = err.message || 'Login failed'
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
      await loginWithGoogle()
      toast.success('Welcome back!', {
        icon: '🎉',
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
        },
      })
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = err.message || 'Google sign-in failed'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4361ee] via-[#3a0ca3] to-[#7209b7] p-4 sm:p-6 lg:p-6 xl:p-8 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-[#4cc9f0] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-[#f72585] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#7209b7] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-white/20 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white/25 rounded-full animate-float animation-delay-3000"></div>
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
                <span className="text-xs font-semibold text-yellow-300 uppercase tracking-wider">Welcome Back</span>
              </div>
              <h1 className="text-4xl font-bold leading-tight mb-3">
                Smart Expense
                <span className="block bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent mt-1 animate-gradient">
                  Tracker
                </span>
              </h1>
              <p className="text-base text-white/90 leading-relaxed">
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
                  <h3 className="font-bold text-sm mb-0.5">{feature.title}</h3>
                  <p className="text-xs text-white/80">{feature.desc}</p>
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
                <div className="text-xs text-white/90 font-medium">{feature.label}</div>
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
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-white/80">Sign in to continue your journey</p>
          </div>

          {/* Enhanced Glass Card */}
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 lg:p-8 border border-white/30 overflow-hidden">
            {/* Decorative corner gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#4361ee]/10 to-transparent rounded-bl-full"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                  Sign In
                  <span className="text-xl">👋</span>
                </h2>
                <p className="text-sm text-gray-600">Enter your credentials to access your account</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl flex items-start gap-3 animate-shake shadow-sm">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${
                      emailError ? 'text-red-500' : focusedField === 'email' ? 'text-[#4361ee] scale-110' : email ? 'text-[#4361ee]' : 'text-gray-400'
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
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all text-sm font-medium ${
                        emailError
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                          : 'border-gray-200 focus:border-[#4361ee] focus:ring-[#4361ee]/20 hover:border-gray-300'
                      }`}
                    />
                    {focusedField === 'email' && !emailError && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#4361ee]/5 to-[#7209b7]/5 pointer-events-none"></div>
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
                  <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${
                      passwordError ? 'text-red-500' : focusedField === 'password' ? 'text-[#4361ee] scale-110' : password ? 'text-[#4361ee]' : 'text-gray-400'
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
                      className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all text-sm font-medium ${
                        passwordError
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                          : 'border-gray-200 focus:border-[#4361ee] focus:ring-[#4361ee]/20 hover:border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4361ee] transition-all hover:scale-110"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {focusedField === 'password' && !passwordError && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#4361ee]/5 to-[#7209b7]/5 pointer-events-none"></div>
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
                  className="group relative w-full py-4 bg-gradient-to-r from-[#4361ee] via-[#3a0ca3] to-[#7209b7] text-white font-bold rounded-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#4361ee]/50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#7209b7] via-[#3a0ca3] to-[#4361ee] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
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
                  <span className="px-4 bg-white text-gray-500 font-bold">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="group w-full py-4 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-[#4361ee] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {googleLoading ? (
                  <div className="w-5 h-5 border-3 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Register Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-3">Don't have an account?</p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 text-[#4361ee] hover:text-[#3a0ca3] font-bold transition-all group text-lg"
                >
                  <span>Create an account</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-white/90 text-xs mt-4 font-medium">
            Smart tracking with AI, voice & receipt scanning 💰✨
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.5; }
          50% { transform: translateY(-20px); opacity: 1; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
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
