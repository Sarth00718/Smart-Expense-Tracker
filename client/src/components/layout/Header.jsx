import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Menu, LogOut, User, Bell, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import CommonExport from '../common/CommonExport'
import ProfileModal from '../ui/ProfileModal'

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [notificationCount] = useState(3) // Mock notification count

  const handleLogout = () => {
    setShowUserMenu(false)
    logout()
    toast.success('Logged out successfully')
  }

  const handleProfileClick = () => {
    setShowUserMenu(false)
    setShowProfileModal(true)
  }

  const handleSettingsClick = () => {
    setShowUserMenu(false)
    navigate('/dashboard/settings')
  }

  // Mock notifications data
  const notifications = [
    { id: 1, title: 'Budget Alert', message: 'You have exceeded your food budget by 15%', time: '2 hours ago', type: 'warning' },
    { id: 2, title: 'Goal Achieved', message: 'Congratulations! You reached your savings goal', time: '1 day ago', type: 'success' },
    { id: 3, title: 'New Feature', message: 'Try our new AI-powered expense categorization', time: '2 days ago', type: 'info' },
  ]

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-4 lg:px-6 flex-shrink-0 shadow-sm relative z-50">
      {/* Left: Menu Button */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg lg:hidden transition-colors tap-target"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
        </button>
      </div>

      {/* Right: Notifications, Export & User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell with Badge */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowUserMenu(false) // Close user menu if open
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors tap-target relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-700" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold px-1.5">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              {/* Backdrop to close dropdown */}
              <div 
                className="fixed inset-0 z-[100]" 
                onClick={() => setShowNotifications(false)}
                aria-hidden="true"
              />
              
              <div className="absolute right-0 top-full mt-2 w-[90vw] sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[101] max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 sticky top-0">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg">Notifications</h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      toast.success('All notifications marked as read')
                      setShowNotifications(false)
                    }}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors px-2 py-1 hover:bg-blue-100 rounded"
                  >
                    Mark all as read
                  </button>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto flex-1 bg-white">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowNotifications(false)
                            toast.success('Notification opened')
                          }}
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon based on type */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              notification.type === 'warning' ? 'bg-orange-100' :
                              notification.type === 'success' ? 'bg-green-100' :
                              'bg-blue-100'
                            }`}>
                              {notification.type === 'warning' && (
                                <span className="text-orange-600 text-lg">⚠️</span>
                              )}
                              {notification.type === 'success' && (
                                <span className="text-green-600 text-lg">🎉</span>
                              )}
                              {notification.type === 'info' && (
                                <span className="text-blue-600 text-lg">✨</span>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {notification.title}
                                </p>
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                                  notification.type === 'warning' ? 'bg-orange-500' :
                                  notification.type === 'success' ? 'bg-green-500' :
                                  'bg-blue-500'
                                }`} />
                              </div>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                <span>🕐</span>
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-900 font-semibold mb-1">No notifications</p>
                      <p className="text-gray-500 text-sm">You're all caught up!</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 text-center bg-gray-50 sticky bottom-0">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowNotifications(false)
                        toast.success('Opening all notifications')
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors w-full py-2 hover:bg-blue-50 rounded-lg"
                    >
                      View all notifications →
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Common Export Component */}
        <CommonExport />

        {/* User Menu */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-gray-200 relative">
          <div 
            className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-[#3a0ca3] rounded-full flex items-center justify-center overflow-hidden cursor-pointer ring-2 ring-transparent hover:ring-primary/30 transition-all"
            onClick={() => {
              setShowUserMenu(!showUserMenu)
              setShowNotifications(false) // Close notifications if open
            }}
          >
            {user?.picture ? (
              <img 
                src={user.picture} 
                alt={user?.fullName || 'User'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            )}
          </div>
          <div className="hidden sm:block cursor-pointer" onClick={() => setShowUserMenu(!showUserMenu)}>
            <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px] md:max-w-none">
              {user?.fullName || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate max-w-[150px] md:max-w-none">{user?.email || ''}</p>
          </div>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <>
              {/* Backdrop to close dropdown */}
              <div 
                className="fixed inset-0 z-[100]" 
                onClick={() => setShowUserMenu(false)}
              />
              
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-[101]">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {user?.fullName || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {user?.email || ''}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={handleProfileClick}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium">My Profile</span>
                  </button>
                  
                  <button
                    onClick={handleSettingsClick}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Settings className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="font-medium">Settings</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-200 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <LogOut className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
        user={user}
      />
    </header>
  )
}

export default Header
