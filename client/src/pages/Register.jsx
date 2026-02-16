import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Wallet, Mail, Lock, User, UserPlus, AlertCircle, Eye, EyeOff, Shield, Zap, Target, CheckCircle, Sparkles, ArrowRight } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
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

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const password = formData.password
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    setPasswordStrength(Math.min(strength, 4))
  }, [formData.password])

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' })
    }
  }

  const validateField = (name, value) => {
    let error = ''
    
    switch (name) {
      case 'fullName':
        if (!value.trim()) error = 'Full name is required'
        else if (value.trim().length < 2) error = 'Name must be at least 2 characters'
        break
      case 'email':
        if (!value) error = 'Email is required'
        else if (!validateEmail(value)) error = 'Please enter a valid email'
        break
      case 'password':
        if (!value) error = 'Password is required'
        else if (value.length < 8) error = 'Password must be at least 8 characters'
        else if (!/[A-Z]/.test(value)) error = 'Password must contain an uppercase letter'
        else if (!/[a-z]/.test(value)) error = 'Password must contain a lowercase letter'
        else if (!/\d/.test(value)) error = 'Password must contain a number'
        else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) error = 'Password must contain a special character'
        break
      case 'confirmPassword':
        if (!value) error = 'Please confirm your password'
        else if (value !== formData.password) error = 'Passwords do not match'
        break
      default:
        break
    }
    
    return error
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setFocusedField(null)
    const error = validateField(name, value)
    if (error) {
      setFieldErrors({ ...fieldErrors, [name]: error })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const errors = {}
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key])
      if (error) errors[key] = error
    })

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      toast.error('Please fix the errors in the form', {
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#fff',
          color: '#1e293b',
        },
        iconTheme: {
          primary: '#ef4444',
          secondary: '#fff',
        },
      })
      return
    }

    setLoading(true)

    try {
      await register(formData.email, formData.password, formData.fullName)
      toast.success('Account created successfully!', {
        icon: '🎉',
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
        },
      })
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed'
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
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setGoogleLoading(true)

    try {
      await loginWithGoogle()
      toast.success('Account created successfully!', {
        icon: '✨',
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
        },
      })
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Google sign-in failed'
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

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200'
    if (passwordStrength <= 2) return 'bg-red-500'
    if (passwordStrength === 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return ''
    if (passwordStrength <= 2) return 'Weak'
    if (passwordStrength === 3) return 'Good'
    return 'Strong'
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-purple p-4 relative overflow-hidden font-sans antialiased">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-accent-pink rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-secondary-purple rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent-cyan rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-3000"></div>
      </div>

      <div className={`w-full max-w-5xl mx-auto grid lg:grid-cols-2 gap-6 items-center relative z-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Left Side - Form */}
        <div className="w-full order-2 lg:order-1">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">Join Us Today</h2>
            <p className="text-sm text-white/80 tracking-normal">Start your financial journey</p>
          </div>

          {/* Enhanced Glass Card */}
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 lg:p-8 border border-white/30 overflow-hidden font-sans">
            {/* Decorative corner gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2 tracking-tight">
                  Create Account
                  <span className="text-xl">🚀</span>
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">Start tracking your expenses today</p>
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
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${
                      fieldErrors.fullName ? 'text-red-500' : focusedField === 'fullName' ? 'text-primary-500 scale-110' : formData.fullName ? 'text-primary-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('fullName')}
                      onBlur={handleBlur}
                      required
                      placeholder="John Doe"
                      className={`input-auth ${fieldErrors.fullName ? 'input-auth-error' : ''}`}
                    />
                    {formData.fullName && !fieldErrors.fullName && (
                      <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                    {focusedField === 'fullName' && !fieldErrors.fullName && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/5 to-secondary-purple/5 pointer-events-none"></div>
                    )}
                  </div>
                  {fieldErrors.fullName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-medium animate-shake">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${
                      fieldErrors.email ? 'text-red-500' : focusedField === 'email' ? 'text-primary-500 scale-110' : formData.email ? 'text-primary-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={handleBlur}
                      required
                      placeholder="you@example.com"
                      className={`input-auth ${fieldErrors.email ? 'input-auth-error' : ''}`}
                    />
                    {formData.email && !fieldErrors.email && validateEmail(formData.email) && (
                      <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                    {focusedField === 'email' && !fieldErrors.email && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/5 to-secondary-purple/5 pointer-events-none"></div>
                    )}
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-medium animate-shake">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${
                      fieldErrors.password ? 'text-red-500' : focusedField === 'password' ? 'text-primary-500 scale-110' : formData.password ? 'text-primary-500' : 'text-gray-400'
                    }`} />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={handleBlur}
                      required
                      placeholder="Min. 6 characters"
                      className={`input-auth ${fieldErrors.password ? 'input-auth-error' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-all hover:scale-110"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {focusedField === 'password' && !fieldErrors.password && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/5 to-secondary-purple/5 pointer-events-none"></div>
                    )}
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-medium animate-shake">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.password}
                    </p>
                  )}
                  {/* Password Strength Indicator */}
                  {formData.password && !fieldErrors.password && (
                    <div className="mt-3">
                      <div className="flex gap-1.5 mb-2">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                              level <= passwordStrength ? getPasswordStrengthColor() : 'bg-gray-200'
                            }`}
                          ></div>
                        ))}
                      </div>
                      {getPasswordStrengthText() && (
                        <p className="text-xs text-gray-600 font-medium tracking-tight">
                          Password strength: <span className={`font-semibold ${
                            passwordStrength <= 2 ? 'text-red-600' : passwordStrength === 3 ? 'text-yellow-600' : 'text-green-600'
                          }`}>{getPasswordStrengthText()}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${
                      fieldErrors.confirmPassword ? 'text-red-500' : focusedField === 'confirmPassword' ? 'text-primary-500 scale-110' : formData.confirmPassword ? 'text-primary-500' : 'text-gray-400'
                    }`} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={handleBlur}
                      required
                      placeholder="Confirm your password"
                      className={`input-auth ${fieldErrors.confirmPassword ? 'input-auth-error' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-all hover:scale-110"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {formData.confirmPassword && formData.confirmPassword === formData.password && !fieldErrors.confirmPassword && (
                      <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                    {focusedField === 'confirmPassword' && !fieldErrors.confirmPassword && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/5 to-secondary-purple/5 pointer-events-none"></div>
                    )}
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-medium animate-shake">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || Object.keys(fieldErrors).some(key => fieldErrors[key])}
                  className="group relative w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-base rounded-xl tracking-tight focus:outline-none focus:ring-4 focus:ring-primary-500/50 transition-all duration-300 hover:scale-[1.02] hover:from-primary-600 hover:to-primary-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-secondary-purple to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Create Account</span>
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

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-2 tracking-normal">Already have an account?</p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-base sm:text-lg transition-all group tracking-tight"
                >
                  <span>Sign in to your account</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-white/90 text-xs mt-4 font-medium tracking-tight">
            Smart expense tracking with AI-powered insights 🚀✨
          </p>
        </div>

        {/* Right Side - Enhanced Branding */}
        <div className="hidden lg:block text-white space-y-6 order-1 lg:order-2">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 hover:scale-110 transition-transform duration-300">
              <Wallet className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span className="text-xs font-semibold text-yellow-300 uppercase tracking-widest">Start Your Journey</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-3">
                Financial
                <span className="block bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent mt-1 animate-gradient">
                  Freedom Awaits
                </span>
              </h1>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed tracking-normal">
                Track expenses with AI insights, voice commands, and receipt scanning
              </p>
            </div>
          </div>

          {/* Enhanced Feature Cards */}
          <div className="space-y-3">
            {[
              { icon: Shield, title: 'Budget Planning', desc: 'Smart budget recommendations', gradient: 'from-emerald-500 to-teal-600' },
              { icon: Zap, title: 'Spending Heatmap', desc: 'Visual expense calendar', gradient: 'from-amber-500 to-orange-600' },
              { icon: Target, title: 'Savings Goals', desc: 'Track financial milestones', gradient: 'from-blue-500 to-indigo-600' }
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
              { label: 'AI Assistant', icon: '🤖' },
              { label: 'Voice Input', icon: '🎤' },
              { label: 'Analytics', icon: '📊' },
              { label: 'Gamification', icon: '🎮' }
            ].map((feature, index) => (
              <div key={index} className="text-center p-2 bg-white/5 rounded-lg backdrop-blur-sm">
                <div className="text-2xl mb-1">{feature.icon}</div>
                <div className="text-xs text-white/90 font-medium tracking-tight">{feature.label}</div>
              </div>
            ))}
          </div>
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

export default Register
