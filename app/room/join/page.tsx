'use client'

import { useState,useEffect } from "react"
import { notFound, useRouter,useSearchParams } from "next/navigation"
import { useRooms } from "@/hooks/useRoomsServices"
import { useUser } from "@/hooks/useUser"
import useAuthModal from "@/hooks/useAuthModal"
import Box from "@/components/Box"
import { BounceLoader } from "react-spinners"
import toast from "react-hot-toast"


const JoinRoomPage = () => {

  const router=useRouter()
  const params=useSearchParams()
  const authModal=useAuthModal()
  const {user,isLoading}=useUser()
  const {joinRoom}=useRooms()


  const [roomCode,setRoomCode]=useState('')
  
  useEffect(()=>{
    const code=params.get('code')
    if(code) setRoomCode(code)
  },[params])

  useEffect(()=>{
    if(isLoading || !roomCode) return notFound()

    if(!user) return authModal.onOpen()

    const join=async()=>{
        const result=await joinRoom(roomCode,user.id)
        if(result.success){
            toast.success(result.message|| "You have succesfully joined the room")
            router.replace(`/room/${result.roomId}`)
        }
        else{
            toast.error(result.message|| 'some internal error occured')
            router.replace('/')
        }

    }
    join()

  },[isLoading, roomCode, user, authModal, joinRoom, router])

  return (
    <div className="h-full flex flex-col space-y-4">
        <p className="animate-bounce">Connecting you to the rooom</p>
          <Box className="h-full flex items-center justify-center">
      <BounceLoader color="#22c55e" size={40} />
    </Box>
    </div>
  )
}

export default JoinRoomPage
