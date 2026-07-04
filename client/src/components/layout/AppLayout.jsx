import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-4">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>

        <MobileNav />
      </div>
    </div>
  )
}

export default AppLayout
