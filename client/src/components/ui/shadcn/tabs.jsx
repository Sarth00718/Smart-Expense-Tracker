import { cn } from '../../../lib/utils'

function Tabs({ value, onValueChange, children, className, ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

function TabsList({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 p-1 bg-muted rounded-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function TabsTrigger({ value, activeTab, onClick, className, children, ...props }) {
  const isActive = activeTab === value
  return (
    <button
      onClick={() => onClick?.(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all',
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function TabsContent({ value, activeTab, className, children, ...props }) {
  if (activeTab !== value) return null
  return (
    <div className={cn('mt-4', className)} {...props}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
