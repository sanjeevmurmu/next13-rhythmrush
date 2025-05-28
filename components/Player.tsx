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
    currentSong()
  },[player.activeId,player.roomId])

  RecentlyPlayedSong(player.activeId);
  
  console.log(player)

  const onReorder=useCallback((newOrder:Song[])=>{
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
  


let allSongs = looptype === 1 
    ? orderedSongs.filter(song => song.id === player.activeId)
    : orderedSongs;

  return (
    <>
    <QueueMenu allSongs={allSongs} activeId={player.activeId} onReorder={onReorder} host={player.isHost} />   
    <PlayerContent key={songUrl} song={song} songUrl={songUrl} looptype={looptype} setLoopType={setLoopType} startedAt={songStarted} setPlaybackTime={updatePlayback} />
    </>
  );
}

export default Player;
