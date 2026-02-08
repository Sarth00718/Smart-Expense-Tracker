import { User, Mail, Calendar, Shield, X } from 'lucide-react'
import { Modal } from './index'

const ProfileModal = ({ isOpen, onClose, user }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="space-y-6">
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
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {user?.fullName || 'User'}
          </h2>
          <div className="flex gap-2 justify-center">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Premium
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Verified
            </span>
          </div>
        </div>

        {/* User Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Email</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email || 'Not provided'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Member Since</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Account Status</p>
              <p className="text-sm font-medium text-gray-900">Active & Secure</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">24</p>
            <p className="text-xs text-gray-600">Expenses</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">5</p>
            <p className="text-xs text-gray-600">Budgets</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">3</p>
            <p className="text-xs text-gray-600">Goals</p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  )
}

export default ProfileModal
