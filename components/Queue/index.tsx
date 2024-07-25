"use client"
import usePlayer from "@/hooks/usePlayer"
import useQueueSidebar from "@/store/useQueueSidebar"
import QueueList from "./QueueList"



const Queue = () => {
    const {isOpen,onOpen,onClose}=useQueueSidebar((state)=>state)
    const {ids,activeId,setId,setIds}=usePlayer((state)=>state)
    const nextIds=ids.filter((id)=>id!==activeId)

    
  return (
   <div className={`absolute inset-y-0 right-0 bg-black transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'w-full md:w-1/3' : 'w-0'}`}>
      <div>
      <h1>Queue</h1>
      </div>
    {/* <QueueList songs={[]}/> */}
    </div>
    
  )
}

export default Queue
