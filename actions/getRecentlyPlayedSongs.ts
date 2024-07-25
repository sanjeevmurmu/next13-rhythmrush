import { Song } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getRecentlyPlayedSongs = async (): Promise<Song[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();


  
  const { data:ids } = await supabase 
  .from('users')
  .select('recent_songs')
  .eq('id', session?.user?.id)
    
  
  
  console.log(ids)
  
  if (!ids) return [];
  
  const { data:SongsData, error } = await supabase
  .from('songs')
    .select('*')
    .in('id',ids[0]["recent_songs"])
    .order('created_at', { ascending: false })
    
  console.log(SongsData)
    if (error) {
      console.log(error.message);
    }

  if (!SongsData) return [];

  return SongsData.map((item) => ({
    ...item as Song
  }))
};

export default getRecentlyPlayedSongs;
