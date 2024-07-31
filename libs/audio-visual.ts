let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let audioSource: AudioNode | null = null;


const sprite_images=[
"visuals/drum.png",
"visuals/femalesinger.png",
"visuals/guitar.png",
"visuals/keyboard.png",
"visuals/malesinger.png",
"visuals/saxophone.png"]

const spriteArray=sprite_images.map(src=>{
  const sprite=new Image()
  sprite.src=src
  return sprite
})

export function initializeVisualization(canvas: HTMLCanvasElement, audio: any, isPlaying: boolean) {
    if (audio.context) {
      // console.log("context")
        audioCtx = audio.context;
      }else {
        audioCtx = new AudioContext();
      }

        const ctx = canvas.getContext('2d');

        // console.log(audio)
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.shadowOffsetX=2
        ctx.shadowOffsetY=5

        // console.log(canvas.width,canvas.height)
        if (!analyser) {
                // Check if audio is an HTMLMediaElement
                if (audio instanceof HTMLMediaElement) {
                    audioSource = audioCtx!.createMediaElementSource(audio);
                } 
                // Check if audio has a connect method (like Howler.js sound objects)
                else if(typeof audio.connect==="function"){
                    audioSource=audio;
                }
                else{
                    console.warn('Unable to determine audio source type. Visualization may not work correctly.');
                    audioSource = audioCtx!.createBufferSource();
                } 
                
            analyser = audioCtx!.createAnalyser();
            audioSource?.connect(analyser);
            analyser.connect(audioCtx!.destination);
            // console.log(analyser,audioSource)
        }

  analyser.fftSize = 512;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  // console.log(bufferLength,dataArray)

  const barWidth = 20;
  let x;

  function animate() {
    x = 0;
    if(ctx && analyser){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);
        CircleVisualiser(bufferLength, dataArray, canvas, ctx);
        if (isPlaying) {
            requestAnimationFrame(animate);
        }
    }
  }

  
    animate();
  
}

export function cleanupVisualization() {
  if (analyser) {
      analyser.disconnect();
  }
  audioSource = null;
  analyser = null;
}



function CircleVisualiser(bufferLength: number, dataArray: Uint8Array, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 140
  const barWidth = 10;
  const totalBars = bufferLength / 2; // Use half of the buffer for a full circle

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < totalBars; i++) {
      const barHeight = dataArray[i]*0.3; 
      const angle = (i / totalBars) * Math.PI * 2 - Math.PI / 2; // Start from the top (subtract PI/2)
      const gapSize=10
      const startX = centerX + Math.cos(angle) * radius;
      const startY = centerY + Math.sin(angle) * radius;
      const endX = startX + Math.cos(angle) * barHeight;
      const endY = startY + Math.sin(angle) * barHeight;

      const hue =120 +(i / totalBars) * 180;
      ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.lineWidth = barWidth;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      const spriteSize = 18;
      const sprite=spriteArray[Math.floor(Math.random()*6)]      
      const spriteX = endX + Math.cos(angle) * (gapSize + spriteSize / 2) - spriteSize / 2;
      const spriteY = endY + Math.sin(angle) * (gapSize + spriteSize / 2) - spriteSize / 2;

      ctx.drawImage(sprite, spriteX, spriteY, spriteSize, spriteSize);
    }
}