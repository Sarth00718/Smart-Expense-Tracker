import React from 'react'
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
  ChevronLeft,
  Calendar,
  Camera,
  DollarSign,
  Settings as SettingsIcon
} from 'lucide-react'

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/dashboard/receipt', icon: Camera, label: 'Receipt Scanner' },
    { path: '/dashboard/expenses', icon: Receipt, label: 'Expenses' },
    { path: '/dashboard/income', icon: DollarSign, label: 'Income' },
    { path: '/dashboard/heatmap', icon: Calendar, label: 'Spending Heatmap' },
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <span className="font-bold text-xl text-gray-900">Expense</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg
                transition-colors duration-200
                ${isActive 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
