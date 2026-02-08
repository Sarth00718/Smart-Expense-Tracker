import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import DashboardHome from '../components/features/dashboard/DashboardHome'
import Expenses from '../components/features/expenses/Expenses'
import Income from '../components/features/income/Income'
import Budgets from '../components/features/budgets/Budgets'
import Goals from '../components/features/goals/Goals'
import AIAssistant from '../components/features/ai/AIAssistant'
import Analytics from '../components/features/analytics/Analytics'
import Achievements from '../components/features/achievements/Achievements'
import SpendingHeatmap from '../components/features/analytics/SpendingHeatmap'
import ReceiptScanner from '../components/features/receipts/ReceiptScanner'
import Settings from '../components/features/settings/Settings'
import Documentation from './Documentation'

const Dashboard = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="income" element={<Income />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="goals" element={<Goals />} />
        <Route path="ai" element={<AIAssistant />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="heatmap" element={<SpendingHeatmap />} />
        <Route path="receipt" element={<ReceiptScanner />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="documentation" element={<Documentation />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default Dashboard
