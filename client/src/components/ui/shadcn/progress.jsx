import { cn } from '../../../lib/utils'

function Progress({ value, className, indicatorClassName, ...props }) {
  return (
    <div
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)}
      {...props}
    >
      <div
        className={cn('h-full w-full flex-1 rounded-full bg-primary transition-all duration-500', indicatorClassName)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  )
}

export { Progress }
