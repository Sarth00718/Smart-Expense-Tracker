import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { Menu, LogOut, User, Settings, Sun, Moon } from 'lucide-react'
import toast from 'react-hot-toast'
import CommonExport from '../common/CommonExport'
import ProfileModal from '../ui/ProfileModal'
import { Avatar, AvatarFallback, AvatarImage, Button } from '../ui'

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
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0 relative z-30">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-muted rounded-lg lg:hidden transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* search removed (was hardcoded) */}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('[Header] Theme toggle clicked, current isDark:', isDark)
            toggleTheme()
          }}
          className="p-2 rounded-lg hover:bg-muted transition-all duration-200"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          type="button"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
        </button>

        {/* notifications removed (was hardcoded) */}

        <CommonExport />

        <div className="relative pl-2 ml-2 border-l border-border">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Avatar className="w-8 h-8">
              {user?.picture ? (
                <AvatarImage src={user.picture} alt={user?.fullName || 'U'} />
              ) : (
                <AvatarFallback>{(user?.fullName || 'U')[0]}</AvatarFallback>
              )}
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-foreground leading-tight truncate max-w-[120px]">
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-[120px]">{user?.email || ''}</p>
            </div>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-purple-600/5">
                    <p className="font-semibold text-sm text-foreground truncate">{user?.fullName || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email || ''}</p>
                  </div>
                  <div className="p-2">
                    <button onClick={handleProfileClick} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-muted transition-colors">
                      <User className="w-4 h-4 text-muted-foreground" />
                      My Profile
                    </button>
                    <button onClick={handleSettingsClick} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-muted transition-colors">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      Settings
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('[User Menu] Theme toggle clicked')
                        toggleTheme()
                        setShowUserMenu(false)
                      }} 
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                      type="button"
                    >
                      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
                      {isDark ? 'Light Mode' : 'Dark Mode'}
                    </button>
                  </div>
                  <div className="border-t border-border p-2">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} user={user} />
    </header>
  )
}

export default Header
