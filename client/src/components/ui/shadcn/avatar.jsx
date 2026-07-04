import { cn } from '../../../lib/utils'

function Avatar({ className, children, ...props }) {
  return (
    <div
      className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    >
      {children}
    </div>
  )
}

function AvatarImage({ className, src, alt, ...props }) {
  if (!src) return null
  return (
    <img
      src={src}
      alt={alt}
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  )
}

function AvatarFallback({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-white font-semibold text-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Avatar, AvatarImage, AvatarFallback }
