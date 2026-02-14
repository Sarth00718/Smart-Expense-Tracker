import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Target, 
  Sparkles, 
  TrendingUp, 
  Trophy,
  Wallet,
  X,
  DollarSign,
  Settings as SettingsIcon,
  Camera,
  Mic
} from 'lucide-react'

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/dashboard/expenses', icon: Receipt, label: 'Expenses' },
    { path: '/dashboard/income', icon: DollarSign, label: 'Income' },
    { path: '/dashboard/budgets', icon: PieChart, label: 'Budgets' },
    { path: '/dashboard/goals', icon: Target, label: 'Goals' },
    { path: '/dashboard/analytics', icon: TrendingUp, label: 'Analytics' },
    { path: '/dashboard/ai', icon: Sparkles, label: 'AI Assistant' },
    { path: '/dashboard/achievements', icon: Trophy, label: 'Achievements' },
    { path: '/dashboard/settings', icon: SettingsIcon, label: 'Settings' },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 font-sans
          w-64 sm:w-72 lg:w-64 xl:w-72 bg-white border-r border-gray-200
          flex flex-col shadow-xl lg:shadow-none
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-5 lg:px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-primary to-[#3a0ca3] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-base sm:text-lg text-gray-900 block truncate tracking-tight">Smart Expense</span>
              <p className="text-xs text-gray-500 hidden sm:block tracking-tight">Tracker</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors tap-target flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto smooth-scroll">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end || false}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl
                transition-all duration-200 group tap-target
                ${isActive 
                  ? 'bg-gradient-to-r from-primary to-[#3a0ca3] text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-50 hover:translate-x-1'
                }
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base truncate tracking-tight">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-200 flex-shrink-0">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 tracking-tight">💡 Pro Tip</p>
            <p className="text-xs text-gray-600 leading-snug">Track daily for better insights!</p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
