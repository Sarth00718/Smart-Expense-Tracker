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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom shadow-2xl font-sans">
      <div className="grid grid-cols-5 h-16 sm:h-[4.5rem]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end || false}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1
              transition-all duration-200 tap-target relative
              ${isActive 
                ? 'text-primary' 
                : 'text-gray-600 hover:text-gray-900 active:bg-gray-100'
              }
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full" />
                )}
                <item.icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-[10px] sm:text-xs font-medium ${isActive ? 'font-semibold' : ''} truncate max-w-full px-1 tracking-tight`}>
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
