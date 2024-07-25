import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { UserDetails } from "@/types";


const getUserDetails = async():Promise<UserDetails> => {
    const supabase=createServerComponentClient({
        cookies:cookies
    })
    const {data:sessionData,error:sessionError}=await supabase.auth.getSession()
  
    if(sessionError){
        console.log(sessionError.message)
        return {'id':''}
    }

    const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', sessionData.session?.user.id)
    .single()


  if (error) {
    console.log(error.message);
  }
  console.log(data)
  return (data as any) || {};
}

export default getUserDetails