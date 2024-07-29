import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { Song } from "@/types";

const getSongByIds = async (ids: string[]): Promise<Song[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .in('id', ids)
 

  if (error) {
    console.log(error.message);
  }

  return (data as any) || [];
};

export default getSongByIds;
