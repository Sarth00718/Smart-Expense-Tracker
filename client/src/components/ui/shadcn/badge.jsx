import { cn } from '../../../lib/utils'

const variants = {
  default: 'bg-primary/10 text-primary border-transparent',
  secondary: 'bg-secondary text-secondary-foreground',
  destructive: 'bg-destructive/10 text-destructive border-transparent',
  outline: 'text-foreground border-border',
  success: 'bg-success/10 text-success border-transparent',
  warning: 'bg-warning/10 text-warning border-transparent',
}

function Badge({ className, variant = 'default', children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { Badge, variants as badgeVariants }
