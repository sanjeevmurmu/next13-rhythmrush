'use client'
import Button from "@/components/Button";
import Image from "next/image"
import { IoPersonRemove } from "react-icons/io5";
import { useEffect, useState } from "react";
import { Room, SongRequestLog, UserDetails } from "@/types";
import { useRouter } from "next/navigation";
import useRoomModal from "@/hooks/useRoomModal";
import  {useRooms}  from "@/hooks/useRoomsServices";
import useGetSongByIds from "@/hooks/useGetSongByIds";
import usePlayer from "@/hooks/usePlayer";
import toast from "react-hot-toast";
import { useGetRequstedSongs } from "@/hooks/useRoomSongRequests";

interface RoomMembersProps{
    userId:string,
    room:Room,
    members:UserDetails[],
}

const RoomMembers = ({members,userId,room}:RoomMembersProps) => {

    const router=useRouter()
    const player=usePlayer()
    const {onClose,setIsNavigating}=useRoomModal()
    const {leaveRoom,deleteRoom,respondSongRequests}=useRooms()
    
    const [memberList,setMemberList]=useState<UserDetails[]>([])
    const [activeTabMembers,setActiveTabMemebers]=useState(true)
    const [activeTabRequests,setActiveTabRequests]=useState(false)

    const requests=useGetRequstedSongs(userId,room.id)
    const requestedSongs:string[]=[]
    requests.forEach((item)=>requestedSongs.push(item.id))

    const {songs}=useGetSongByIds(requestedSongs)
    const requestersMap=Object.fromEntries(members.map(u=>[u.id,u]))
    const songsMap=Object.fromEntries(songs.map(s=>[s.id,s]))
    const detailedRequests= requests.map(req=>(
        {   
            id:req.id,
            song:songsMap[req.song_id],
            requested_by:requestersMap[req.requested_by],
            status:req.status
        }
    ))
    
    
    
    const respondRequests=(requestId:string,status:string,songId:string)=>{
        if(!player.isHost) return
        
        if(status=='accept'){
            const queue=player.queue
            queue.push(songId)
            player.setQueue(queue)
        }
        respondSongRequests(requestId,status)
    }


    useEffect(()=>{
        onClose()
        setIsNavigating(false)
        player.reset()
        const isHost=room.host===userId
        player.setIsHost(isHost)
        player.setRoomId(room.id)

        if(player.isHost){
            toast.success("The Room has been created")
        }
        else{
            toast.success("You have joined the room")
        }
        if(room.current_song_id){
            player.setId(room.current_song_id)
            player.setQueue(room.queue)
            player.setStart(room.current_song_started_at)
            player.setPlayback(room.accumalated_playback_time)
            if(room.is_playing){
                player.setRoomSongIsPlaying(true)
            }
            else{
                player.setRoomSongIsPlaying(false)
                
            }
        }

    },[])

    useEffect(() => {
        if (members && members.length > 0) {
          setMemberList(members);
        }
      }, [members]);
 

    if(memberList.length===0) return null;

    const handleLeaveRoom=async()=>{
        await leaveRoom(room.id,userId)
        router.push('/')
    }

    const handleDeleteRoom=async()=>{
        await deleteRoom(room.id)
        router.push('/')
    }
    
   

    const host=memberList[0]
    const otherMembers=memberList.slice(1)

    console.log('Room',host,otherMembers)
    console.log('Room',player)

    // const List=[
    //     {
    //         id:"member1",
    //         name:"sam",
    //         icon:"/images/Avatar.png"
    //     },
    //     {
    //         id:"member2",
    //         name:"sam",
    //         icon:"/images/Avatar.png"
    //     },
    //     {
    //         id:"member3",
    //         name:"sam",
    //         icon:"/images/Avatar.png"
    //     }
    // ]

  return (
    <div className="flex-col p-2 mt-2 h-3/4">
        <div className="flex items-center justify-between">
        <div className="flex space-x-4">
        <div className={`text-white text-3xl font-semibold ${activeTabMembers && "text-underline bg-stone-600 rounded-t-xl"}`} onClick={()=>{
            setActiveTabMemebers(true),
            setActiveTabRequests(false)}}>Room Members</div>
        <div className={`text-white text-3xl font-semibold ${activeTabRequests && "text-underline bg-stone-600 rounded-t-xl"}`} onClick={()=>{
            setActiveTabMemebers(false),
            setActiveTabRequests(true)}}>Member Requests</div>
        </div>
        <div className="flex space-x-4">
            <Button className='bg-emerald-600 w-16 mb-2 px-3 py-0 rounded-md hover:bg-lime-300 items-center'>Invite</Button>
            {player.isHost ? <Button onClick={handleDeleteRoom} className='bg-emerald-600 w-16 mb-2 px-3 py-0 rounded-md hover:bg-lime-300 items-center '>Delete Room</Button>
                    : <Button onClick={handleLeaveRoom} className='bg-emerald-600 w-16 mb-2 px-3 py-0 rounded-md hover:bg-lime-300 items-center '>Leave Room</Button>}
        </div>
        </div>
        <div className="flex flex-col overflow-y-auto border rounded-md p-2 h-full">
                    {activeTabMembers && <>
                    <div className="flex justify-between w-full h-16 items-center hover:bg-emerald-600 rounded-md px-2">
                        <div className="flex items-center space-x-4 ">
                         <Image
                            className="rounded-full"
                            width={48}
                            height={8}
                            src={host.avatar_url||'/images/Avatar.png'}
                            alt="avatar"
                            />
                            <h3>{host.full_name}</h3>
                        </div>
                        <div className="flex items-center justify-center mr-4 rounded-md w-12 h-8 bg-lime-700 text-white shadow-md ">
                            Host
                        </div>
                    </div> 
                    {otherMembers.map((item)=>(
                    <div key={item.id} className="flex justify-between w-full h-16 items-center hover:bg-emerald-600 rounded-md px-2">
                        <div className="flex items-center space-x-4 ">
                         <Image
                            className="rounded-full"
                            width={48}
                            height={8}
                            src={item.avatar_url||'/images/Avatar.png'}
                            alt="avatar"
                            />
                            <h3>{item.full_name}</h3>
                        </div>
                        <div className="mr-4">
                            <IoPersonRemove size={20}/>
                        </div>
                    </div>
                ))}
            </>
            }
            {
                activeTabRequests && detailedRequests.map((item)=>(
                  <div key={item.id} className="flex">
                       <div className="flex items-center space-x-4 ">
                         <Image
                            className="rounded-full"
                            width={48}
                            height={8}
                            src={item.requested_by.avatar_url||'/images/Avatar.png'}
                            alt="avatar"
                            />
                            <div className="flex flex-col space-y-2">
                            <h3>{item.requested_by.full_name}</h3>
                            <h3>{item.song.title}</h3>
                            </div>
                        </div>
                    {player.isHost && <>
                    <Button className="bg-emerald-600 w-8" onClick={()=>respondRequests(item.id,'accept',item.song.id)}>Add to Queue</Button> 
                    <Button className="bg-emerald-600 w-8" onClick={()=>respondRequests(item.id,'decline',item.song.id)}>Decline</Button> 
                    </>
                    }
                  </div>  
                ))
            }
        </div>

    </div>
  )
}

export default RoomMembers
