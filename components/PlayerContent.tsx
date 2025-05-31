"use client";

import useSound from "use-sound";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { RxLoop } from "react-icons/rx";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { FaSpinner } from "react-icons/fa";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { MdOutlineQueueMusic } from "react-icons/md";
import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";
import { TbCircle1Filled } from "react-icons/tb";
import LikeButton from "./LikeButton";
import MediaItem from "./MediaItem";
import Slider from "./Slider";
import useQueueMenu from "@/hooks/useQueueMenu";
import AudioVisualizer from "./AudioVisualizer";
import { useMouseEventsContext } from "@/providers/MouseEventsProvider";
import toast from "react-hot-toast";

interface PlayerContentProps {
  song: Song;
  songUrl: string;
  looptype:number
  setLoopType:Dispatch<SetStateAction<0|1|2>>
  startedAt:()=>void,
  playbackTime:(duration:number)=>void,
}

const PlayerContent: React.FC<PlayerContentProps> = ({ song, songUrl,looptype,setLoopType,startedAt,playbackTime}) => {
  const player = usePlayer();
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(player.playback);
  const [endValue, setendValue] = useState(false)
  const [audio,setAudio]=useState<HTMLAudioElement|null>(null)

  const { isMouseOver } = useMouseEventsContext();

  const {isOpen,onClose,onOpen}=useQueueMenu((state)=>state)

  const Icon = isLoading ? FaSpinner : isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;


  const onPlayNext = () => {
    if (player.queue.length === 0 || looptype==1) {
      return;
    }

    const currentIndex = player.queue.findIndex((id) => id === player.activeId);
    const nextSong = player.queue[currentIndex + 1];

    if (!nextSong && looptype!==0) {
      return player.setId(player.queue[0]);
    }

    player.setId(nextSong);
  };

  const onPlayPrevious = () => {
    if (player.queue.length === 0 || looptype==1) {
      return;
    }


    const currentIndex = player.queue.findIndex((id) => id === player.activeId);
    const previousSong = player.queue[currentIndex - 1];

    if (!previousSong && looptype!==0) {
      return player.setId(player.queue[player.queue.length - 1]);
    }

    player.setId(previousSong);
  };

  const [play, { pause, sound, duration }] = useSound(songUrl, {
    volume: volume,
    onload:()=>{
      setIsLoading(false);
    },
    onplay: () => {
      setIsPlaying(true);
      startedAt()
      if(player.start>0) setCurrentTime(player.playback+((Date.now()-player.start)/1000))
          },
    onend: () => {
      setIsPlaying(false);
       setCurrentTime(0)
      setendValue(true)
      },
    onpause: () => {
    setIsPlaying(false)
    },
    format: ["mp3"],
  });

 useEffect(() => {
  if (!sound) return;

  // AUTO-PLAY CONDITIONS
  const isInRoom = !!player.roomId;
  const isHost = player.isHost;
  const isSolo = !isInRoom;
  if (isSolo) {
    sound.seek(currentTime);
    play();
    startedAt(); // optional
  } else if (isHost && player.roomsongisplaying) {
    sound.seek(currentTime);
    play();
    startedAt(); // optional
  } else if (!isHost && player.roomsongisplaying) {
    const hostPlayback = player.playback + (Date.now() - player.start) / 1000;
    sound.seek(hostPlayback);
    sound.play();
    setCurrentTime(hostPlayback);
  }

}, [sound]);




  useEffect(() => {
  if (!player.isHost) {
    setCurrentTime(player.playback); // when host sends updated time
  }
}, [player.playback]);


  useEffect(() => {
    if(sound){
      // console.log(sound)
      setAudio(sound._sounds[0]._node);
    }
    return () => {
      sound?.unload();
      setAudio(null)
    };
  }, [sound]);


  const handlePlay = () => {
    if (!sound) return;

  if (!isPlaying && !player.roomsongisplaying) {
    sound.seek(currentTime); // ✅ seek before play
    play();
    if (player.isHost) {
      player.setRoomSongIsPlaying(true);
      startedAt();
    }
  } else {
    if (player.isHost) {
      player.setRoomSongIsPlaying(false);
      playbackTime(currentTime);
    }
    pause();
  }
  }
  

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(1);
    } else {
      setVolume(0);
    }
  };

  const handleSeek = (value:Number) => {
    if(player.isHost){
      sound?.seek(value);
    }
    else{
      toast.error("Not permissible in a room where you are not Host")
    }
  };


  const handleloop=()=>{
    if(looptype==0){
      setLoopType(1)
      sound?.loop(true)
    }
    else if(looptype==1){
      setLoopType(2)
      sound?.loop(false)
    }
    else{
      setLoopType(0)
      sound?.loop(false)
    }
  }

  const handleQueue=()=>{
    if(isOpen){
      onClose()
    }
    else{
      onOpen()
    }
  }

  const formatTime = (miliseconds: number, updating: boolean) => {
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
  

  
  useEffect(() => {
   
    if(endValue && !isPlaying && looptype!==1){
      onPlayNext()
    }
    let timer: string | number | NodeJS.Timer | undefined;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((time) => time + 1);
      }, 1000);
    }
    return () => {
      clearInterval(timer);
      setendValue(false)
    };
  }, [isPlaying,endValue]);


  return (
    <>
    {!isMouseOver && <AudioVisualizer song={song} audioData={{ audio, isPlaying }}/>}
    <div 
      className="
        fixed 
        bottom-0 
        bg-black 
        w-full 
        py-2 
        h-[80px] 
        px-4
      " 
    >
    <div className="grid grid-cols-2 md:grid-cols-3 h-full relative">
      <div className="flex w-full justify-start ">
        <div className="flex items-center gap-x-3">
          <MediaItem data={song} ImgclassName="md:scale-[1.5] mb-4 mr-3" />
          <LikeButton songId={song.id} />
        </div>
      </div>
      {/* mobile view */}
      <div className="md:hidden group absolute flex items-center w-screen top-0 left-0 translate-y-[-35px] translate-x-[-14px]">
        <div className="opacity-0 text-sm w-12 transition absolute top-[-20px] left-0 z-10 translate-y-[20px] translate-x-[3px] group-focus:opacity-100 focus:opacity-100">{formatTime(currentTime, true)}</div>
        <Slider
          value={currentTime}
          defaultValue={1000}
          max={Math.floor(duration as number / 1000)}
          onChange={(value) => {setCurrentTime(value); handleSeek(value)}}
        />
        <div className="opacity-0  text-sm w-12 transition absolute top-[-20px] right-0 z-10 translate-y-[20px] translate-x-[3px] group-focus:opacity-100 focus:opacity-100">{formatTime(duration as number, false)}</div>
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
        <div className="relative" onClick={handleloop}>
        {looptype==1 && <TbCircle1Filled size={10} className=" absolute text-white"/>}
        <RxLoop
      size={15}
      className={`
        ${looptype!==0?"text-white":"text-neutral-400"}
        ${!player.isHost && "hidden"}
        cursor-pointer 
        hover:text-white 
        transition
        mr-4
          `}/> 
        </div>
        <MdOutlineQueueMusic
      onClick={handleQueue}
      size={15}
      className={`
        ${isOpen?"text-white":"text-neutral-400"} 
        cursor-pointer 
          hover:text-white 
          transition
          mr-4
          `}/> 
        <div
          onClick={handlePlay}
          className={`
          ${!player.isHost && "hidden"}
          h-10
          w-10
          flex 
          items-center 
          justify-center 
          rounded-full 
          bg-white 
          p-1 
          cursor-pointer
          `}
          >
          <Icon size={30} className="text-black" />
        </div>
      </div>
     {/* desktop view */}
      <div
        className="
        hidden
        h-full
        md:flex 
        flex-col
        justify-center 
        items-center 
        w-full 
        max-w-[722px] 
        "
        >
        <div className="md:flex justify-center items-center max-w-[722px] gap-x-6">
        <div className={`relative ${!player.isHost && "hidden"}`} onClick={handleloop}>
        {looptype==1 && <TbCircle1Filled size={10} className=" absolute text-white right-0"/>}
        <RxLoop
          size={15}
          className={`
            ${looptype!==0?"text-white":"text-neutral-400"} 
            cursor-pointer 
            hover:text-white 
            transition
            `}/> 
          </div>
             <MdOutlineQueueMusic
      onClick={handleQueue}
      size={15}
      className={`
        ${isOpen?"text-white":"text-neutral-400"} 
        cursor-pointer 
        hover:text-white 
        transition
        mr-4
        `}/> 
        <AiFillStepBackward
          onClick={onPlayPrevious}
          size={30}
          className={
            `
            ${!player.isHost && "hidden"}
            text-neutral-400 
            cursor-pointer 
            hover:text-white 
            transition
            `            
          }
          />
        <div
          onClick={handlePlay}
          className={`
          ${!player.isHost && "hidden"}
          flex 
          items-center 
          justify-center
          h-10
          w-10 
          rounded-full 
          bg-white 
          p-1 
          cursor-pointer
            `}
            >
          <Icon size={30} className="text-black" />
        </div>
        <AiFillStepForward
          onClick={onPlayNext}
          size={30}
          className={
            `
            ${!player.isHost && "hidden"}
            text-neutral-400 
            cursor-pointer 
            hover:text-white 
            transition
            `
          }
          />
          </div>
          <div className="flex items-center gap-x-2 w-[400px]">
        <div className="text-xs w-12">{formatTime(currentTime, true)}</div>
        <Slider
          value={currentTime}
          defaultValue={1000}
          max={Math.floor(duration as number / 1000)}
          onChange={(value) => {setCurrentTime(value); handleSeek(value)}}
          />
        <div className="text-xs w-12">{formatTime(duration as number, false)}</div>
      </div>
      </div>
      <div className="hidden md:flex w-full justify-end pr-2 ">
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
  </div>
  </>
  );
};

export default PlayerContent;
