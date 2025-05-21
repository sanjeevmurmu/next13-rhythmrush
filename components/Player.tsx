"use client";

import { useEffect, useState,useCallback} from "react";

import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";
import useLoadSongUrl from "@/hooks/useLoadSongUrl";
import useGetSongById from "@/hooks/useGetSongById";
import useGetSongByIds from "@/hooks/useGetSongByIds";
import RecentlyPlayedSong from "@/hooks/useRecentlyPlayedSong";

import PlayerContent from "./PlayerContent";
import QueueMenu from "./QueueMenu";
import { useRooms } from "@/hooks/useRoomsServices";


type LoopType=0|1|2

// 0 = No loop | 1 = Repeat current song | 2 = Repeat Queue

const Player = () => {


  const player = usePlayer();
  const { song } = useGetSongById(player.activeId);
  const { songs } =useGetSongByIds(player.queue)
  const{updateCurrentRoomQueue,
        updateCurrentSonginRoom,
        updatePlaybackStatusinRoom,
        updateSongStartedAtinRoom,error}=useRooms()


  
  const songUrl = useLoadSongUrl(song!);

  // console.log(isMouseOver)

  const [looptype, setLoopType] = useState<LoopType>(0);
  const [orderedSongs,setOrderedSongs]=useState(songs)

  useEffect(()=>{
    if(songs){
      setOrderedSongs(songs)
    }
  },[songs])

  useEffect(()=>{
    const update=async()=>{
      await updateCurrentSonginRoom(player.activeId, player.roomId);
      if(error) console.log(error)
    }
    update()
  },[player.activeId,player.roomId])

  RecentlyPlayedSong(player.activeId);
  
  

  const onReorder=useCallback((newOrder:Song[])=>{
    setOrderedSongs(newOrder)
    player.setQueue(newOrder.map(song=>song.id))
    updateCurrentRoomQueue(player.queue,player.roomId)
  },[player])
  
  
  
  
  
  if (!song || !songUrl || !player.activeId||!orderedSongs) {
    return null;
  }
  


let allSongs = looptype === 1 
    ? orderedSongs.filter(song => song.id === player.activeId)
    : orderedSongs;

  return (
    <>
    <QueueMenu allSongs={allSongs} activeId={player.activeId} onReorder={onReorder} host={player.isHost} />   
    <PlayerContent key={songUrl} song={song} songUrl={songUrl} looptype={looptype} setLoopType={setLoopType} startedAt={updateSongStartedAtinRoom} setPlaybackTime={updatePlaybackStatusinRoom} />
    </>
  );
}

export default Player;
