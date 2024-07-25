import { create } from 'zustand';

interface QueueSidebarStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useQueueSidebar = create<QueueSidebarStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useQueueSidebar;
