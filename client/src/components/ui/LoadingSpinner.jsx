import React from 'react'

const LoadingSpinner = ({ 
  size = 'md', 
  fullScreen = false, 
  text = 'Loading...', 
  variant = 'default' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
    '2xl': 'text-xl'
  }

  const spinnerSize = fullScreen ? 'xl' : size

  // Unique Premium Spinner Design
  const UniqueSpinner = ({ sSize }) => (
    <div className={`relative flex items-center justify-center ${sizeClasses[sSize]}`}>
      {/* Outer track */}
      <div className="absolute inset-0 rounded-full border-[3px] border-primary/10 dark:border-primary/20" />
      
      {/* Spinning bright ring with cubic-bezier for a smooth 'whiplash' effect */}
      <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary border-r-primary/50 animate-[spin_1.2s_cubic-bezier(0.55,0.085,0.68,0.53)_infinite]" />
      
      {/* Secondary spinning ring in opposite direction */}
      <div className="absolute inset-1 rounded-full border-[2px] border-transparent border-b-primary/60 border-l-primary/30 animate-[spin_2s_linear_infinite_reverse]" />
      
      {/* Core glowing pulse */}
      <div className="w-2/5 h-2/5 bg-primary/30 dark:bg-primary/40 rounded-full animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center z-[100] animate-in fade-in duration-300">
        <div className="flex flex-col items-center justify-center gap-6 p-8 rounded-3xl bg-card/50 shadow-2xl border border-border/50 backdrop-blur-xl">
          <UniqueSpinner sSize="2xl" />
          {text && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-foreground text-lg font-semibold tracking-tight">{text}</p>
              <div className="flex gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <UniqueSpinner sSize={size} />
      {text && (
        <p className={`${textSizeClasses[size]} text-muted-foreground font-medium tracking-tight animate-pulse`}>{text}</p>
      )}
    </div>
  )
}

// Inline spinner for buttons
export const ButtonSpinner = ({ size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-3'
  }

  return (
    <div className={`${sizeClasses[size]} border-white/30 border-t-white rounded-full animate-spin ${className}`}></div>
  )
}

// Skeleton loader for content
export const SkeletonLoader = ({ className = '', count = 1 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-pulse ${className}`}>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}

export default LoadingSpinner
