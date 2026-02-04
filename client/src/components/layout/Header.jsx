import { useAuth } from '../../context/AuthContext'
import { Menu, LogOut, User } from 'lucide-react'
import toast from 'react-hot-toast'

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-4 lg:px-6 flex-shrink-0">
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

      {/* Right: User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* User Menu */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-[#3a0ca3] rounded-full flex items-center justify-center overflow-hidden">
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
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px] md:max-w-none">
              {user?.fullName || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate max-w-[150px] md:max-w-none">{user?.email || ''}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-secondary py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm tap-target"
        >
          <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}

export default Header
