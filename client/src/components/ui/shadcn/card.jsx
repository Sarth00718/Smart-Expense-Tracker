import { cn } from '../../../lib/utils'

function Card({ className, children, hover, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card text-card-foreground shadow-sm',
        hover && 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function CardHeader({ className, children, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>{children}</div>
}

function CardTitle({ className, children, ...props }) {
  return <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props}>{children}</h3>
}

function CardDescription({ className, children, ...props }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props}>{children}</p>
}

function CardContent({ className, children, ...props }) {
  return <div className={cn('p-6', className)} {...props}>{children}</div>
}

function CardFooter({ className, children, ...props }) {
  return <div className={cn('flex items-center p-6', className)} {...props}>{children}</div>
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
