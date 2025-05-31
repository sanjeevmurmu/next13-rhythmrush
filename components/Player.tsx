"use client";

import { useEffect, useState,useCallback, useMemo} from "react";

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
  const memoizedSongs=useMemo(()=>player.queue,[player.queue])
  const { songs } =useGetSongByIds(memoizedSongs)
  const{updateCurrentRoomQueue,
        updateCurrentSonginRoom,
        updatePlaybackStatusinRoom,
        updateSongStartedAtinRoom,error}=useRooms()

        
        
  const songUrl = useLoadSongUrl(song!);

  console.log(memoizedSongs,songs)

  const [looptype, setLoopType] = useState<LoopType>(0);
  const [orderedSongs,setOrderedSongs]=useState(songs)

  useEffect(()=>{
    if(songs){
      setOrderedSongs(songs)
    }
  },[songs])

  useEffect(()=>{
    currentSong()
  },[player.activeId,player.roomId])

  RecentlyPlayedSong(player.activeId);
  
  console.log(player)

  const onReorder=useCallback((newOrder:Song[])=>{
    console.log('new Order',songs)
    setOrderedSongs(newOrder)
    player.setQueue(newOrder.map(song=>song.id))
    updateQueue()
  },[player])
  
  
  const updateQueue=async()=>{
    await updateCurrentRoomQueue(player.queue,player.roomId)
    if(error) console.log(error)
  }

  const songStarted=async()=>{
    await updateSongStartedAtinRoom(Date.now(),player.roomId)
    if(error) console.log(error)
  }

  const currentSong=async()=>{
    await updateCurrentSonginRoom(player.activeId,player.queue,player.roomId)
    if(error) console.log(error)
  }
  
  const updatePlayback=async(time:number)=>{
    const result =await updatePlaybackStatusinRoom(time,player.roomId)
    if(error) console.log(error)
    return result
  }
  
  if (!song || !songUrl || !player.activeId||!orderedSongs) {
    return null;
  }
  
const shouldShowPlayer = !player.roomId && !!player.activeId 

let allSongs = looptype === 1 
    ? orderedSongs.filter(song => song.id === player.activeId)
    : orderedSongs;

  return (
    shouldShowPlayer && <>
    <QueueMenu allSongs={allSongs} activeId={player.activeId} onReorder={onReorder} host={player.isHost} />   
    <PlayerContent key={songUrl} song={song} songUrl={songUrl} looptype={looptype} setLoopType={setLoopType} startedAt={songStarted} playbackTime={updatePlayback} />
    </>
  );
}

export default Player;
