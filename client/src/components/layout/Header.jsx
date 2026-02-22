import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { Menu, LogOut, User, Settings, Sun, Moon } from 'lucide-react'
import toast from 'react-hot-toast'
import CommonExport from '../common/CommonExport'
import ProfileModal from '../ui/ProfileModal'

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

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

  return (
    <header className="h-14 sm:h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-3 sm:px-4 md:px-6 flex-shrink-0 shadow-sm dark:shadow-slate-900/50 relative z-50 font-sans transition-colors duration-300">
      {/* Left: Menu Button */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg lg:hidden transition-colors tap-target flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-slate-300" />
        </button>
      </div>

      {/* Right: Theme Toggle + Export + User */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200 tap-target flex-shrink-0 relative overflow-hidden"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light Mode' : 'Dark Mode'}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400 transition-all duration-300" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600 transition-all duration-300" />
          )}
        </button>

        {/* Common Export Component */}
        <CommonExport />

        {/* User Menu */}
        <div className="flex items-center gap-1 sm:gap-2 pl-2 sm:pl-3 border-l border-gray-200 dark:border-slate-700 relative">
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-primary to-[#3a0ca3] rounded-full flex items-center justify-center overflow-hidden cursor-pointer ring-2 ring-transparent hover:ring-primary/30 transition-all flex-shrink-0"
            onClick={() => setShowUserMenu(!showUserMenu)}
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
          <div className="hidden md:block cursor-pointer min-w-0" onClick={() => setShowUserMenu(!showUserMenu)}>
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate max-w-[120px] lg:max-w-[180px] tracking-tight">
              {user?.fullName || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-[120px] lg:max-w-[180px] tracking-tight">{user?.email || ''}</p>
          </div>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-[100]"
                onClick={() => setShowUserMenu(false)}
              />

              <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-[280px] sm:w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-[101]">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-700 rounded-t-xl">
                  <p className="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate tracking-tight">
                    {user?.fullName || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-slate-400 truncate tracking-tight">
                    {user?.email || ''}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={handleProfileClick}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-400 transition-colors flex items-center gap-3 group tap-target"
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60 transition-colors flex-shrink-0">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium text-sm tracking-tight">My Profile</span>
                  </button>

                  <button
                    onClick={handleSettingsClick}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700 hover:text-purple-700 dark:hover:text-purple-400 transition-colors flex items-center gap-3 group tap-target"
                  >
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/60 transition-colors flex-shrink-0">
                      <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="font-medium text-sm tracking-tight">Settings</span>
                  </button>

                  {/* Theme toggle inside menu too */}
                  <button
                    onClick={() => { toggleTheme(); setShowUserMenu(false) }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-700 hover:text-amber-700 dark:hover:text-amber-400 transition-colors flex items-center gap-3 group tap-target"
                  >
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center group-hover:bg-amber-200 dark:group-hover:bg-amber-900/60 transition-colors flex-shrink-0">
                      {isDark
                        ? <Sun className="w-4 h-4 text-amber-500" />
                        : <Moon className="w-4 h-4 text-amber-600" />
                      }
                    </div>
                    <span className="font-medium text-sm tracking-tight">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-200 dark:border-slate-700 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3 group tap-target"
                  >
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/60 transition-colors flex-shrink-0">
                      <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="font-medium text-sm tracking-tight">Logout</span>
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
