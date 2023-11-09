"use client";

import useSound from "use-sound";
import { useEffect, useState } from "react";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { FaSpinner } from "react-icons/fa";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";

import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";

import LikeButton from "./LikeButton";
import MediaItem from "./MediaItem";
import Slider from "./Slider";

interface PlayerContentProps {
  song: Song;
  songUrl: string;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ song, songUrl }) => {
  const player = usePlayer();
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);


  const Icon = isLoading ? FaSpinner : isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  const onPlayNext = () => {
    if (player.ids.length === 0) {
      return;
    }

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const nextSong = player.ids[currentIndex + 1];

    if (!nextSong) {
      return player.setId(player.ids[0]);
    }

    player.setId(nextSong);
  };

  const onPlayPrevious = () => {
    if (player.ids.length === 0) {
      return;
    }

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const previousSong = player.ids[currentIndex - 1];

    if (!previousSong) {
      return player.setId(player.ids[player.ids.length - 1]);
    }

    player.setId(previousSong);
  };

  const [play, { pause, sound, duration }] = useSound(songUrl, {
    volume: volume,
    onplay: () => {
      setIsLoading(false);
      setIsPlaying(true);
    },
    onend: () => {
      setIsPlaying(false);
      onPlayNext();
    },
    onpause: () => setIsPlaying(false),
    format: ["mp3"],
  });

  useEffect(() => {
    sound?.play();
    
    return () => {
      sound?.unload();
    };
  }, [sound]);

  const handlePlay = () => {
    // console.log(sound);
    if (!isPlaying) {
      play();
    } else {
      pause();
    }
  };

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(1);
    } else {
      setVolume(0);
    }
  };


  const formatTime = (miliseconds: number, updating: boolean) => {
    // console.log(miliseconds)
    let seconds = miliseconds;
    if (!updating) {
      seconds = miliseconds / 1000;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      return `${hours.toString().padStart(2, "0")}:${(minutes % 60)
        .toString()
        .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }

    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSeek=(value)=>{
    sound?.seek(value)
  }

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((time) => time + 1);
      }, 1000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [isPlaying]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-7 h-full">
      <div className="flex w-full justify-start col-span-3">
        <div className="flex items-center gap-x-4">
          <MediaItem data={song} />
          <LikeButton songId={song.id} />
        </div>
      </div>
      <div
        className="
            flex 
            md:hidden 
            col-auto 
            w-full 
            justify-end 
            items-center
          "
      >
        <div
          onClick={handlePlay}
          className="
              h-10
              w-10
              flex 
              items-center 
              justify-center 
              rounded-full 
              bg-white 
              p-1 
              cursor-pointer
            "
        >
          <Icon size={30} className="text-black" />
        </div>
      </div>

      <div
        className="
            hidden
            h-full
            md:flex 
            justify-center 
            items-center 
            w-full 
            max-w-[722px] 
            gap-x-6
          "
      >
        <AiFillStepBackward
          onClick={onPlayPrevious}
          size={30}
          className="
              text-neutral-400 
              cursor-pointer 
              hover:text-white 
              transition
            "
        />
        <div
          onClick={handlePlay}
          className="
              flex 
              items-center 
              justify-center
              h-10
              w-10 
              rounded-full 
              bg-white 
              p-1 
              cursor-pointer
            "
        >
          <Icon size={30} className="text-black" />
        </div>
        <AiFillStepForward
          onClick={onPlayNext}
          size={30}
          className="
              text-neutral-400 
              cursor-pointer 
              hover:text-white 
              transition
            "
        />
      </div>
      <div className="p-2 flex items-center gap-x-2 w-[400px]">
        <div className="text-xs w-12">{formatTime(currentTime, true)}</div>
        <Slider
          value={currentTime}
          defaultValue={1000}
          max={Math.floor(duration / 1000)}
          onChange={(value) => {setCurrentTime(value); handleSeek(value)}}
        />
        <div className="text-xs w-12">{formatTime(duration, false)}</div>
      </div>
      <div className="hidden md:flex w-full justify-end pr-2 col-end-8">
        <div className="flex items-center gap-x-2 w-[120px]">
          <VolumeIcon
            onClick={toggleMute}
            className="cursor-pointer"
            size={34}
          />
          <Slider
            value={volume}
            onChange={(value) => setVolume(value)}
            defaultValue={1}
            max={1}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerContent;
