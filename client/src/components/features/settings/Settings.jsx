import { useState, useEffect } from 'react'
import { User, Lock, Edit2, Save, X, Camera, Eye, EyeOff, Monitor, Smartphone, Sun, Moon, Palette } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import { Card, Button, Modal } from '../../ui'
import BiometricSettings from './BiometricSettings'
import api from '../../../services/api'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, setUser } = useAuth()
  const { theme, isDark, toggleTheme, setLightMode, setDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSessionsModal, setShowSessionsModal] = useState(false)
  const [sessions, setSessions] = useState([])
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    picture: user?.picture || ''
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ]

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form
      setProfileForm({
        fullName: user?.fullName || '',
        email: user?.email || '',
        picture: user?.picture || ''
      })
    }
    setIsEditing(!isEditing)
  }

  const handleSaveProfile = async () => {
    if (!profileForm.fullName.trim()) {
      toast.error('Full name is required')
      return
    }

    if (!profileForm.email.trim()) {
      toast.error('Email is required')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profileForm.email)) {
      toast.error('Invalid email format')
      return
    }

    setLoading(true)
    try {
      const response = await api.put('/users/profile', {
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
        picture: profileForm.picture
      })

      // Update user in context and localStorage
      const updatedUser = response.data.user
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))

      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileForm({ ...profileForm, picture: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required')
      return
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password')
      return
    }

    setLoading(true)
    try {
      await api.put('/users/change-password', {
        currentPassword,
        newPassword
      })

      toast.success('Password changed successfully!')
      setShowPasswordModal(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Change password error:', error)
      toast.error(error.response?.data?.error || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const fetchSessions = async () => {
    try {
      const response = await api.get('/users/sessions')
      setSessions(response.data.sessions || [])
    } catch (error) {
      console.error('Fetch sessions error:', error)
      toast.error('Failed to load sessions')
    }
  }

  const handleViewSessions = () => {
    setShowSessionsModal(true)
    fetchSessions()
  }

  const handleRevokeSession = async (sessionId) => {
    try {
      await api.delete(`/users/sessions/${sessionId}`)
      toast.success('Session revoked successfully')
      fetchSessions()
    } catch (error) {
      console.error('Revoke session error:', error)
      toast.error('Failed to revoke session')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-slate-100 mb-2 tracking-tight">Settings</h1>
        <p className="text-gray-600 dark:text-slate-400 text-lg">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
        <nav className="flex space-x-4 sm:space-x-8 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-sm sm:text-base transition-all whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-500'
                  }
                `}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card
              title="Profile Information"
              subtitle="Update your personal details"
              action={
                !isEditing ? (
                  <Button
                    variant="primary"
                    size="md"
                    icon={Edit2}
                    onClick={handleEditToggle}
                    className="w-full sm:w-auto"
                  >
                    <span className="hidden sm:inline">Edit Profile</span>
                    <span className="sm:hidden">Edit</span>
                  </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="md"
                      icon={Save}
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="w-full sm:w-auto"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      icon={X}
                      onClick={handleEditToggle}
                      disabled={loading}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                  </div>
                )
              }
            >
              {/* Profile Picture */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200 dark:border-slate-700">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center overflow-hidden shadow-lg">
                    {profileForm.picture ? (
                      <img
                        src={profileForm.picture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-all shadow-lg hover:scale-110">
                      <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100 mb-1 tracking-tight">
                    {user?.fullName || 'User'}
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 mb-2 sm:mb-3 break-all">{user?.email}</p>
                  {isEditing && (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                      Click the camera icon to upload a new profile picture (max 2MB)
                    </p>
                  )}
                </div>
              </div>

              {/* Profile Form */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    readOnly={!isEditing}
                    className={`input w-full ${!isEditing ? 'bg-gray-50 dark:bg-slate-700/50' : ''}`}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    readOnly={!isEditing}
                    className={`input w-full ${!isEditing ? 'bg-gray-50 dark:bg-slate-700/50' : ''}`}
                    placeholder="Enter your email"
                  />
                  {isEditing && (
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                      Changing your email will require verification
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">
                    Account Type
                  </label>
                  <input
                    type="text"
                    value="Email Account"
                    readOnly
                    className="input w-full bg-gray-50 dark:bg-slate-700/50"
                  />
                </div>
              </div>
            </Card>

            {/* Account Stats */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-700/80 border-2 border-blue-200 dark:border-slate-600">
              <h4 className="font-semibold text-blue-900 dark:text-slate-100 mb-4 text-base sm:text-lg tracking-tight">Account Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-sm sm:text-base text-blue-700 dark:text-slate-400 mb-2 font-medium">Member Since</p>
                  <p className="text-lg sm:text-xl font-semibold text-blue-900 dark:text-slate-100 tracking-tight">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700 dark:text-slate-400 mb-2 font-medium">Last Login</p>
                  <p className="text-xl font-semibold text-blue-900 dark:text-slate-100 tracking-tight">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <Card>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-1 tracking-tight">Theme</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">Choose how Smart Expense Tracker looks to you</p>
              </div>

              {/* Theme Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {/* Light Mode Card */}
                <button
                  onClick={setLightMode}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${!isDark
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                >
                  {!isDark && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {/* Preview */}
                  <div className="w-full h-24 bg-white border border-gray-200 rounded-lg mb-3 overflow-hidden shadow-sm">
                    <div className="h-6 bg-white border-b border-gray-200 flex items-center px-2 gap-1">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                    </div>
                    <div className="flex h-[4.5rem]">
                      <div className="w-8 bg-gray-50 border-r border-gray-200 flex flex-col gap-1 p-1">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-2 bg-gray-200 rounded" />)}
                      </div>
                      <div className="flex-1 p-2 flex flex-col gap-1">
                        {[...Array(2)].map((_, i) => <div key={i} className="h-2 bg-gray-100 rounded" />)}
                        <div className="h-4 bg-blue-100 rounded w-2/3 mt-1" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold text-sm text-gray-900 dark:text-slate-100">Light Mode</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Classic bright interface</p>
                </button>

                {/* Dark Mode Card */}
                <button
                  onClick={setDarkMode}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${isDark
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                >
                  {isDark && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {/* Preview */}
                  <div className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg mb-3 overflow-hidden shadow-sm">
                    <div className="h-6 bg-slate-800 border-b border-slate-700 flex items-center px-2 gap-1">
                      <div className="w-2 h-2 bg-slate-600 rounded-full" />
                      <div className="w-2 h-2 bg-slate-600 rounded-full" />
                      <div className="w-2 h-2 bg-slate-600 rounded-full" />
                    </div>
                    <div className="flex h-[4.5rem]">
                      <div className="w-8 bg-slate-800 border-r border-slate-700 flex flex-col gap-1 p-1">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-2 bg-slate-600 rounded" />)}
                      </div>
                      <div className="flex-1 p-2 flex flex-col gap-1">
                        {[...Array(2)].map((_, i) => <div key={i} className="h-2 bg-slate-700 rounded" />)}
                        <div className="h-4 bg-primary/30 rounded w-2/3 mt-1" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-sm text-gray-900 dark:text-slate-100">Dark Mode</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Easy on the eyes at night</p>
                </button>
              </div>

              {/* Quick Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-indigo-600 rounded-xl flex items-center justify-center shadow">
                    {isDark ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm">Quick Toggle</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Currently: <span className="font-medium text-primary">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                    </p>
                  </div>
                </div>
                {/* Toggle Switch */}
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20 ${isDark ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  role="switch"
                  aria-checked={isDark}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isDark ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Password Section */}
            <Card>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Lock className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 tracking-tight">
                        Password
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        Last changed: {user?.passwordChangedAt ? new Date(user.passwordChangedAt).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-slate-400 ml-18">
                    Change your password regularly to keep your account secure.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowPasswordModal(true)}
                  className="ml-4"
                >
                  Change Password
                </Button>
              </div>
            </Card>

            {/* Biometric Authentication Section */}
            <BiometricSettings />

            {/* Sessions Section */}
            <Card>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                      <Monitor className="w-7 h-7 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 tracking-tight">
                        Active Sessions
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        {sessions.length || 1} active session{sessions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-slate-400 ml-18">
                    Manage and monitor your active sessions across different devices.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleViewSessions}
                  className="ml-4"
                >
                  View Sessions
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false)
          setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          })
        }}
        title="Change Password"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="input w-full pr-10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
              >
                {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="input w-full pr-10"
                placeholder="Enter new password (min 6 characters)"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
              >
                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="input w-full pr-10"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
              >
                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleChangePassword}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordModal(false)
                setPasswordForm({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                })
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Sessions Modal */}
      <Modal
        isOpen={showSessionsModal}
        onClose={() => setShowSessionsModal(false)}
        title="Active Sessions"
      >
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-gray-500 dark:text-slate-400 text-center py-8">No active sessions found</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {session.device.includes('Mobile') ? (
                        <Smartphone className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Monitor className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-slate-100">
                        {session.device}
                        {session.current && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{session.browser}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        IP: {session.ip} • Last active: {new Date(session.lastActive).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  )
}

export default Settings
