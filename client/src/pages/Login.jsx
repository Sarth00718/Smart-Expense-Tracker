import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { biometricService, isBiometricSupported } from '../services/biometricService'
import toast from 'react-hot-toast'
import { Wallet, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, TrendingUp, Shield, Zap, Sparkles, ArrowRight, Fingerprint } from 'lucide-react'
import { ButtonSpinner } from '../components/ui/LoadingSpinner'
import { Button, Input } from '../components/ui'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricLoading, setBiometricLoading] = useState(false)
  const { login, loginWithGoogle, setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isBiometricSupported() && biometricService.isRegistered()) {
      setBiometricAvailable(true)
    }
  }, [])

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

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
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Login failed. Please try again.'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally { setLoading(false) }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Google sign-in failed.'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally { setGoogleLoading(false) }
  }

  const handleBiometricLogin = async () => {
    setError('')
    setBiometricLoading(true)
    try {
      const result = await biometricService.authenticate()
      if (result.user) setUser(result.user)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = err.message || 'Biometric authentication failed'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally { setBiometricLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/5 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="w-full flex items-center justify-center relative z-10">
        <div className="w-full max-w-[1400px] mx-auto grid lg:grid-cols-[1.2fr,1fr] gap-0 min-h-screen">
          <div className="hidden lg:flex flex-col justify-center px-16 xl:px-24 py-12 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-r border-border">
            <div className="max-w-xl">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center shadow-lg shadow-primary/20">
                    <Wallet className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Smart Expense Tracker</h1>
                    <p className="text-sm text-muted-foreground">Financial Intelligence Platform</p>
                  </div>
                </div>

                <div className="mb-12">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-6">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Welcome Back</span>
                  </div>
                  <h2 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight mb-4">
                    Take Control of Your
                    <span className="block bg-gradient-to-r from-primary via-purple-400 to-pink-500 bg-clip-text text-transparent mt-2">
                      Financial Future
                    </span>
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    AI-powered expense tracking with intelligent insights, voice commands, and automated receipt scanning.
                  </p>
                </div>

                <div className="space-y-4 mb-12">
                  {[
                    { icon: TrendingUp, title: 'AI-Powered Analytics', desc: 'Smart insights and personalized recommendations' },
                    { icon: Shield, title: 'Secure & Private', desc: 'Bank-level encryption for your financial data' },
                    { icon: Zap, title: 'Lightning Fast', desc: 'Add expenses in seconds with voice or scan' },
                  ].map((feature, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex items-start gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-purple-600/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-foreground font-semibold mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-full max-w-md mx-auto">
              <div className="lg:hidden text-center mb-10">
                <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-700 items-center justify-center shadow-lg shadow-primary/20 mb-4">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
                <p className="text-muted-foreground">Sign in to your account</p>
              </div>

              <div className="mb-8">
                <h3 className="text-3xl font-bold text-foreground mb-2">Sign In</h3>
                <p className="text-muted-foreground">Enter your credentials to access your account</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2">Email Address</label>
                  <Input 
                    type="email" 
                    id="email" 
                    value={email} 
                    onChange={(e) => { setEmail(e.target.value); setEmailError('') }} 
                    required 
                    placeholder="you@example.com"
                    icon={Mail}
                    error={emailError}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-2">Password</label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? 'text' : 'password'} 
                      id="password" 
                      value={password} 
                      onChange={(e) => { setPassword(e.target.value); setPasswordError('') }} 
                      required 
                      placeholder="Enter your password"
                      icon={Lock}
                      error={passwordError}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10" style={{ transform: passwordError ? 'translateY(-140%)' : 'translateY(-50%)' }}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading || !!emailError || !!passwordError}
                  className="group relative w-full py-4 bg-gradient-to-r from-primary to-purple-700 text-primary-foreground font-semibold rounded-xl focus:outline-none focus:ring-4 focus:ring-ring/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-purple-600 to-purple-700/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center justify-center gap-2">
                    {loading ? <ButtonSpinner /> : <><LogIn className="w-5 h-5" /><span>Sign In</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                  </div>
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center"><span className="px-4 bg-background text-muted-foreground text-sm">Or continue with</span></div>
              </div>

              <div className="space-y-3">
                <button type="button" onClick={handleGoogleLogin} disabled={googleLoading}
                  className="w-full py-3.5 bg-background border border-input text-foreground font-medium rounded-xl hover:bg-muted/50 hover:border-ring/40 focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                  {googleLoading ? <ButtonSpinner /> : (
                    <><svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg><span>Continue with Google</span></>
                  )}
                </button>
                {biometricAvailable && (
                  <button type="button" onClick={handleBiometricLogin} disabled={biometricLoading}
                    className="w-full py-3.5 bg-background border border-primary/30 text-primary font-medium rounded-xl hover:bg-primary/5 hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                    {biometricLoading ? <ButtonSpinner /> : <><Fingerprint className="w-5 h-5" /><span>Sign in with Biometric</span></>}
                  </button>
                )}
              </div>

              <div className="mt-8 text-center">
                <p className="text-muted-foreground text-sm">Don't have an account? <Link to="/register" className="text-primary hover:text-purple-600 font-semibold transition-colors">Create account</Link></p>
              </div>
              <p className="text-center text-muted-foreground/50 text-xs mt-8">© {new Date().getFullYear()} Smart Expense Tracker. All rights reserved.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
