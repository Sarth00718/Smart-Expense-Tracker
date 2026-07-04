import { forwardRef } from 'react'
import { cn } from '../../../lib/utils'

const Textarea = forwardRef(({ className, error, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-y',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
    </div>
  )
})
Textarea.displayName = 'Textarea'

export { Textarea }
