import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Wallet, Mail, Lock, User, UserPlus, AlertCircle, Eye, EyeOff, Shield, Zap, Target, CheckCircle, Sparkles, ArrowRight } from 'lucide-react'

const ButtonSpinner = () => (
  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
)

const Register = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [fieldErrors, setFieldErrors] = useState({})
  const [focusedField, setFocusedField] = useState(null)
  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const p = formData.password
    let s = 0
    if (p.length >= 8) s++
    if (p.length >= 12) s++
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++
    if (/\d/.test(p)) s++
    if (/[^a-zA-Z0-9]/.test(p)) s++
    setPasswordStrength(Math.min(s, 4))
  }, [formData.password])

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (fieldErrors[name]) setFieldErrors({ ...fieldErrors, [name]: '' })
  }

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName': return !value.trim() ? 'Full name is required' : value.trim().length < 2 ? 'Name must be at least 2 characters' : ''
      case 'email': return !value ? 'Email is required' : !validateEmail(value) ? 'Please enter a valid email' : ''
      case 'password':
        if (!value) return 'Password is required'
        if (value.length < 8) return 'Password must be at least 8 characters'
        if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter'
        if (!/[a-z]/.test(value)) return 'Password must contain a lowercase letter'
        if (!/\d/.test(value)) return 'Password must contain a number'
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Password must contain a special character'
        return ''
      case 'confirmPassword': return !value ? 'Please confirm your password' : value !== formData.password ? 'Passwords do not match' : ''
      default: return ''
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setFocusedField(null)
    const err = validateField(name, value)
    if (err) setFieldErrors({ ...fieldErrors, [name]: err })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const errors = {}
    Object.keys(formData).forEach(key => { const err = validateField(key, formData[key]); if (err) errors[key] = err })
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); toast.error('Please fix the errors in the form'); return }
    setLoading(true)
    try {
      await register(formData.email, formData.password, formData.fullName)
      toast.success('Account created successfully! 🎉', { duration: 3000 })
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed'
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
      toast.success('Account created successfully! ✨', { duration: 3000 })
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Google sign-in failed'
      setError(errorMsg)
      toast.error(errorMsg, { duration: 4000 })
    } finally {
      setGoogleLoading(false)
    }
  }

  const strengthColor = passwordStrength === 0 ? 'bg-slate-700' : passwordStrength <= 2 ? 'bg-red-500' : passwordStrength === 3 ? 'bg-yellow-500' : 'bg-green-500'
  const strengthText = passwordStrength === 0 ? '' : passwordStrength <= 2 ? 'Weak' : passwordStrength === 3 ? 'Good' : 'Strong'
  const strengthTextColor = passwordStrength <= 2 ? 'text-red-400' : passwordStrength === 3 ? 'text-yellow-400' : 'text-green-400'

  const inputClass = (field) => `w-full pl-11 pr-4 py-3 bg-slate-900/60 border rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${fieldErrors[field] ? 'border-red-500/60 focus:ring-red-500/30' : 'border-slate-600/60 focus:border-primary/60 focus:ring-primary/20'}`

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden font-sans antialiased">
      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[160px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      <div className={`w-full max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-center relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

        {/* ── Left: Register Form ────────────────────────────────────────────── */}
        <div className="w-full order-2 lg:order-1">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-2xl shadow-primary/30 mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-1 tracking-tight">Join Us Today</h2>
            <p className="text-sm text-slate-400">Start your financial journey</p>
          </div>

          {/* Dark glass card */}
          <div className="relative bg-slate-800/70 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/40 p-6 lg:p-8 border border-slate-700/60 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            <div className="relative z-10">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-100 mb-1 flex items-center gap-2 tracking-tight">
                  Create Account <span>🚀</span>
                </h2>
                <p className="text-sm text-slate-400">Start tracking your expenses today</p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400 font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-slate-300 mb-2 tracking-tight">Full Name</label>
                  <div className="relative">
                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${fieldErrors.fullName ? 'text-red-400' : focusedField === 'fullName' ? 'text-primary' : 'text-slate-500'}`} />
                    <input
                      type="text" id="fullName" name="fullName" value={formData.fullName}
                      onChange={handleChange} onFocus={() => setFocusedField('fullName')} onBlur={handleBlur}
                      required placeholder="John Doe" className={inputClass('fullName')}
                    />
                    {formData.fullName && !fieldErrors.fullName && (
                      <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                    )}
                  </div>
                  {fieldErrors.fullName && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{fieldErrors.fullName}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2 tracking-tight">Email Address</label>
                  <div className="relative">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${fieldErrors.email ? 'text-red-400' : focusedField === 'email' ? 'text-primary' : 'text-slate-500'}`} />
                    <input
                      type="email" id="email" name="email" value={formData.email}
                      onChange={handleChange} onFocus={() => setFocusedField('email')} onBlur={handleBlur}
                      required placeholder="you@example.com" className={inputClass('email')}
                    />
                    {formData.email && !fieldErrors.email && validateEmail(formData.email) && (
                      <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                    )}
                  </div>
                  {fieldErrors.email && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{fieldErrors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2 tracking-tight">Password</label>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${fieldErrors.password ? 'text-red-400' : focusedField === 'password' ? 'text-primary' : 'text-slate-500'}`} />
                    <input
                      type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password}
                      onChange={handleChange} onFocus={() => setFocusedField('password')} onBlur={handleBlur}
                      required placeholder="Min. 8 characters" className={`${inputClass('password')} pr-12`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{fieldErrors.password}</p>}
                  {formData.password && !fieldErrors.password && (
                    <div className="mt-2">
                      <div className="flex gap-1.5 mb-1">
                        {[1, 2, 3, 4].map(l => (
                          <div key={l} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${l <= passwordStrength ? strengthColor : 'bg-slate-700'}`} />
                        ))}
                      </div>
                      {strengthText && (
                        <p className="text-xs text-slate-500">Strength: <span className={`font-semibold ${strengthTextColor}`}>{strengthText}</span></p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-300 mb-2 tracking-tight">Confirm Password</label>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${fieldErrors.confirmPassword ? 'text-red-400' : focusedField === 'confirmPassword' ? 'text-primary' : 'text-slate-500'}`} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword}
                      onChange={handleChange} onFocus={() => setFocusedField('confirmPassword')} onBlur={handleBlur}
                      required placeholder="Confirm your password" className={`${inputClass('confirmPassword')} pr-20`}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {formData.confirmPassword && formData.confirmPassword === formData.password && !fieldErrors.confirmPassword && (
                      <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                    )}
                  </div>
                  {fieldErrors.confirmPassword && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{fieldErrors.confirmPassword}</p>}
                </div>

                {/* Create Account Button */}
                <button
                  type="submit"
                  disabled={loading || Object.values(fieldErrors).some(Boolean)}
                  className="group relative w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm rounded-xl tracking-tight focus:outline-none focus:ring-4 focus:ring-primary/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-violet-600 to-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center justify-center gap-2">
                    {loading ? <ButtonSpinner /> : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-800/70 text-slate-500 font-medium text-xs tracking-wide">Or continue with</span>
                </div>
              </div>

              {/* Google */}
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

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500 mb-2">Already have an account?</p>
                <Link to="/login" className="inline-flex items-center gap-2 text-primary hover:text-violet-400 font-semibold text-sm transition-all group tracking-tight">
                  <span>Sign in to your account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-slate-600 text-xs mt-4 font-medium tracking-tight">
            Smart expense tracking with AI-powered insights 🚀✨
          </p>
        </div>

        {/* ── Right: Branding Panel ──────────────────────────────────────────── */}
        <div className="hidden lg:flex flex-col gap-8 text-white order-1 lg:order-2">
          <div className="space-y-5">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-2xl shadow-primary/30">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-xs font-semibold text-yellow-400 uppercase tracking-widest">Start Your Journey</span>
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight mb-3 text-slate-100">
                Financial
                <span className="block bg-gradient-to-r from-primary via-violet-400 to-secondary bg-clip-text text-transparent mt-1">
                  Freedom Awaits
                </span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed">
                Track expenses with AI insights, voice commands, and receipt scanning
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { icon: Shield, title: 'Budget Planning', desc: 'Smart budget recommendations', gradient: 'from-emerald-500 to-teal-600' },
              { icon: Zap, title: 'Spending Heatmap', desc: 'Visual expense calendar', gradient: 'from-amber-500 to-orange-600' },
              { icon: Target, title: 'Savings Goals', desc: 'Track financial milestones', gradient: 'from-primary to-secondary' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/60 hover:border-primary/40 hover:bg-slate-800 transition-all duration-300 group cursor-default">
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

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700/60">
            {[
              { label: 'AI Assistant', icon: '🤖' },
              { label: 'Voice Input', icon: '🎤' },
              { label: 'Analytics', icon: '📊' },
              { label: 'Gamification', icon: '🎮' },
            ].map((f, i) => (
              <div key={i} className="text-center p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
                <div className="text-2xl mb-1">{f.icon}</div>
                <div className="text-xs text-slate-400 font-medium">{f.label}</div>
              </div>
            ))}
          </div>
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

export default Register
