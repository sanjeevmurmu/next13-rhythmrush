import { create } from 'zustand';

interface PlayerStore extends RoomPlayerContext{
  queue: string[];
  activeId?: string;
  setId: (id: string) => void;
  setQueue: (queue: string[]) => void;
  reset: () => void;

}


interface RoomPlayerContext{
  roomsongisplaying:boolean;
  roomId?:string|null;
  start:number
  playback:number;
  isHost:boolean;
  setRoomId:(val:string)=>void;
  setPlayback:(val:number)=>void
  setStart:(val:number)=>void
  setIsHost:(val:boolean)=>void;
  setRoomSongIsPlaying:(val:boolean)=>void
}


const usePlayer = create<PlayerStore>((set) => ({
  activeId: undefined,
  queue: [],
  isHost:true,
  playback:0,
  roomId:null,
  roomsongisplaying:false,
  start:0,
  setId: (id: string) => set({ activeId: id }),
  setQueue: (list: string[]) => set({ queue:list}),
  reset: () => set({queue:[],activeId:undefined,isHost:true,playback:0,roomId:null,start:0,roomsongisplaying:false}),
  setIsHost:(val)=>set({isHost:val}),
  setStart:(val:number)=>set({start:val}),
  setPlayback:(val:number)=>set({playback:val}),
  setRoomId:(val:string)=>set({roomId:val}),
  setRoomSongIsPlaying:(val:boolean)=>set({roomsongisplaying:val}),
}));


export default usePlayer;
