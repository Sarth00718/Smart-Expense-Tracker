import { forwardRef } from 'react'
import { cn } from '../../../lib/utils'
import { motion } from 'framer-motion'

const variants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
  success: 'bg-success text-white hover:bg-success/90 shadow-sm',
  warning: 'bg-warning text-white hover:bg-warning/90 shadow-sm',
}

const sizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-lg px-3 text-sm',
  lg: 'h-11 rounded-xl px-8 text-base',
  xl: 'h-12 rounded-xl px-10 text-lg',
  icon: 'h-10 w-10',
  'icon-sm': 'h-8 w-8',
}

const Button = forwardRef(({
  className, variant = 'default', size = 'default',
  loading, icon: Icon, fullWidth, children, disabled, asChild, ...props
}, ref) => {
  const Comp = asChild ? motion.button : motion.button
  return (
    <Comp
      ref={ref}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </Comp>
  )
})
Button.displayName = 'Button'

export { Button, variants as buttonVariants }
