import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Receipt, PieChart, TrendingUp, Settings } from 'lucide-react'

const MobileNav = () => {
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { path: '/dashboard/expenses', icon: Receipt, label: 'Expenses' },
    { path: '/dashboard/budgets', icon: PieChart, label: 'Budgets' },
    { path: '/dashboard/analytics', icon: TrendingUp, label: 'Analytics' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1
              transition-colors duration-200
              ${isActive ? 'text-primary' : 'text-gray-600'}
            `}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default MobileNav
