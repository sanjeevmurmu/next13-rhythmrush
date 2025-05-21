import { PublicUserDetails, Room } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";


const getRoomDetails = async (id: string) => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const { data:room, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.log('[Server-room_details]',error.message);
  }

  if(room){
    const host=room.host
    let users:string[]=room.members || []
    users.unshift(host)

    const { data:roommembers, error } = await supabase
    .from('users')
    .select('id,full_name,avatar_url')
    .in('id', users)

  if (error) {
    console.log('[Server]',error.message);
  }
  console.log('get',roommembers,users)

  if(roommembers) return {room:room as Room,members:roommembers as PublicUserDetails[]}
  }
 return {}
};

export default getRoomDetails;
