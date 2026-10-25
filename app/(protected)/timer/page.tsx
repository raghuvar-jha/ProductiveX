
import FocusPage from '@/component/FocusPage'
import { Focus } from 'lucide-react'
import React from 'react'

const page = () => {
  return (
 

    <div>
    <div className='hidden lg:block'>
     <FocusPage compact={false}/>
    </div>
    
      <div className='lg:hidden'>
     <FocusPage compact={true}/>
    </div>
</div>

  )
}

export default page