import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Wallet, Mail, Lock, User, UserPlus, AlertCircle, Eye, EyeOff, Shield, Zap, Target, CheckCircle, Sparkles, ArrowRight } from 'lucide-react'
import { ButtonSpinner } from '../components/ui/LoadingSpinner'

const Register = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [fieldErrors, setFieldErrors] = useState({})
  const [focusedField, setFocusedField] = useState(null)
  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

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

  return (
    <div className="min-h-screen flex bg-[#0f172a] relative overflow-hidden font-sans antialiased">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-secondary/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="w-full flex items-center justify-center relative z-10">
        <div className="w-full max-w-[1400px] mx-auto grid lg:grid-cols-[1fr,1.2fr] gap-0 min-h-screen">

          <div className="hidden lg:flex flex-col justify-center px-16 xl:px-24 py-12 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm border-r border-slate-700/50">
            <div className="max-w-xl">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Wallet className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Smart Expense Tracker</h1>
                  <p className="text-sm text-slate-400">Financial Intelligence Platform</p>
                </div>
              </div>

              <div className="mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Start Your Journey</span>
                </div>
                <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
                  Master Your Money
                  <span className="block bg-gradient-to-r from-primary via-violet-400 to-secondary bg-clip-text text-transparent mt-2">
                    Build Wealth Smarter
                  </span>
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed">
                  Join thousands of users who are taking control of their finances with AI-powered insights and automation.
                </p>
              </div>

              <div className="space-y-4 mb-12">
                {[
                  { icon: Shield, title: 'Smart Budgeting', desc: 'AI-powered budget recommendations and alerts' },
                  { icon: Zap, title: 'Quick Entry', desc: 'Voice commands and receipt scanning' },
                  { icon: Target, title: 'Goal Tracking', desc: 'Set and achieve your financial milestones' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-slate-400">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Features */}
              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-700/50">
                {[
                  { icon: '🤖', label: 'AI Assistant' },
                  { icon: '🎤', label: 'Voice Input' },
                  { icon: '📄', label: 'PDF Reports' },
                  { icon: '🏆', label: 'Achievements' },
                ].map((feature, i) => (
                  <div key={i} className="text-center p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
                    <div className="text-2xl mb-1">{feature.icon}</div>
                    <div className="text-xs text-slate-400 font-medium">{feature.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
            <div className="w-full max-w-md mx-auto">
              <div className="lg:hidden text-center mb-10">
                <div className="inline-flex w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl items-center justify-center shadow-lg shadow-primary/20 mb-4">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Join Us Today</h2>
                <p className="text-slate-400">Create your account</p>
              </div>

              <div className="mb-8">
                <h3 className="text-3xl font-bold text-white mb-2">Create Account</h3>
                <p className="text-slate-400">Start your financial journey today</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400 font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <div className="relative">
                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${fieldErrors.fullName ? 'text-red-400' : focusedField === 'fullName' ? 'text-primary' : 'text-slate-500'}`} />
                    <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} onFocus={() => setFocusedField('fullName')} onBlur={handleBlur} required placeholder="John Doe" className={`w-full pl-12 pr-12 py-3.5 bg-slate-900/60 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${fieldErrors.fullName ? 'border-red-500/60 focus:ring-red-500/30' : 'border-slate-700 focus:border-primary focus:ring-primary/20'}`} />
                    {formData.fullName && !fieldErrors.fullName && <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />}
                  </div>
                  {fieldErrors.fullName && <p className="mt-2 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{fieldErrors.fullName}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${fieldErrors.email ? 'text-red-400' : focusedField === 'email' ? 'text-primary' : 'text-slate-500'}`} />
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} onFocus={() => setFocusedField('email')} onBlur={handleBlur} required placeholder="you@example.com" className={`w-full pl-12 pr-12 py-3.5 bg-slate-900/60 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${fieldErrors.email ? 'border-red-500/60 focus:ring-red-500/30' : 'border-slate-700 focus:border-primary focus:ring-primary/20'}`} />
                    {formData.email && !fieldErrors.email && validateEmail(formData.email) && <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />}
                  </div>
                  {fieldErrors.email && <p className="mt-2 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{fieldErrors.email}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${fieldErrors.password ? 'text-red-400' : focusedField === 'password' ? 'text-primary' : 'text-slate-500'}`} />
                    <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} onFocus={() => setFocusedField('password')} onBlur={handleBlur} required placeholder="Min. 8 characters" className={`w-full pl-12 pr-12 py-3.5 bg-slate-900/60 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${fieldErrors.password ? 'border-red-500/60 focus:ring-red-500/30' : 'border-slate-700 focus:border-primary focus:ring-primary/20'}`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="mt-2 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{fieldErrors.password}</p>}
                  {formData.password && !fieldErrors.password && (
                    <div className="mt-3">
                      <div className="flex gap-1.5 mb-2">
                        {[1, 2, 3, 4].map(l => <div key={l} className={`h-2 flex-1 rounded-full transition-all duration-300 ${l <= passwordStrength ? strengthColor : 'bg-slate-700'}`} />)}
                      </div>
                      {strengthText && <p className="text-xs text-slate-400">Password strength: <span className={`font-semibold ${strengthTextColor}`}>{strengthText}</span></p>}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${fieldErrors.confirmPassword ? 'text-red-400' : focusedField === 'confirmPassword' ? 'text-primary' : 'text-slate-500'}`} />
                    <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onFocus={() => setFocusedField('confirmPassword')} onBlur={handleBlur} required placeholder="Confirm your password" className={`w-full pl-12 pr-20 py-3.5 bg-slate-900/60 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${fieldErrors.confirmPassword ? 'border-red-500/60 focus:ring-red-500/30' : 'border-slate-700 focus:border-primary focus:ring-primary/20'}`} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {formData.confirmPassword && formData.confirmPassword === formData.password && !fieldErrors.confirmPassword && <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />}
                  </div>
                  {fieldErrors.confirmPassword && <p className="mt-2 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{fieldErrors.confirmPassword}</p>}
                </div>

                <button type="submit" disabled={loading || Object.values(fieldErrors).some(Boolean)} className="group relative w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-violet-600 to-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center justify-center gap-2">
                    {loading ? <ButtonSpinner /> : (<><UserPlus className="w-5 h-5" /><span>Create Account</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>)}
                  </div>
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700" /></div>
                <div className="relative flex justify-center"><span className="px-4 bg-[#0f172a] text-slate-500 text-sm">Or continue with</span></div>
              </div>

              <button type="button" onClick={handleGoogleLogin} disabled={googleLoading} className="w-full py-3.5 bg-slate-900/60 border border-slate-700 text-white font-medium rounded-xl hover:bg-slate-800/60 hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
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

              <div className="mt-8 text-center">
                <p className="text-slate-400 text-sm">Already have an account? <Link to="/login" className="text-primary hover:text-violet-400 font-semibold transition-colors">Sign in</Link></p>
              </div>

              <p className="text-center text-slate-600 text-xs mt-8">© {new Date().getFullYear()} Smart Expense Tracker. All rights reserved.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Register
