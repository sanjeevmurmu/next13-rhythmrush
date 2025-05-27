'use client'
import { Room, SongRequestLog } from "@/types";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import usePlayer from "./usePlayer";

export const useUpdateToRequstedSong=(userId:string,roomId:string)=>{

    const {supabaseClient}=useSessionContext()

    useEffect(() => {
      if (!userId || !roomId) return;

      const channel = supabaseClient
      .channel(`song-requests-${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'songs_requests_log',
        filter: `user_id=eq.${userId},room_id=eq.${roomId}`
      }, (payload) => {
        const updated = payload.new;
        if (updated.status === 'accept') {
          toast.success(`Your ${updated.song_name} request was accepted!`);
        } else if (updated.status === 'declined') {
          toast.error(`Your ${updated.song_name} request was declined.`);
        }
      })
      .subscribe();
  
    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [roomId, supabaseClient, userId]);
  
}

export const useGetRequstedSongs=(userId:string,roomId:string)=>{

  const {supabaseClient}=useSessionContext()
  const [requests,setRequests]=useState<SongRequestLog[]>([])

  const fetchSongRequests=async(roomId:string)=>{
    const {data,error}=await supabaseClient.from('songs_requests_log').select('*').eq('room_id',roomId)
    if(error) console.log(error.message)
    
    setRequests(data as SongRequestLog[])
  }

  useEffect(() => {

    if (!userId || !roomId) return;

    fetchSongRequests(roomId)

    const channel = supabaseClient
    .channel(`song-requests-${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'songs_requests_log',
      filter: `room_id=eq.${roomId}`
    }, (payload) => {
      const newRow = payload.new;
      toast("New Request has been recieved",{duration:4000})
      setRequests((prev)=>[newRow as SongRequestLog,...prev])
    })
    .subscribe();

  return () => {
    supabaseClient.removeChannel(channel);
  };
}, [roomId, userId]);

  return requests
}

export const useRealtimeRooms=(userId?:string,roomId?:string)=>{

  const {supabaseClient}=useSessionContext()
  const [newRoomDetails,setNewRooomDetails]=useState<Room>()
  useEffect(() => {
    if (!userId || !roomId) return;
    const channel = supabaseClient
    .channel(`song-requests-${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'rooms',
      filter: `room_id=eq.${roomId}`
    }, (payload) => {
      const updated = payload.new as Room;
      setNewRooomDetails(updated) 
     
    })
    .subscribe();

  return () => {
    supabaseClient.removeChannel(channel);
  };
}, [roomId, supabaseClient, userId]);

return useMemo(()=>newRoomDetails,[newRoomDetails])

}

export const RealtimeDetector = () => {
  const{supabaseClient}=useSessionContext()
  useEffect(() => {
    const checkRealtime = () => {
      const channels = supabaseClient.getChannels();
      console.log('🔍 Active channels:', channels.length);
      
      if (channels.length > 0) {
        console.log('Real-time is ACTIVE');
        channels.forEach((channel, idx) => {
          console.log(`Channel ${idx}:`, channel.topic);
        });
      } else {
        console.log('No active real-time channels');
      }
    };
    
    // Check immediately and every 5 seconds
    checkRealtime();
    const interval = setInterval(checkRealtime, 5000);
    
    return () => clearInterval(interval);
  }, []);
}