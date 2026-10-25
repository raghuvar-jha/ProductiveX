import Dashboard from '@/component/Dashboard'
import React from 'react'

const page = () => {
  return (
    <div>
        <div className='hidden lg:block'>
         <Dashboard compact={false}/>
        </div>
        
          <div className='lg:hidden'>
         <Dashboard compact={true}/>
        </div>
    </div>
  )
}

export default page