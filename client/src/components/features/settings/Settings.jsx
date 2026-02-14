import { useState, useEffect } from 'react'
import { User, Bell, Lock, Edit2, Save, X, Camera, Eye, EyeOff, Monitor, Smartphone, Fingerprint } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { Card, Button, Modal } from '../../ui'
import BiometricSettings from './BiometricSettings'
import api from '../../../services/api'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, setUser } = useAuth()
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
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-2 tracking-tight">Settings</h1>
        <p className="text-gray-600 text-lg">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-base transition-all
                  ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
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
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="md"
                      icon={Save}
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      icon={X}
                      onClick={handleEditToggle}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                )
              }
            >
              {/* Profile Picture */}
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center overflow-hidden shadow-lg">
                    {profileForm.picture ? (
                      <img
                        src={profileForm.picture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-14 h-14 text-white" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-all shadow-lg hover:scale-110">
                      <Camera className="w-5 h-5 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-1 tracking-tight">
                    {user?.fullName || 'User'}
                  </h4>
                  <p className="text-gray-600 mb-3">{user?.email}</p>
                  {isEditing && (
                    <p className="text-sm text-gray-500">
                      Click the camera icon to upload a new profile picture (max 2MB)
                    </p>
                  )}
                </div>
              </div>

              {/* Profile Form */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    readOnly={!isEditing}
                    className={`input w-full ${!isEditing ? 'bg-gray-50' : ''}`}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    readOnly={!isEditing}
                    className={`input w-full ${!isEditing ? 'bg-gray-50' : ''}`}
                    placeholder="Enter your email"
                  />
                  {isEditing && (
                    <p className="text-sm text-gray-500 mt-2">
                      Changing your email will require verification
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                    Account Type
                  </label>
                  <input
                    type="text"
                    value="Email Account"
                    readOnly
                    className="input w-full bg-gray-50"
                  />
                </div>
              </div>
            </Card>

            {/* Account Stats */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-4 text-lg tracking-tight">Account Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-blue-700 mb-2 font-medium">Member Since</p>
                  <p className="text-xl font-semibold text-blue-900 tracking-tight">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700 mb-2 font-medium">Last Login</p>
                  <p className="text-xl font-semibold text-blue-900 tracking-tight">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
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
                      <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
                        Password
                      </h3>
                      <p className="text-sm text-gray-500">
                        Last changed: {user?.passwordChangedAt ? new Date(user.passwordChangedAt).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 ml-18">
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
                      <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
                        Active Sessions
                      </h3>
                      <p className="text-sm text-gray-500">
                        {sessions.length || 1} active session{sessions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 ml-18">
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
            <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
            <p className="text-gray-500 text-center py-8">No active sessions found</p>
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
                      <h4 className="font-semibold text-gray-900">
                        {session.device}
                        {session.current && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{session.browser}</p>
                      <p className="text-xs text-gray-500 mt-1">
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
