import MemoriesPage from '@/component/MemoriesPage'
import React from 'react'

const page = () => {
  return (
    <div>
    <div className='hidden lg:block'>
     <MemoriesPage compact={false}/>
    </div>
    
      <div className='lg:hidden'>
     <MemoriesPage compact={true}/>
    </div>
</div>
  )
}

export default page