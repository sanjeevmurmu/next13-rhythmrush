'use client'
import Button from "@/components/Button";
import Image from "next/image"
import { IoPersonRemove } from "react-icons/io5";
import { useEffect, useMemo, useState } from "react";
import { Room, UserDetails } from "@/types";
import { useRouter } from "next/navigation";
import useRoomModal from "@/hooks/useRoomModal";
import  {useRooms}  from "@/hooks/useRoomsServices";
import useGetSongByIds from "@/hooks/useGetSongByIds";
import usePlayer from "@/hooks/usePlayer";
import toast from "react-hot-toast";
import { useGetRequstedSongs,useRealtimeRooms,RealtimeDetector} from "@/hooks/useRoomSongRequests";

interface RoomMembersProps{
    userId:string,
    room:Room,
    members:UserDetails[],
}

const RoomMembers = ({members,userId,room}:RoomMembersProps) => {

    const requests=useGetRequstedSongs(userId,room.id)
    const newRoomDetails=useRealtimeRooms(userId,room.id)
    RealtimeDetector()
    const router=useRouter()
    const player=usePlayer()

    const {onClose,setIsNavigating}=useRoomModal()
    const {leaveRoom,deleteRoom,respondSongRequests,error}=useRooms()
    
    const [memberList,setMemberList]=useState<UserDetails[]>([])
    const [activeTabMembers,setActiveTabMemebers]=useState(true)
    const [activeTabRequests,setActiveTabRequests]=useState(false)



    const requestedSongs = useMemo(() => {
    return requests.map(item => item.song_id);
    }, [requests]);
    const { songs } = useGetSongByIds(requestedSongs);

    useEffect(()=>{
        if(newRoomDetails){
            player.setIsHost(userId===newRoomDetails.host)
            player.setId(newRoomDetails.current_song_id)
            player.setStart(newRoomDetails.current_song_started_at)
            player.setPlayback(newRoomDetails.accumulated_playback_time)
            player.setQueue(newRoomDetails.queue)
            player.setRoomSongIsPlaying(newRoomDetails.is_playing)
        }
    },[newRoomDetails])

    const detailedRequests = useMemo(() => {
    const requestersMap = Object.fromEntries(members.map((u) => [u.id, u]));
    const songsMap = Object.fromEntries(songs.map((s) => [s.id, s]));
    console.log('requestersMap ',requestersMap)
    return requests.map((req) => ({
        id: req.id,
        song: songsMap[req.song_id],
        requested_by: requestersMap[req.user_id],
        status: req.status,
    }));
    }, [requests, songs, members]);


    console.log(detailedRequests,newRoomDetails,requests)
    
    
    
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
        console.log(isHost,'ishost')
        player.setIsHost(isHost)
        player.setRoomId(room.id)
        if(player.isHost){
            toast.success("The Room has been created")
        }
        else{
            toast.success("You have joined the room")
        }
    },[])

    useEffect(()=>{        
        if(room.current_song_id){
            player.setId(room.current_song_id)
            player.setQueue(room.queue)
            player.setStart(room.current_song_started_at)
            player.setPlayback(room.accumulated_playback_time)
            player.setRoomSongIsPlaying(room.is_playing)
        }
        console.log('room',room)
        console.log('player',player)

    },[room])


    
    useEffect(() => {
        if (members && members.length > 0) {
          setMemberList(members);
        }
      }, [members]);
 

    if(memberList.length===0) return null;

    const handleLeaveRoom=async()=>{
        await leaveRoom(room.id,userId)
        console.log(error)
        player.reset()
        router.replace('/')
    }

    const handleDeleteRoom=async()=>{
        await deleteRoom(room.id)
        console.log(error)
        player.reset()
        router.replace('/')
    }
    
   

    const host=memberList[0]
    const otherMembers=memberList.slice(1)

  

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
            <Button className='flex bg-emerald-600 w-max mb-2 p-2 rounded-md hover:bg-lime-300 items-center'>Invite</Button>
            {player.isHost ? <Button onClick={handleDeleteRoom} className='flex bg-emerald-600 w-max mb-2 p-2 rounded-md hover:bg-lime-300 items-center '>Delete Room</Button>
                    : <Button onClick={handleLeaveRoom} className='flex bg-emerald-600 w-max mb-2 p-2 rounded-md hover:bg-lime-300 items-center '>Leave Room</Button>}
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
                  <div key={item.id} className="flex h-max p-2 w-full justify-between">
                       <div className="flex items-center space-x-4 ">
                         <Image
                            className="rounded-full"
                            width={48}
                            height={8}
                            src={item.requested_by?.avatar_url||'/images/Avatar.png'}
                            alt="avatar"
                            />
                            <div className="flex flex-col space-y-2">
                            <h3>{item.requested_by?.full_name}</h3>
                            <h3>{item.song.title}</h3>
                            </div>
                        </div>
                    {player.isHost && <div className="flex space-x-2">
                    <Button className="flex bg-emerald-600 w-max h-8 p-3 rounded-md hover:bg-lime-300 items-center" onClick={()=>respondRequests(item.id,'accept',item.song.id)}>Add to Queue</Button> 
                    <Button className="flex bg-emerald-600 w-max h-8 p-3 rounded-md hover:bg-lime-300 items-center" onClick={()=>respondRequests(item.id,'decline',item.song.id)}>Decline</Button> 
                    </div>
                    }
                  </div>  
                ))
            } 
        </div>

    </div>
  )
}

export default RoomMembers
