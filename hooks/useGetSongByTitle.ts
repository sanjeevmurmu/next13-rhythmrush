import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useSessionContext } from "@supabase/auth-helpers-react";

import { Song } from "@/types";

const useSongByTitle = (title?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [songs, setSongs] = useState<Song[] | []>([]);
  const { supabaseClient } = useSessionContext();

  useEffect(() => {
    if (!title) {
      setSongs([])
      return;
    }

    setIsLoading(true);

    const fetchSong = async () => {    
        const { data, error } = await supabaseClient
        .from('songs')
        .select('*')
        .ilike('title', `%${title}%`)
        .order('created_at', { ascending: false })

      if (error) {
        setIsLoading(false);
        return toast.error(error.message);
      }
      
      setSongs(data as any || []);
      setIsLoading(false);
    }

    fetchSong();
  }, [title, supabaseClient]);

  return useMemo(() => ({
    isLoading,
    songs
  }), [isLoading, songs]);
};

export default useSongByTitle;
