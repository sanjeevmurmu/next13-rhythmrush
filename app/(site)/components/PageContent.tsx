// shows all the songs fetched from the db
// #TODO fetch only recently 5 uploaded songs
"use client";

import { Song } from "@/types";
import useOnPlay from "@/hooks/useOnPlay";
import SongItem from "@/components/SongItem";



interface PageContentProps {
  songs: Song[];
}

const PageContent: React.FC<PageContentProps> = ({
  songs
}) => {
// calls hook useOnPlay to pass the all songs in the context
  const onPlay = useOnPlay(songs);




  if (songs.length === 0) {
    return (
      <div className="mt-4 text-neutral-400">
        No songs available.
      </div>
    )
  }


  return ( 
    <div 
      className="
        grid 
        grid-cols-2 
        sm:grid-cols-3 
        md:grid-cols-3 
        lg:grid-cols-4 
        xl:grid-cols-5 
        2xl:grid-cols-8 
        gap-4 
        mt-4
      "
    >
      {/* mapping each song on a song item to show their details and onclick passing the song id  to the onPlay function in useOnPlay hook*/}
      {songs.map((item) => (
        <SongItem 
          onClick={(id: string) => onPlay(id)} 
          key={item.id} 
          data={item}
        />
      ))}
    </div>
  );
}
 
export default PageContent;