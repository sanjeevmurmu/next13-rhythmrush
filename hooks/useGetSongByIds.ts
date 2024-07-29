import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useSessionContext } from "@supabase/auth-helpers-react";

import { Song } from "@/types";
import { customSort } from "@/libs/customsort";

const useSongByIds = (ids?: string[]) => {
  const [isLoading, setIsLoading] = useState(false);
  const [songs, setSongs] = useState<Song[] | undefined>(undefined);
  const { supabaseClient } = useSessionContext();


  useEffect(() => {
    if (!ids) {
      return;
    }

    setIsLoading(true);

    const fetchSong = async () => {
      const { data, error } = await supabaseClient
        .from('songs')
        .select('*')
        .in('id', ids)

      if (error) {
        setIsLoading(false);
        return toast.error(error.message);
      }

      const sortedSongs = customSort(data, ids);
    //   console.log(data)
    //   console.log(sortedSongs)
      setSongs(sortedSongs as Song[]);
      setIsLoading(false);
    }

    fetchSong();
  }, [ids, supabaseClient]);

  return useMemo(() => ({
    isLoading,
    songs
  }), [isLoading, songs]);
};

export default useSongByIds;
