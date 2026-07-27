import React from 'react'

/**
 * LoadingSpinner — redesigned to match the Smart Expense Tracker dashboard.
 *
 * Signature idea: the app's four Quick Actions (Add Expense / Add Income /
 * Voice / Scan) each carry their own accent color — blue, green, purple,
 * pink. Instead of a generic single-color ring, the spinner orbits those
 * same four colors around a dark core, so the loading state reads as an
 * extension of the dashboard rather than a stock component dropped in.
 */

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

// The four Quick Action accents from the dashboard
const ORBIT_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#ec4899'] // blue, green, purple, pink

const UniqueSpinner = ({ sSize }) => (
  <div className={`relative ${sizeClasses[sSize]}`}>
    {/* Static dark track, matches card borders (border-white/10) */}
    <div className="absolute inset-0 rounded-full border-2 border-white/10" />

    {/* Orbiting dots — one per quick-action color, evenly spaced, slow linear spin */}
    <div className="absolute inset-0 animate-[spin_1.6s_linear_infinite]">
      {ORBIT_COLORS.map((color, i) => {
        const angle = (360 / ORBIT_COLORS.length) * i
        return (
          <span
            key={color}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: '22%',
              height: '22%',
              background: color,
              boxShadow: `0 0 8px ${color}99`,
              transform: `rotate(${angle}deg) translate(0, -140%) translate(-50%, -50%)`,
              transformOrigin: '0 0'
            }}
          />
        )
      })}
    </div>

    {/* Core — deep navy like the dashboard cards, with a soft indigo glow pulse */}
    <div className="absolute inset-[28%] rounded-full bg-[#0b0f1a] border border-white/10 shadow-[0_0_16px_rgba(99,102,241,0.35)] animate-pulse" />
  </div>
)

const LoadingSpinner = ({
  size = 'md',
  fullScreen = false,
  text = 'Loading...',
  variant = 'default'
}) => {
  const spinnerSize = fullScreen ? 'xl' : size

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#05070d]/85 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in duration-300">
        <div className="flex flex-col items-center gap-6 px-10 py-8 rounded-3xl bg-[#0e121f] border border-white/10 shadow-2xl">
          <UniqueSpinner sSize={spinnerSize} />
          {text && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-white text-base font-semibold tracking-tight">{text}</p>
              <div className="flex gap-1.5">
                {ORBIT_COLORS.map((color, i) => (
                  <span
                    key={color}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: color, animationDelay: `${i * 120}ms` }}
                  />
                ))}
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
        <p className={`${textSizeClasses[size]} text-slate-400 font-medium tracking-tight`}>
          {text}
        </p>
      )}
    </div>
  )
}

// Inline spinner for buttons — uses the primary blue from "Add Expense"
export const ButtonSpinner = ({ size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-[3px]'
  }

  return (
    <div
      className={`${sizeClasses[size]} border-white/30 border-t-white rounded-full animate-spin ${className}`}
    />
  )
}

// Skeleton loader — dark card tone consistent with dashboard tiles
export const SkeletonLoader = ({ className = '', count = 1 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-pulse ${className}`}>
          <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
          <div className="h-4 bg-white/5 rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}

export default LoadingSpinner