import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useSessionContext } from "@supabase/auth-helpers-react";

import { Song } from "@/types";
import { customSort } from "@/libs/customsort";

const useSongByIds = (ids?: string[]) => {
  const [isLoading, setIsLoading] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const { supabaseClient } = useSessionContext();
  const fetchedIds=useRef<Set<string>>(new Set())


  useEffect(() => {
    if (!ids || ids.length===0) {
      return;
    }

    const newIds=ids.filter(id=>!fetchedIds.current.has(id))

    if(newIds.length===0){
      // If no new IDs, just reorder the existing songs 
      setSongs(prevSongs => customSort(prevSongs!, ids));
      return;
    }

    setIsLoading(true);

    const fetchSong = async () => {
      const { data, error } = await supabaseClient
        .from('songs')
        .select('*')
        .in('id', newIds)

      if (error) {
        setIsLoading(false);
        return toast.error(error.message);
      }

      const newSongs = data as Song[];
      newIds.forEach(id => fetchedIds.current.add(id));
      setSongs(prevSongs => {
        const updatedSongs = [...prevSongs, ...newSongs];
        // console.log("Fetched and sorted songs:", updatedSongs);
        return customSort(updatedSongs, ids);
      });
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
