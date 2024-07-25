import { Song } from '@/types'
import React from 'react'
import MediaItem from '../MediaItem'

interface QueueListProps{
    songs:Song[]
}

const QueueList = ({songs}:QueueListProps) => {
  return (
    <div className="flex flex-col gap-y-2 mt-4 px-3">
    {songs.map((item) => (
          <MediaItem 
            key={item.id} 
            data={item}
          />
        ))}
  </div>
  )
}

export default QueueList
