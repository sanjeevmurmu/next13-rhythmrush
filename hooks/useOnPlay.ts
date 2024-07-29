import { Song } from "@/types";

import usePlayer from "./usePlayer";
import useSubscribeModal from "./useSubscribeModal";
import useAuthModal from "./useAuthModal";
import { useUser } from "./useUser";

const useOnPlay = (songs: Song[]) => {
  const player = usePlayer();
  const subscribeModal = useSubscribeModal();
  const authModal = useAuthModal();
  const { subscription, user } = useUser();

  const onPlay = (playingid: string) => {
    // console.log(id)
    if (!user) {
      return authModal.onOpen();
    }

    // if (!subscription) {
    //   return subscribeModal.onOpen();
    // }

    player.setId(playingid)
  
    let allsongs=songs.map((song)=>song.id)
    let prevsongs=allsongs.slice(0,allsongs.indexOf(playingid)+1).reverse()
    let nextsongs=allsongs.slice(allsongs.indexOf(playingid)+1,allsongs.length)
    allsongs=prevsongs.concat(nextsongs)  
    player.setIds([...allsongs]);
    
  }

  return onPlay;
};

export default useOnPlay;
