"use client";
import { 
  useSessionContext, 
} from '@supabase/auth-helpers-react';
import { useUser } from "@/hooks/useUser";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useRoomModal from "@/hooks/useRoomModal";
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import toast from 'react-hot-toast';
import { useRooms } from '@/hooks/useRoomsServices';
import Box from './Box';
import { BounceLoader } from 'react-spinners';
import usePlayer from '@/hooks/usePlayer';

const RoomModal = () => {
  const { session } = useSessionContext();
  const router = useRouter();
  const { onClose, isOpen,isNavigating,messageType,setIsNavigating} = useRoomModal();
  const {user}=useUser()
  
  
  
  const player=usePlayer()
  const {createRoom,joinRoom,loading,error}=useRooms()
  const [value,setValue]=useState("")

  useEffect(() => {
    if (session) {
      router.refresh();
      onClose();
      setIsNavigating(false)
    }
  }, [session, router, onClose]);



  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  }


  console.log(messageType)

  const handleCreateRoomClick = async () => {
    if (loading) return;

    if(error) return console.log(error)

    const result = await createRoom(user?.id);

    if (!result) {
      return toast.error("Failed to create room.");
    }

    player.setIsHost(true)
    player.setRoomId(result.roomId)
    router.push(`/room/${result.roomId}`)
    setIsNavigating(true,'join')
  };

  const handleJoinRoomClick = async () => {
    if (loading) return;

    if(!user) return toast.error('invalid user')
    const result = await joinRoom(value,user.id);
    
    if(error) return console.log(error)

    if (!result.success) {
      return toast.error(`${result.message}`);
    }
    else{
      player.setIsHost(false)
      player.setRoomId(result.roomId)
      router.push(`/room/${result.roomId}`)
      setIsNavigating(true,'join')
    }
  };


  let content=(<Box className="h-full flex flex-col items-center justify-center">
    {messageType==='join' && <h1 className="text-white animate-bounce"> Connecting to your room</h1>}
    {messageType==='leave' && <h1 className='text-white animate-bounce'> Leaving the room </h1>}
    <BounceLoader color="#22c55e" size={40} />
  </Box>)



  return (
    <Modal 
      title="Welcome to Rooms" 
      description="Join Rooms to enjoy music with your loved ones" 
      isOpen={isOpen} 
      onChange={onChange} 
    >
      {isNavigating?content:(
        <div className='flex flex-col h-full w-full space-y-4'>
    <div className='flex flex-col'>
      <Button onClick={handleCreateRoomClick} className='bg-lime-700 p-3 text-center rounded-md font-semibold hover:bg-lime-500'>Create Room</Button>
    </div>
    <div className='flex flex-col items-center space-y-2'>
      <p>Have an invite? Paste here to join</p>
      <Input placeholder="Paste link or code"
            value={value}
            onChange={(e) => setValue(e.target.value)}>
            </Input>
            <Button className='rounded-md' onClick={handleJoinRoomClick}>Join</Button>
    </div>
  </div>
    )
  }
    </Modal>
  );
}

export default RoomModal;