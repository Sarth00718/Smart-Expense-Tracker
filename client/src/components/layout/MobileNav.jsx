import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Receipt, PieChart, TrendingUp, Settings, DollarSign } from 'lucide-react'

const MobileNav = () => {
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Home', end: true },
    { path: '/dashboard/expenses', icon: Receipt, label: 'Expenses' },
    { path: '/dashboard/budgets', icon: PieChart, label: 'Budgets' },
    { path: '/dashboard/analytics', icon: TrendingUp, label: 'Analytics' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom shadow-lg">
      <div className="grid grid-cols-5 h-14 sm:h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end || false}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-0.5 sm:gap-1
              transition-all duration-200 tap-target
              ${isActive 
                ? 'text-primary bg-primary/5' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-[10px] sm:text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default MobileNav
