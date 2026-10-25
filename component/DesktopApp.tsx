"use client"
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { usePathname } from 'next/navigation'
import TasksPage from './TasksPage'
import FocusPage from './FocusPage'
import HabitsPage from './HabitsPage'
import MemoriesPage from './MemoriesPage'
import OverviewPage from './Dashboard'

const DesktopApp = () => {


  return (
    <div>
         
        <OverviewPage/>
      </div>
  )
}

export default DesktopApp 