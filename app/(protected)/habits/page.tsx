import HabitsPage from '@/component/HabitsPage'
import React from 'react'

const page = () => {
  return (

    
    <div>
    <div className='hidden lg:block'>
     <HabitsPage compact={false}/>
    </div>
    
      <div className='lg:hidden'>
     <HabitsPage compact={true}/>
    </div>
</div>

  )
}

export default page