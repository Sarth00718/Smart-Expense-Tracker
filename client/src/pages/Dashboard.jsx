import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'

// Lazy load components for better performance
const DashboardHome = lazy(() => import('../components/features/dashboard/DashboardHome'))
const Expenses = lazy(() => import('../components/features/expenses/Expenses'))
const Income = lazy(() => import('../components/features/income/Income'))
const Budgets = lazy(() => import('../components/features/budgets/Budgets'))
const Goals = lazy(() => import('../components/features/goals/Goals'))
const AIAssistant = lazy(() => import('../components/features/ai/AIAssistant'))
const Analytics = lazy(() => import('../components/features/analytics/Analytics'))
const Achievements = lazy(() => import('../components/features/achievements/Achievements'))
const SpendingHeatmap = lazy(() => import('../components/features/analytics/SpendingHeatmap'))
const ReceiptScanner = lazy(() => import('../components/features/receipts/ReceiptScanner'))
const Settings = lazy(() => import('../components/features/settings/Settings'))

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="spinner border-4 w-12 h-12"></div>
  </div>
)

const Dashboard = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={
          <Suspense fallback={<LoadingFallback />}>
            <DashboardHome />
          </Suspense>
        } />
        <Route path="expenses" element={
          <Suspense fallback={<LoadingFallback />}>
            <Expenses />
          </Suspense>
        } />
        <Route path="income" element={
          <Suspense fallback={<LoadingFallback />}>
            <Income />
          </Suspense>
        } />
        <Route path="budgets" element={
          <Suspense fallback={<LoadingFallback />}>
            <Budgets />
          </Suspense>
        } />
        <Route path="goals" element={
          <Suspense fallback={<LoadingFallback />}>
            <Goals />
          </Suspense>
        } />
        <Route path="ai" element={
          <Suspense fallback={<LoadingFallback />}>
            <AIAssistant />
          </Suspense>
        } />
        <Route path="analytics" element={
          <Suspense fallback={<LoadingFallback />}>
            <Analytics />
          </Suspense>
        } />
        <Route path="heatmap" element={
          <Suspense fallback={<LoadingFallback />}>
            <SpendingHeatmap />
          </Suspense>
        } />
        <Route path="receipt" element={
          <Suspense fallback={<LoadingFallback />}>
            <ReceiptScanner />
          </Suspense>
        } />
        <Route path="achievements" element={
          <Suspense fallback={<LoadingFallback />}>
            <Achievements />
          </Suspense>
        } />
        <Route path="settings" element={
          <Suspense fallback={<LoadingFallback />}>
            <Settings />
          </Suspense>
        } />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default Dashboard
