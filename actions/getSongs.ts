import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { Song } from "@/types";

const getSongs = async (limit = 0): Promise<Song[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });
  let songData:Song[] = []
  try {
    if (limit > 0) {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false }).limit(limit);

      songData = data as Song[]
    }
    else {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });
      songData = data as Song[]
    }
  } catch (error) {
    console.log(error);
  }




  return (songData as any) || [];
};

export default getSongs;
