import { Loader2, Wallet } from 'lucide-react'
import AnimatedBackground from './AnimatedBackground'

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
    xl: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900 flex items-center justify-center z-50">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          {variant === 'logo' ? (
            <div className="relative">
              {/* Animated rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border-4 border-white/20 rounded-full animate-ping"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 border-4 border-white/30 rounded-full animate-pulse"></div>
              </div>
              
              {/* Logo */}
              <div className="relative w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 flex items-center justify-center animate-bounce">
                <Wallet className="w-10 h-10 text-white" />
              </div>
            </div>
          ) : (
            <div className="relative mb-6">
              <Loader2 className="w-16 h-16 text-white animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/30 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
          
          <p className="text-white text-lg font-semibold mb-2">{text}</p>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} text-primary-500 animate-spin`} />
        {size === 'lg' || size === 'xl' ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${sizeClasses[size === 'xl' ? 'lg' : 'md']} border-2 border-primary-200 rounded-full animate-pulse`}></div>
          </div>
        ) : null}
      </div>
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>{text}</p>
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
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}

export default LoadingSpinner
