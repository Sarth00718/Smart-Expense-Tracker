import React, { useState, useEffect } from 'react'
import { Shield, User, Bell, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import TwoFactorSetup from './TwoFactorSetup'
import api from '../services/api'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('security')
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [twoFAStatus, setTwoFAStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load2FAStatus()
  }, [])

  const load2FAStatus = async () => {
    try {
      const response = await api.get('/2fa/status')
      setTwoFAStatus(response.data)
    } catch (error) {
      console.error('Failed to load 2FA status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handle2FASuccess = () => {
    setShow2FASetup(false)
    load2FAStatus()
    toast.success('2FA settings updated successfully!')
  }

  const tabs = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
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
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
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
        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* 2FA Section */}
            <div className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Two-Factor Authentication
                      </h3>
                      {loading ? (
                        <p className="text-sm text-gray-500">Loading...</p>
                      ) : twoFAStatus?.enabled ? (
                        <p className="text-sm text-green-600">
                          ✓ Enabled ({twoFAStatus.method === 'email' ? 'Email OTP' : 'Authenticator App'})
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Not enabled
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 ml-15">
                    Add an extra layer of security to your account. You'll need to enter a code in addition to your password when signing in.
                  </p>
                </div>
                <button
                  onClick={() => setShow2FASetup(true)}
                  disabled={loading}
                  className="btn btn-primary ml-4"
                >
                  {twoFAStatus?.enabled ? 'Manage' : 'Enable'} 2FA
                </button>
              </div>
            </div>

            {/* Password Section */}
            <div className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Lock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Password
                      </h3>
                      <p className="text-sm text-gray-500">
                        Last changed: Never
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 ml-15">
                    Change your password regularly to keep your account secure.
                  </p>
                </div>
                <button
                  className="btn btn-secondary ml-4"
                  onClick={() => toast.info('Password change feature coming soon!')}
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Sessions Section */}
            <div className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Bell className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Active Sessions
                      </h3>
                      <p className="text-sm text-gray-500">
                        1 active session
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 ml-15">
                    Manage and monitor your active sessions across different devices.
                  </p>
                </div>
                <button
                  className="btn btn-secondary ml-4"
                  onClick={() => toast.info('Session management coming soon!')}
                >
                  View Sessions
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Appearance Tab - REMOVED */}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Profile Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={user?.fullName || ''}
                    readOnly
                    className="input w-full bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="input w-full bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <input
                    type="text"
                    value={user?.googleId ? 'Google Account' : 'Email Account'}
                    readOnly
                    className="input w-full bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <div className="card bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">
                    Profile Editing
                  </h4>
                  <p className="text-sm text-yellow-800">
                    Profile editing features are coming soon. You'll be able to update your name, email, and profile picture.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2FA Setup Modal */}
      {show2FASetup && (
        <TwoFactorSetup
          onClose={() => setShow2FASetup(false)}
          onSuccess={handle2FASuccess}
        />
      )}
    </div>
  )
}

export default Settings
