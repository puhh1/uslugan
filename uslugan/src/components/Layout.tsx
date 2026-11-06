import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-sm">
        <Outlet />
        <BottomNav />
      </div>
    </div>
  )
}