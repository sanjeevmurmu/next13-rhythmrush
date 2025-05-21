import RoomSearch from './components/RoomSearch';
import RoomMembers from './components/RoomMembers';
import getRoomDetails from '@/actions/getRoomDetails';
import { notFound } from 'next/navigation';
import getUserDetails from '@/actions/getUserDetails';


const Room = async({params,
}: {
  params: { id:string };
}) => {


    const{room,members}=await getRoomDetails(params.id)
    const user= await getUserDetails()

    console.log(room)
    
    if(!room){
        notFound()
    }
       

    return (
        <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden 
        overflow-y-auto">
            <div className='flex flex-col p-2 space-y-4 h-full'>
            <div className='flex justify-start'>
                <h1 className='text-white text-5xl font-semibold w-32 flex-1'>Room</h1>
            </div>
            <RoomSearch roomId={room.id} userId={user.id}/>
            <RoomMembers room={room} members={members} userId={user.id}/>
            </div>
        </div>
    )
}

export default Room
