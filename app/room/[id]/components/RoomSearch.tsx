'use client'

import { Song } from "@/types"
import Input from "@/components/Input"
import LikeButton from "@/components/LikeButton"
import MediaItem from "@/components/MediaItem"
import { useState } from "react"
import useDebounce from "@/hooks/useDebounce"
import useOnPlay from "@/hooks/useOnPlay"
import useSongByTitle from "@/hooks/useGetSongByTitle"
import Button from "@/components/Button"
import usePlayer from "@/hooks/usePlayer"
import { useRooms } from "@/hooks/useRoomsServices"
import toast from "react-hot-toast"
import { useUpdateToRequstedSong } from "@/hooks/useRoomSongRequests"


interface RoomSearchProps{
    roomId:string
    userId:string
}


const RoomSearch = ({roomId,userId}:RoomSearchProps) => {


    useUpdateToRequstedSong(userId,roomId)

    const [value, setValue] = useState<string>("")
    const debouncedValue = useDebounce<string>(value, 300);    
    const {songs}=  useSongByTitle(debouncedValue)
    const {sendSongRequests}=useRooms()
    const player=usePlayer()
    const play=useOnPlay(songs)
     
    console.log(songs)


    const sendRequest=async(songId:string,songname:string)=>{
        if(!player.isHost){
            const result= await sendSongRequests(roomId,songId,userId,songname)
            toast(`${result.message}`,{duration:4000})
        }
    }

    const onClickPlay=(songId:string)=>{
        play(songId)
    }


    return (
        <div>
            <Input
                placeholder="What do you want to listen to?"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />

            {songs.length > 0 && (
            <div className="flex flex-col gap-y-2 w-full px-6">
                {songs.map((song: Song) => (
                    <div
                        key={song.id}
                        className="flex items-center justify-between gap-x-4 w-full"
                    >
                        <div className="flex-1">
                            <MediaItem
                                data={song}
                            />
                        </div>
                        <div className="flex space-x-2">
                        <LikeButton songId={song.id} />
                        {player.isHost ? (<Button className="bg-lime-600 rounded-md items-center " onClick={()=>onClickPlay(song.id)}>Play</Button>):
                        (<Button className="bg-lime-600 rounded-md items-center " onClick={()=>sendRequest(song.id,song.title)}>Request</Button>)}
                        </div>
                    </div>
                ))}
            </div>
            )}
        </div>
    )
}

export default RoomSearch
