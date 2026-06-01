// Base UI Components
export { default as Button } from './Button'
export { default as Card } from './Card'
export { default as Modal } from './Modal'
export { default as EmptyState } from './EmptyState'
export { default as StatCard } from './StatCard'
export { default as ProfileModal } from './ProfileModal'
export { default as PageHeader } from './PageHeader'
export { default as PWAUpdatePrompt } from './PWAUpdatePrompt'

// Animated Components
export { default as AnimatedCard } from './AnimatedCard'
export { default as AnimatedProgress } from './AnimatedProgress'
export { default as AnimatedList, AnimatedListItem } from './AnimatedList'
export { default as AnimatedButton } from './AnimatedButton'
export { default as AnimatedCounter } from './AnimatedCounter'
export { default as ConfettiEffect } from './ConfettiEffect'
export { default as SuccessCheckmark } from './SuccessCheckmark'
export { default as AchievementBadge } from './AchievementBadge'
export { SkeletonCard, SkeletonList, SkeletonChart } from './SkeletonLoader'
export { ScanOverlay, ProcessingLoader } from './ScanAnimation'
export { MicrophonePulse, Waveform, TypingIndicator } from './VoiceAnimation'

// Loading & Background Components
export { default as LoadingSpinner, ButtonSpinner, SkeletonLoader as ContentSkeleton } from './LoadingSpinner'
export { default as AnimatedBackground } from './AnimatedBackground'
// SnowEffect is NOT re-exported globally — load explicitly where needed (issue #3)

// Advanced Animations
export { LiquidProgress } from './LiquidProgress'
export { Card3DTilt } from './Card3DFlip'
// ParticleBurst removed (issue #7) — replaced with CSS hover interactions
// MoneyRain removed (issue #4) — replaced with toast success feedback

// Error Boundaries
export { default as ErrorBoundary } from './ErrorBoundary'
export {
  default as FeatureErrorBoundary,
  DashboardErrorBoundary,
  ExpenseErrorBoundary,
  IncomeErrorBoundary,
  AnalyticsErrorBoundary,
  ProjectErrorBoundary,
} from './FeatureErrorBoundary'
