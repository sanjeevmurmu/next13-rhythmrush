import { customSort } from "@/libs/customsort";
import { Song } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const getRecentlyPlayedSongs = async (): Promise<Song[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();


  
  const { data,error:RecentSongsError } = await supabase 
  .from('users')
  .select('recent_songs')
  .eq('id', session?.user?.id)
  .single()

  if(RecentSongsError){
    console.log(RecentSongsError)
  }
    
  const recent_songs_Ids = data?.recent_songs
  console.log(recent_songs_Ids)
  
  if (!recent_songs_Ids) return [];
  
  const { data:SongsData, error } = await supabase
  .from('songs')
    .select('*')
    .in('id',recent_songs_Ids)
    
  // console.log(SongsData)
    if (error) {
      console.log(error.message);
    }
  
    if (!SongsData) return [];
    
    const SortedSongsData=customSort(SongsData,recent_songs_Ids)

  return SortedSongsData.map((item) => ({
    ...item as Song
  }))
};

export default getRecentlyPlayedSongs
