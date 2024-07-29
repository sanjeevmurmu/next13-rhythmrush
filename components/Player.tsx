"use client";

import {useSessionContext } from "@supabase/auth-helpers-react";
import { useState} from "react";

import usePlayer from "@/hooks/usePlayer";
import useLoadSongUrl from "@/hooks/useLoadSongUrl";
import useGetSongById from "@/hooks/useGetSongById";
import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";

import PlayerContent from "./PlayerContent";
import Queue from "./Queue";
import useGetSongByIds from "@/hooks/useGetSongByIds";
import SendRecentlyPlayedSong from "@/hooks/useRecentlyPlayedSong";

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

  const [looptype, setLoopType] = useState<LoopType>(0);


if (!song || !songUrl || !player.activeId||!songs) {
  return null;
}

let allSongs
if(looptype==1){
  allSongs=songs.filter(song=>song.id===player.activeId)
}
else{
  allSongs=songs
}

  return (
    <>
    <Queue allSongs={allSongs} activeId={player.activeId} setIds={player.setIds} />
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
      <PlayerContent key={songUrl} song={song} songUrl={songUrl} looptype={looptype} setLoopType={setLoopType} />
    </div>
    </>
  );
}

export default Player;
