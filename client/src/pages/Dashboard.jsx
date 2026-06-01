import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import {
  DashboardErrorBoundary,
  ExpenseErrorBoundary,
  IncomeErrorBoundary,
  AnalyticsErrorBoundary,
  ProjectErrorBoundary,
} from '../components/ui/FeatureErrorBoundary'
import FeatureErrorBoundary from '../components/ui/FeatureErrorBoundary'

// Lazy load feature pages
const DashboardHome    = lazy(() => import('../components/features/dashboard/DashboardHome'))
const Expenses         = lazy(() => import('../components/features/expenses/Expenses'))
const Income           = lazy(() => import('../components/features/income/Income'))
const Budgets          = lazy(() => import('../components/features/budgets/Budgets'))
const Goals            = lazy(() => import('../components/features/goals/Goals'))
const AIAssistant      = lazy(() => import('../components/features/ai/AIAssistant'))
const Analytics        = lazy(() => import('../components/features/analytics/Analytics'))
const Achievements     = lazy(() => import('../components/features/achievements/Achievements'))
const SpendingHeatmap  = lazy(() => import('../components/features/analytics/SpendingHeatmap'))
const ReceiptScanner   = lazy(() => import('../components/features/receipts/ReceiptScanner'))
const Settings         = lazy(() => import('../components/features/settings/Settings'))

const Loading = () => <LoadingSpinner size="lg" text="" />

// Wrap a lazy page with its own error boundary + Suspense
const Page = ({ boundary: Boundary = FeatureErrorBoundary, children }) => (
  <Boundary>
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  </Boundary>
)

const Dashboard = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route index element={
        <Page boundary={DashboardErrorBoundary}><DashboardHome /></Page>
      } />
      <Route path="expenses" element={
        <Page boundary={ExpenseErrorBoundary}><Expenses /></Page>
      } />
      <Route path="income" element={
        <Page boundary={IncomeErrorBoundary}><Income /></Page>
      } />
      <Route path="budgets" element={
        <Page boundary={ProjectErrorBoundary}><Budgets /></Page>
      } />
      <Route path="goals" element={
        <Page boundary={ProjectErrorBoundary}><Goals /></Page>
      } />
      <Route path="ai" element={
        <Page><AIAssistant /></Page>
      } />
      <Route path="analytics" element={
        <Page boundary={AnalyticsErrorBoundary}><Analytics /></Page>
      } />
      <Route path="heatmap" element={
        <Page boundary={AnalyticsErrorBoundary}><SpendingHeatmap /></Page>
      } />
      <Route path="receipt" element={
        <Page><ReceiptScanner /></Page>
      } />
      <Route path="achievements" element={
        <Page><Achievements /></Page>
      } />
      <Route path="settings" element={
        <Page><Settings /></Page>
      } />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Route>
  </Routes>
)

export default Dashboard
