import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import DashboardHome from '../components/DashboardHome'
import Expenses from '../components/Expenses'
import Budgets from '../components/Budgets'
import Goals from '../components/Goals'
import AIAssistant from '../components/AIAssistant'
import Analytics from '../components/Analytics'
import Achievements from '../components/Achievements'
import SpendingHeatmap from '../components/SpendingHeatmap'
import ReceiptScanner from '../components/ReceiptScanner'

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/ai" element={<AIAssistant />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/heatmap" element={<SpendingHeatmap />} />
            <Route path="/receipt" element={<ReceiptScanner />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
