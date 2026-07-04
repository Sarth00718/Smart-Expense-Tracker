import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Receipt, PieChart, TrendingUp, Settings } from 'lucide-react'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home', end: true },
  { path: '/dashboard/expenses', icon: Receipt, label: 'Expenses' },
  { path: '/dashboard/budgets', icon: PieChart, label: 'Budgets' },
  { path: '/dashboard/analytics', icon: TrendingUp, label: 'Analytics' },
  { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

const MobileNav = () => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end || false}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 transition-all duration-200 relative ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />}
                <item.icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
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
