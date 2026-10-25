import TasksPage from "@/component/TasksPage";




export default function Page() {
  return <>
  <div>
  <div className='hidden lg:block'>
   <TasksPage compact={false}/>
  </div>
  
    <div className='lg:hidden'>
   <TasksPage compact={true}/>
  </div>
</div>
  </>
}