"use client";

import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import { MdGroup } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";

import SidebarItem from "./SidebarItem";
import Box from "./Box";
import Library from "./Library";
import { useMemo } from "react";
import useRoomModal from "@/hooks/useRoomModal";
import useAuthModal from "@/hooks/useAuthModal";
import toast from "react-hot-toast";

interface SidebarProps {
  children: React.ReactNode;
  songs: Song[];
}

const Sidebar = ({ children, songs }: SidebarProps) => {
  const pathname = usePathname();
  const player = usePlayer();

  const roomModal = useRoomModal();
  const authModal = useAuthModal();
  const {user}=useUser()



  const routes = useMemo(() => [
    {
      icon: HiHome,
      label: 'Home',
      active: pathname === '/',
      href: '/'
    },
    {
      icon: BiSearch,
      label: 'Search',
      href: '/search',
      active: pathname === '/search'
    }
  ], [pathname]);



  const onClick = async() => {
    
    if (!user) {
      return authModal.onOpen();
    }

    if(pathname.includes('/room')){
      return toast.error("You are already in a room leave it to join a new one");
    }

    
    return roomModal.onOpen();
  }

  return (
    <div
      className={twMerge(`
        flex 
        h-full
        `,
        player.activeId && 'h-[calc(100%-80px)]'
      )}
    >
      <div
        className="
          hidden 
          md:flex 
          flex-col 
          gap-y-2 
          bg-black 
          h-full 
          w-[300px] 
          p-2
        "
      >
        <Box>
          <div className="flex flex-col gap-y-4 px-5 py-4">
            {routes.map((item) => (
              <SidebarItem key={item.label} {...item} />
            ))}
            <div
              className={twMerge(`
                flex 
                flex-row 
                h-auto 
                items-center 
                w-full 
                gap-x-4 
                text-md 
                font-medium
                cursor-pointer
                hover:text-white
                transition
                text-neutral-400
                py-1`,
                pathname.includes('room') && "text-white"
              )
              }
              onClick={onClick}
            >
              <MdGroup size={26} />
              <p className="truncate w-100">Rooms</p>
            </div>
          </div>
        </Box>
        <Box className="overflow-y-auto h-full">
          <Library songs={songs} />
        </Box>
      </div>
      <main className="h-full flex-1 overflow-y-auto py-2">
        {children}
      </main>
    </div>
  );
}

export default Sidebar;
