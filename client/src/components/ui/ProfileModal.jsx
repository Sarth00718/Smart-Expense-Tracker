import { useState, useEffect } from 'react'
import { User, Mail, Calendar, Shield, X } from 'lucide-react'
import { Modal } from './index'
import api from '../../services/api'

const ProfileModal = ({ isOpen, onClose, user }) => {
  const [stats, setStats] = useState({ expenses: 0, budgets: 0, goals: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && user) {
      fetchStats()
    }
  }, [isOpen, user])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users/profile/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching profile stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatMemberSince = (date) => {
    if (!date) return 'Recently'
    try {
      const memberDate = new Date(date)
      return memberDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } catch (error) {
      return 'Recently'
    }
  }

  const getAuthBadge = () => {
    if (!user?.authProvider) return null
    
    switch (user.authProvider) {
      case 'firebase':
        return { text: 'Google Auth', color: 'bg-blue-100 text-blue-700' }
      case 'local':
        return { text: 'Email Auth', color: 'bg-green-100 text-green-700' }
      case 'both':
        return { text: 'Multi-Auth', color: 'bg-purple-100 text-purple-700' }
      default:
        return { text: 'Verified', color: 'bg-green-100 text-green-700' }
    }
  }

  const authBadge = getAuthBadge()

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-[#3a0ca3] rounded-full flex items-center justify-center mx-auto mb-4">
            {user?.picture ? (
              <img 
                src={user.picture} 
                alt={user?.fullName || 'User'} 
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1 tracking-tight">
            {user?.fullName || 'User'}
          </h2>
          <div className="flex gap-2 justify-center">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full tracking-tight">
              Active User
            </span>
            {authBadge && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full tracking-tight ${authBadge.color}`}>
                {authBadge.text}
              </span>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5 tracking-tight">Email</p>
              <p className="text-sm font-medium text-gray-900 truncate tracking-tight">
                {user?.email || 'Not provided'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5 tracking-tight">Member Since</p>
              <p className="text-sm font-medium text-gray-900 tracking-tight">
                {formatMemberSince(user?.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5 tracking-tight">Account Status</p>
              <p className="text-sm font-medium text-gray-900 tracking-tight">Active & Secure</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-semibold text-primary tabular-nums tracking-tight">
              {loading ? '...' : stats.expenses}
            </p>
            <p className="text-xs text-gray-600 tracking-tight">Expenses</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-green-600 tabular-nums tracking-tight">
              {loading ? '...' : stats.budgets}
            </p>
            <p className="text-xs text-gray-600 tracking-tight">Budgets</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-orange-600 tabular-nums tracking-tight">
              {loading ? '...' : stats.goals}
            </p>
            <p className="text-xs text-gray-600 tracking-tight">Goals</p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg transition-colors tracking-tight"
        >
          Close
        </button>
      </div>
    </Modal>
  )
}

export default ProfileModal
