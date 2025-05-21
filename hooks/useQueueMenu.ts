import { create } from 'zustand';

interface QueueMenuStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useQueueMenu = create<QueueMenuStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useQueueMenu;
