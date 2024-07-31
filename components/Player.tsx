"use client";

import {useSessionContext } from "@supabase/auth-helpers-react";
import { useEffect, useState,useCallback} from "react";

import usePlayer from "@/hooks/usePlayer";
import useLoadSongUrl from "@/hooks/useLoadSongUrl";
import useGetSongById from "@/hooks/useGetSongById";
import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";

import PlayerContent from "./PlayerContent";
import Queue from "./Queue";
import useGetSongByIds from "@/hooks/useGetSongByIds";
import SendRecentlyPlayedSong from "@/hooks/useRecentlyPlayedSong";
import { Song } from "@/types";


type LoopType=0|1|2

const Player = () => {

  const {supabaseClient} =useSessionContext()
  const {user}=useUser()
  const authModal = useAuthModal();

  const player = usePlayer();
  const { song } = useGetSongById(player.activeId);
  const { songs } =useGetSongByIds(player.ids)

  const {recdata}=SendRecentlyPlayedSong(player.activeId)
  
  const songUrl = useLoadSongUrl(song!);

  // console.log(isMouseOver)

  const [looptype, setLoopType] = useState<LoopType>(0);
  const [orderedSongs,setOrderedSongs]=useState(songs)

  useEffect(()=>{
    if(songs){
      setOrderedSongs(songs)
    }
  },[songs])

  const onReorder=useCallback((newOrder:Song[])=>{
    setOrderedSongs(newOrder)
    player.setIds(newOrder.map(song=>song.id))
  },[player])



if (!song || !songUrl || !player.activeId||!orderedSongs) {
  return null;
}

let allSongs = looptype === 1 
    ? orderedSongs.filter(song => song.id === player.activeId)
    : orderedSongs;

  return (
    <>
    <Queue allSongs={allSongs} activeId={player.activeId} onReorder={onReorder} />   
    <PlayerContent key={songUrl} song={song} songUrl={songUrl} looptype={looptype} setLoopType={setLoopType} />
    </>
  );
}

export default Player;
