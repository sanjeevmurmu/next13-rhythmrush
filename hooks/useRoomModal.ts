import { create } from 'zustand';

type Messagetype='join'|'leave'|'request'

interface RoomModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  isNavigating:boolean;
  messageType:Messagetype
  setIsNavigating:(val:boolean,type?:Messagetype)=>void; 
}




const useRoomModal = create<RoomModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  isNavigating:false,
  messageType:'join',
  setIsNavigating:(val,type)=>set({isNavigating:val,messageType:type}),
}));





export default useRoomModal;
