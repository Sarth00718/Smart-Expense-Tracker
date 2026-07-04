import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Receipt, PieChart, Target, Sparkles,
  TrendingUp, Trophy, Wallet, DollarSign, Settings, X, ChevronRight
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/dashboard/expenses', icon: Receipt, label: 'Expenses' },
  { path: '/dashboard/income', icon: DollarSign, label: 'Income' },
  { path: '/dashboard/budgets', icon: PieChart, label: 'Budgets' },
  { path: '/dashboard/goals', icon: Target, label: 'Goals' },
  { path: '/dashboard/analytics', icon: TrendingUp, label: 'Analytics' },
  { path: '/dashboard/ai', icon: Sparkles, label: 'AI Assistant' },
  { path: '/dashboard/achievements', icon: Trophy, label: 'Achievements' },
  { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

const Sidebar = ({ isOpen, setIsOpen }) => {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 xl:w-72 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-base text-foreground block truncate tracking-tight">Smart Expense</span>
              <p className="text-[11px] text-muted-foreground tracking-tight">Tracker</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors shrink-0">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end || false}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                  <span className="font-medium text-sm truncate flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border shrink-0">
          <div className="bg-gradient-to-br from-primary/5 to-purple-600/5 border border-primary/10 rounded-xl p-4">
            <p className="text-xs font-semibold text-foreground mb-1">💡 Pro Tip</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Track daily for better financial insights!</p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
