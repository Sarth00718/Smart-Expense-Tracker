import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Menu, LogOut, User } from 'lucide-react'
import toast from 'react-hot-toast'

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left: Menu Button */}
      <button
        onClick={toggleSidebar}
        className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Right: User Info */}
      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            {user?.picture ? (
              <img 
                src={user.picture} 
                alt={user.fullName} 
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <User className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">
              {user?.fullName || 'User'}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-secondary py-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}

export default Header
