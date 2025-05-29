import {  useEffect, useState } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { SongRequestLog } from "@/types";


export function useRooms() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const { supabaseClient } = useSessionContext();

  const createRoom = async (userId?:string) => {
    setLoading(true);
    setError(null);

    if (!userId) {
      setError("User not logged in");
      setLoading(false);
      return null;
    }

    const newCode = Math.floor(100000 + Math.random() * 900000); // 6-digit code
    const newLink = `${window.location.origin}/room/join?code=${newCode}`; // Short link

    const { data, error: insertError } = await supabaseClient
      .from("rooms")
      .insert([
        {
          code: newCode,
          link: newLink,
          host: userId,
          members:[],
          queue:[],
          created_by: userId,
        },
      ])
      .select("id, host")
      .single(); // gets the inserted row

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return null;
    }
    return {
      roomId: data.id,
      host: data.host,
    };
  };

  const joinRoom = async (code: string,userId:string) => {
    setLoading(true)
    setError(null)

    if (!userId) {
      setError("User not logged in");
      setLoading(false);
      return {message:'not a valid user Id',success:false};
    }


    if (code.length > 6) {
      code = code.slice(0, 7)
    }

    const { data:room, error: searchError } = await supabaseClient.from("rooms").select('id,members').eq('code', code).single()

    if(searchError){
      setError(searchError.message)
      setLoading(false)
      return {message:'room not found',success:false}
    }

    let members=room.members || []
    const found = members.findIndex((mem: string) => mem == userId)
    console.log("[joinroom]",members,found)

    if (found===-1) {
      members.push(userId)  
      const { data, error: joinError } = await supabaseClient.from("rooms").update([
        {
          'members': members
        }
      ]).eq('id', room.id).single()
      
      console.log("[joinroom]",data)

      if (joinError) {
        setError(joinError.message)
        setLoading(false)
        return {message:'not able to join',success:false}
      }
      
    setLoading(false)
    return {roomId:room.id,success:true,message:"You have joined the room"}
  }

    setLoading(false)
    return {message:'You are already present in the room',success:true,roomId:room.id}
  }

  const leaveRoom=async(roomId:string,userId:string)=>{
    setLoading(true)
    if (!userId) {
      setError("User not logged in");
      setLoading(false);
      return null;
    }

    const {data:roomData,error}=await supabaseClient.from('rooms').select('*').eq('id',roomId).single()

    if(error) setError(error.message)

    if(!roomData){
      setError("not a valid room ID")
      return {success:false,message:''}
    } 

    if(userId===roomData.host)
      {
        if(roomData.members && roomData.members.length>0){
          const members:string[]=roomData.members
          const newHost=members.shift()
          const {data,error}=await supabaseClient.from('rooms').update([
            {
              'host':newHost,
              'members':members
            }
          ]).eq('id',roomId).select("id").single()

          if(error) setError(error.message)
          
        }
      else{
        return deleteRoom(roomId)
      }
    }
    else{
      if(roomData.members){
        const members=roomData.members.filter((id: string)=>id!=userId)
        const {data:membersdata,error}=await supabaseClient.from('rooms').update([
          {
            'members':members
          }
        ]).eq('id',roomId)
        if(error) setError(error.message)
      }
    }
    setLoading(false)
    return {success:true,message:'You have left the room'}
  }

  const deleteRoom=async(roomId:string)=>{
    setLoading(true)
    const {data,error}=await supabaseClient.from('rooms').delete().eq('id',roomId)
    if(error) setError(error.message)
    setLoading(false)
    return {success:true,message:'You have deleted the room'}
  }

  const updateCurrentSonginRoom=async(id?:string,list?:string[],roomId?:string)=>{
      if(!roomId || !id || !list) return
      const {data,error}=await supabaseClient.from('rooms').update([{
        'current_song_id':id,
        'queue':list,
        'current_song_started_at':0,
        'is_playing':false,
        'accumulated_playback_time':0,
      }]).eq('id',roomId)
      
      if(error) {
        console.log('current_song',error.message)
        setError(error.message)
      }
  }

  const updateCurrentRoomQueue=async(ids:string[],roomId?:string,)=>{
        if(!roomId || !ids) return   
        const {data,error}=await supabaseClient.from('rooms').update([{
          'queue':ids
        }]).eq('id',roomId)
        if(error) 
          {
            setError(error.message)
            console.log('room_queue',error?.message)
          }
      }
  

  const updateSongStartedAtinRoom=async(time:number,roomId?:string)=>{
      if(!roomId) return
        const {data,error}=await supabaseClient.from('rooms').update([{
          'current_song_started_at':time,
          'is_playing':true
        }]).eq('id',roomId)
        if(error) 
          {
            console.log('song_start',error.message)
            setError(error.message)
          } 
      }
  

  const updatePlaybackStatusinRoom=async(duration:number,roomId?:string)=>{
      
    console.log(duration,roomId)
    const {data,error}=await supabaseClient.from('rooms').update([{
        'accumulated_playback_time':duration,
        'is_playing':false
      }]).eq('id',roomId)
      if(error){
        setError(error.message)
        console.log('status',error.message)
        return {status:error.message,accumulated_playback:duration}

      }
      else{
        return {status:'updated',accumulated_playback:duration}
      } 
      }
    
  
    const respondSongRequests=async(requestId:string,status:string)=>{
      const {error}=await supabaseClient.from('songs_requests_log').update([{
        'status':status
      }]).eq('requestId',requestId)
  
      if(error) console.log(error.message)
      
    }
  
    const sendSongRequests=async(roomId:string,songId:string,userId:string,songname:string)=>{
      const {error}=await supabaseClient.from('songs_requests_log').insert([
        {
          'song_id':songId,
          'user_id':userId,
          'room_id':roomId,
          'song_name':songname,
          'status':'pending'
  
        }
      ])
  
      if(error) {
        console.log(error.message)
        return {message:'Internal Server Error'}
      }
      
      return {message:'The request has been succesfully sent'}
    }



  return {
    createRoom,
    joinRoom,
    deleteRoom,
    leaveRoom,
    updateCurrentSonginRoom,
    updateCurrentRoomQueue,
    updateSongStartedAtinRoom,
    updatePlaybackStatusinRoom,
    respondSongRequests,
    sendSongRequests,
    loading,
    error,
  };
}
