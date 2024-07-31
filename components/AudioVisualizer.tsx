import useLoadImage from "@/hooks/useLoadImage";
import useComponentMouseEvents from "@/hooks/useMouseEvents";
import { cleanupVisualization, initializeVisualization } from "@/libs/audio-visual";
import { useMouseEventsContext } from "@/providers/MouseEventsProvider";
import { Song } from "@/types"
import Image from "next/image"
import { useEffect, useRef } from "react";

interface AudioVisualizerProps{
    song:Song
    audioData:{
        audio:HTMLAudioElement|null;
        isPlaying:boolean
    }
}


const AudioVisualizer = ({song,audioData}:AudioVisualizerProps) => {

    const imagePath = useLoadImage(song);
    const { onMouseEvent } = useMouseEventsContext();
    const componentRef = useComponentMouseEvents({ onMouseEvent });
    const canvasRef=useRef<HTMLCanvasElement>(null)

    useEffect(() => {
      let animationId: number;
      if (canvasRef.current && audioData.audio) {
          const { audio, isPlaying } = audioData;
          const animate = () => {
              initializeVisualization(canvasRef.current!, audio, isPlaying);
              animationId = requestAnimationFrame(animate);
          };
          animate();
      }

      return () => {
          if (animationId) {
              cancelAnimationFrame(animationId);
          }
          cleanupVisualization();
      };
  }, [audioData, song.id]); 

  return (
    <div className={`absolute 
          w-full
          h-full
          inset-0 flex justify-center audio-visual animate-fadein bg-black`} ref={componentRef} >
                  <div 
        className="
          w-full
          h-full 
          overflow-hidden
          blur-md
        "
      >
        <Image
          className="object-cover"
          src={imagePath || '/images/music-placeholder.png'}
          fill
          alt="Image"
        />
      </div>    
      <canvas ref={canvasRef} className="absolute top-0 bottom-0 m-auto w-[75%] h-[75%]" />    
      <div 
                className="
                absolute
                  aspect-square 
                  w-40
                  h-40 
                  top-0 bottom-0
                  m-auto 
                  flex flex-col items-center
                "
            >
              <div className=" relative aspect-square w-32 h-32 rounded-md
                  shadow-2xl
                  overflow-hidden">
                <Image
                  className="object-cover"
                  src={imagePath || '/images/music-placeholder.png'}
                  fill
                  alt="Image"
                  />
                </div>
                <div className="absolute bottom-0 w-full p-2 overflow-hidden">
                    <div className="font-semibold text-white text-center whitespace-nowrap inline-block animate-runningtext">
                        <span className="mr-8">{`${song.title}(by ${song.author})`}</span>
                        <span>{`${song.title}(by ${song.author})`}</span>
                    </div>
                </div>
            </div>
    </div>
  )
}

export default AudioVisualizer
