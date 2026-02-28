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
    if (isBiometricSupported() && biometricService.isRegistered()) {
      setBiometricAvailable(true)
    }
  }, [])

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleEmailBlur = () => {
    setFocusedField(null)
    if (email && !validateEmail(email)) setEmailError('Please enter a valid email address')
    else setEmailError('')
  }

  const handlePasswordBlur = () => setFocusedField(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setEmailError('')
    setPasswordError('')
    if (!validateEmail(email)) { setEmailError('Please enter a valid email address'); return }
    if (!password) { setPasswordError('Password is required'); return }
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back! 🔓', { duration: 3000 })
      navigate('/dashboard')
    } catch (err) {
      let errorMsg = 'Login failed. Please try again.'
      if (err.response?.data?.error || err.response?.data?.message) errorMsg = err.response.data.error || err.response.data.message
      else if (err.message) errorMsg = err.message
      else if (err.response?.status === 401) errorMsg = 'Invalid email or password'
      else if (err.response?.status === 429) errorMsg = 'Too many login attempts. Please wait and try again'
      setError(errorMsg)
      toast.error(errorMsg, { duration: 4000 })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      toast.success('Welcome back! ✨', { duration: 3000 })
      navigate('/dashboard')
    } catch (err) {
      let errorMsg = 'Google sign-in failed. Please try again.'
      if (err.response?.data?.error || err.response?.data?.message) errorMsg = err.response.data.error || err.response.data.message
      else if (err.message) errorMsg = err.message
      else if (err.response?.status === 429) errorMsg = 'Too many attempts. Please wait and try again'
      setError(errorMsg)
      toast.error(errorMsg, { duration: 4000 })
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
    setError('')
    setBiometricLoading(true)
    try {
      const result = await biometricService.authenticate()
      if (result.user) setUser(result.user)
      toast.success('Welcome back! 🔐', { duration: 3000 })
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = err.message || 'Biometric authentication failed'
      setError(errorMsg)
      toast.error(errorMsg, { duration: 4000 })
    } finally {
      setBiometricLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 sm:p-6 relative overflow-hidden font-sans antialiased">
      {/* Ambient background orbs — matches dashboard aesthetic */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[160px]" />
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className={`w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

        {/* ── Left: Branding Panel ───────────────────────────────────────────── */}
        <div className="hidden lg:flex flex-col gap-8 text-white">
          {/* Logo + Title */}
          <div className="space-y-5">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-2xl shadow-primary/30">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-xs font-semibold text-yellow-400 uppercase tracking-widest">Welcome Back</span>
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight mb-3 text-slate-100">
                Smart Expense
                <span className="block bg-gradient-to-r from-primary via-violet-400 to-secondary bg-clip-text text-transparent mt-1">
                  Tracker
                </span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed">
                AI-powered expense tracking with voice input, receipt scanning, and smart analytics
              </p>
            </div>
          </div>

          {/* Feature Cards — Match dashboard card style */}
          <div className="space-y-3">
            {[
              { icon: TrendingUp, title: 'AI-Powered Insights', desc: 'Get personalized financial advice', gradient: 'from-emerald-500 to-teal-600' },
              { icon: Shield, title: 'Receipt Scanner', desc: 'OCR-powered expense capture', gradient: 'from-primary to-secondary' },
              { icon: Zap, title: 'Voice Commands', desc: 'Add expenses hands-free', gradient: 'from-violet-500 to-purple-600' },
            ].map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/60 hover:border-primary/40 hover:bg-slate-800 transition-all duration-300 group cursor-default"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${f.gradient} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-100 tracking-tight mb-0.5">{f.title}</h3>
                  <p className="text-xs text-slate-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700/60">
            {[
              { label: 'PWA Support', icon: '📱' },
              { label: 'Offline Mode', icon: '🔄' },
              { label: 'PDF Reports', icon: '📄' },
              { label: 'Achievements', icon: '🏅' },
            ].map((f, i) => (
              <div key={i} className="text-center p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
                <div className="text-2xl mb-1">{f.icon}</div>
                <div className="text-xs text-slate-400 font-medium">{f.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Login Form ──────────────────────────────────────────────── */}
        <div className="w-full">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-2xl shadow-primary/30 mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-1 tracking-tight">Welcome Back</h2>
            <p className="text-sm text-slate-400">Sign in to continue your journey</p>
          </div>

          {/* Glass card — dark, matching dashboard */}
          <div className="relative bg-slate-800/70 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/40 p-6 lg:p-8 border border-slate-700/60 overflow-hidden">
            {/* Subtle top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            <div className="relative z-10">
              {/* Header */}
              <div className="mb-7">
                <h2 className="text-2xl font-bold text-slate-100 mb-1 flex items-center gap-2 tracking-tight">
                  Sign In <span>👋</span>
                </h2>
                <p className="text-sm text-slate-400">Enter your credentials to access your account</p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400 font-medium">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2 tracking-tight">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${emailError ? 'text-red-400' : focusedField === 'email' ? 'text-primary' : 'text-slate-500'}`} />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                      onFocus={() => setFocusedField('email')}
                      onBlur={handleEmailBlur}
                      required
                      placeholder="you@example.com"
                      className={`w-full pl-11 pr-4 py-3 bg-slate-900/60 border rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${emailError ? 'border-red-500/60 focus:ring-red-500/30' : 'border-slate-600/60 focus:border-primary/60 focus:ring-primary/20'}`}
                    />
                  </div>
                  {emailError && (
                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />{emailError}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2 tracking-tight">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${passwordError ? 'text-red-400' : focusedField === 'password' ? 'text-primary' : 'text-slate-500'}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setPasswordError('') }}
                      onFocus={() => setFocusedField('password')}
                      onBlur={handlePasswordBlur}
                      required
                      placeholder="Enter your password"
                      className={`w-full pl-11 pr-12 py-3 bg-slate-900/60 border rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${passwordError ? 'border-red-500/60 focus:ring-red-500/30' : 'border-slate-600/60 focus:border-primary/60 focus:ring-primary/20'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />{passwordError}
                    </p>
                  )}
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading || !!emailError || !!passwordError}
                  className="group relative w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm rounded-xl tracking-tight focus:outline-none focus:ring-4 focus:ring-primary/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-violet-600 to-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center justify-center gap-2">
                    {loading ? <ButtonSpinner /> : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-800/70 text-slate-500 font-medium text-xs tracking-wide">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="group w-full py-3.5 bg-slate-900/60 border border-slate-600/60 text-slate-200 font-semibold text-sm rounded-xl tracking-tight hover:bg-slate-700/60 hover:border-primary/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {googleLoading ? <ButtonSpinner /> : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Biometric */}
              {biometricAvailable && (
                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  disabled={biometricLoading}
                  className="group w-full py-3.5 mt-3 bg-slate-900/60 border border-primary/30 text-primary font-semibold text-sm rounded-xl tracking-tight hover:bg-primary/10 hover:border-primary/60 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                >
                  {biometricLoading ? <ButtonSpinner /> : (
                    <>
                      <Fingerprint className="w-5 h-5" />
                      <span>Sign in with Biometric</span>
                    </>
                  )}
                </button>
              )}

              {/* Register link */}
              <div className="mt-7 text-center">
                <p className="text-sm text-slate-500 mb-2">Don't have an account?</p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 text-primary hover:text-violet-400 font-semibold text-sm transition-all group tracking-tight"
                >
                  <span>Create an account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-600 text-xs mt-4 font-medium tracking-tight">
            Smart tracking with AI, voice & receipt scanning 💰✨
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  )
}

export default Login
