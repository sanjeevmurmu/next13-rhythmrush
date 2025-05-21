import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useSessionContext,useUser } from "@supabase/auth-helpers-react";

const RecentlyPlayedSong = (songId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [recdata, setRecData] = useState(undefined);
  const { supabaseClient } = useSessionContext();
  const user=useUser()

  useEffect(() => {
    if (!songId) {
      return;
    }
    setIsLoading(true);

    const SendSong = async () => {
      const { data, error } = await supabaseClient.rpc('insert_or_move_recent_song', {
      p_user_id: user?.id,
      p_song_id: songId,
    })

      if (error) {
        console.log('[Server]',error)
        setIsLoading(false);
        return toast.error(error.message);
      }
      
      setRecData(data);
      setIsLoading(false);
    
    }
    SendSong();
  }, [songId, supabaseClient, user?.id]);

};

export default RecentlyPlayedSong;
