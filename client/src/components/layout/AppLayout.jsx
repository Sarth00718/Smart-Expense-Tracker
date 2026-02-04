import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 pb-14 sm:pb-16 lg:pb-0 smooth-scroll">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* Mobile Navigation - Bottom */}
        <MobileNav />
      </div>
    </div>
  )
}

export default AppLayout
