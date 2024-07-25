"use client";

import {useSessionContext } from "@supabase/auth-helpers-react";
import { useState,useEffect } from "react";

import usePlayer from "@/hooks/usePlayer";
import useLoadSongUrl from "@/hooks/useLoadSongUrl";
import useGetSongById from "@/hooks/useGetSongById";
import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";

import PlayerContent from "./PlayerContent";

const Player = () => {

  const {supabaseClient} =useSessionContext()
  const {user}=useUser()
  const authModal = useAuthModal();

  const player = usePlayer();
  const { song } = useGetSongById(player.activeId);

  const songUrl = useLoadSongUrl(song!);

  const [recData, setRecData] = useState([]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    if (recData.length > 0) {
      sendData();
      // console.log('effect', recData);
    }
  }, [recData, user?.id]);

  useEffect(() => {
    fetchData(player.activeId);
  }, [player.activeId]);

 const fetchData = async (id: any) => {
  if (!user) {
    return authModal.onOpen();
  }
  // console.log('handle', recData);
  const { data:rpData, error } = await supabaseClient
    .from('users')
    .select('recent_songs')
    .eq('id', user?.id);
  // console.log("handle", rpData, error);
  if(error){
    console.log(error)
  }
  // @ts-ignore
  setRecData([id,...rpData[0].recent_songs]);

};

const sendData = async () => {
  console.log("recData updated:", recData);
  
  const { data, error } = await supabaseClient
  .from('users')
  .update({ recent_songs: recData })
  .eq('id', user?.id)
  .select()
          
  if (error) {
    console.log(error)
  } else {
    // console.log(recData,'    ',data);
  }
};

if (!song || !songUrl || !player.activeId) {
  return null;
}

  return (
    <div 
      className="
        fixed 
        bottom-0 
        bg-black 
        w-full 
        py-2 
        h-[80px] 
        px-4
      " 
    >
      <PlayerContent key={songUrl} song={song} songUrl={songUrl} />
    </div>
  );
}

export default Player;
