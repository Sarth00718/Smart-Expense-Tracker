import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Wallet, Mail, Lock, User, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react'

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
  const { register, googleLogin } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.fullName.trim()) {
      setError('Full name is required')
      toast.error('Full name is required')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await register(formData.email, formData.password, formData.fullName)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed'
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
      toast.success('Account created successfully!')
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
              Create Account
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Start tracking your expenses today
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="input pl-11"
                />
              </div>
            </div>

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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Min. 6 characters"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                  className="input pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
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
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Create Account
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
              <span className="px-3 sm:px-4 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm sm:text-base text-primary hover:text-primary-dark font-semibold transition-colors"
            >
              Sign in instead
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/80 text-xs sm:text-sm mt-4 sm:mt-6">
          Join thousands tracking their expenses 🚀
        </p>
      </div>
    </div>
  )
}

export default Register
