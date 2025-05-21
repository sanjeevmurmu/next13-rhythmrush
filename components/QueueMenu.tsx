"use client"
import useQueueMenu from "@/hooks/useQueueMenu"
import { Song } from "@/types"
import MediaItem from "./MediaItem"
import { BiX } from "react-icons/bi"
import { Reorder } from 'framer-motion'
import { HiBars2 } from "react-icons/hi2";
import toast from "react-hot-toast"


interface QueueProps {
    activeId:string
    allSongs:Song[]
    onReorder:(newOrder:Song[])=>void
    host:boolean
}

const QueueMenu = ({activeId,allSongs,onReorder,host}: QueueProps) => {

    const { isOpen, onClose } = useQueueMenu((state) => state)
    
 
    const handleReorder = (newOrder: Song[]) => {
        // console.log("Reordering in Queue component. New order:", newOrder.map(song => song.id));
        if(host){
            onReorder(newOrder);
        }
        else{
            toast.error("Not possible in a room where you are not host")
        }
    };

    const handleRemove = (item: Song) => {
        const newSongs = allSongs.filter((song) => song.id !== item.id);
        // console.log("Removing song from Queue. New order:", newSongs.map(song => song.id));
        if(host){    
            onReorder(newSongs);
        }
        else{
            toast.error("Not possible in a room where you are not host")
        }
    };



    if (!allSongs) {
        return null
    }
    

    return (
        <div className={`absolute inset-y-0 right-0 bg-stone-800 transition-all duration-300 ease-in-out overflow-x-hidden overflow-y-scroll h-[88%] z-40 ${isOpen ? 'w-full md:w-1/3' : 'w-0'}`}>
            <div className="flex justify-between items-center m-4">
                <h1 className="
            text-white 
              text-3xl 
              font-semibold
            ">Queue</h1>
                <BiX size={30}
                    onClick={onClose}
                    className="text-neutral-400 cursor-pointer hover:text-white            transition"/>
            </div>
            <div className="flex flex-col gap-y-2 mt-4 px-3">
                <Reorder.Group axis="y" values={allSongs} onReorder={handleReorder}>
                    {allSongs.map((item) => (
                        <Reorder.Item key={item.id} value={item} className='flex justify-between hover:bg-green-600 active:bg-green-600 rounded-md'>
                            <MediaItem
                                data={item} componentClassName="w-5/6"
                            />
                            <div className='flex w-1/6 justify-center items-center space-x-4'>
                                <HiBars2 size={16}
                                    className="text-neutral-400 cursor-pointer              hover:text-white transition"/>                            
                                {item.id!==activeId ?(<BiX size={16} onClick={() => handleRemove(item)}
                                    className="text-neutral-400 cursor-pointer hover:text-white transition"/>):(<div className="w-4"></div>)}
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>
        </div>

    )
}

export default QueueMenu
