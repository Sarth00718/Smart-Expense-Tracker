// shadcn-style UI components
export {
  Button, Input, Label, Textarea, Switch, Progress, Slider, Separator, Badge,
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Skeleton, SkeletonCard, SkeletonList, SkeletonChart,
  Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
  Avatar, AvatarImage, AvatarFallback,
  EmptyState,
  Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator,
  Popover, PopoverTrigger, PopoverContent, PopoverAnchor,
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
  ScrollArea, ScrollBar,
  Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription,
  Checkbox,
  RadioGroup, RadioGroupItem,
  Toggle,
  Collapsible, CollapsibleTrigger, CollapsibleContent,
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis,
} from './shadcn'

// Legacy UI components (keep for backward compatibility)
export { default as Modal } from './Modal'
export { default as StatCard } from './StatCard'
export { default as ProfileModal } from './ProfileModal'
export { default as PageHeader } from './PageHeader'
export { CommonPageContainer } from './CommonPageContainer'
export { default as PWAUpdatePrompt } from './PWAUpdatePrompt'
export { default as LoadingSpinner, ButtonSpinner, SkeletonLoader as ContentSkeleton } from './LoadingSpinner'
export { default as AnimatedBackground } from './AnimatedBackground'
export { LiquidProgress } from './LiquidProgress'
export { Card3DTilt } from './Card3DFlip'
export { default as ErrorBoundary } from './ErrorBoundary'
export {
  default as FeatureErrorBoundary,
  DashboardErrorBoundary, ExpenseErrorBoundary,
  IncomeErrorBoundary, AnalyticsErrorBoundary, ProjectErrorBoundary,
} from './FeatureErrorBoundary'

// Animated Components
export { default as AnimatedCard } from './AnimatedCard'
export { default as AnimatedProgress } from './AnimatedProgress'
export { default as AnimatedList, AnimatedListItem } from './AnimatedList'
export { default as AnimatedCounter } from './AnimatedCounter'
export { default as ConfettiEffect } from './ConfettiEffect'
export { default as SuccessCheckmark } from './SuccessCheckmark'
export { default as AchievementBadge } from './AchievementBadge'
export { ScanOverlay, ProcessingLoader } from './ScanAnimation'
export { MicrophonePulse, Waveform, TypingIndicator } from './VoiceAnimation'

// Common
export { default as CommonExport } from '../common/CommonExport'
