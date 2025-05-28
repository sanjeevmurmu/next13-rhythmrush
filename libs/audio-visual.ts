'use client'

let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let audioSource: AudioNode | null = null;

const sprite_images = [
  "/visuals/drum.png",
  "/visuals/femalesinger.png",
  "/visuals/guitar.png",
  "/visuals/keyboard.png",
  "/visuals/malesinger.png",
  "/visuals/saxophone.png"
];

let loadedSprites: HTMLImageElement[] = [];
let spritesReady = false;

function preloadImages(imageUrls: string[]) {
  return Promise.all(
    imageUrls.map((url) => {
      return new Promise<{ url: string; image: HTMLImageElement }>((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve({ url, image: img });
        img.onerror = (event) => reject(new Error(`Failed to load ${url} ${event}`));
      });
    })
  );
}

async function preloadSpritesOnce() {
  if (spritesReady) return Promise.resolve();

  const results = await preloadImages(sprite_images);
  loadedSprites = results.map(({ image }) => image);
  spritesReady = true;
}

export function initializeVisualization(canvas: HTMLCanvasElement, audio: any, isPlaying: boolean) {
  preloadSpritesOnce().then(() => {
    if (audio.context) {
      audioCtx = audio.context;
    } else {
      audioCtx = new AudioContext();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 5;

    if (!analyser) {
      if (audio instanceof HTMLMediaElement) {
        audioSource = audioCtx!.createMediaElementSource(audio);
      } else if (typeof audio.connect === "function") {
        audioSource = audio;
      } else {
        audioSource = audioCtx!.createBufferSource();
      }

      analyser = audioCtx!.createAnalyser();
      audioSource?.connect(analyser);
      analyser.connect(audioCtx!.destination);
    }

    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function animate() {
      if (ctx && analyser) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);
        CircleVisualiser(bufferLength, dataArray, canvas, ctx);
        if (isPlaying) {
          requestAnimationFrame(animate);
        }
      }
    }

    animate();
  });
}

export function cleanupVisualization() {
  if (analyser) {
    analyser.disconnect();
  }
  audioSource = null;
  analyser = null;
}

function CircleVisualiser(
  bufferLength: number,
  dataArray: Uint8Array,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 140;
  const barWidth = 10;
  const totalBars = bufferLength / 2;
  const gapSize = 10;

  for (let i = 0; i < totalBars; i++) {
    const barHeight = dataArray[i] * 0.3;
    const angle = (i / totalBars) * Math.PI * 2 - Math.PI / 2;

    const startX = centerX + Math.cos(angle) * radius;
    const startY = centerY + Math.sin(angle) * radius;
    const endX = startX + Math.cos(angle) * barHeight;
    const endY = startY + Math.sin(angle) * barHeight;

    const hue = 120 + (i / totalBars) * 180;
    ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.lineWidth = barWidth;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    if (spritesReady && loadedSprites.length > 0) {
      const spriteSize = 18;
      const sprite = loadedSprites[Math.floor(Math.random() * loadedSprites.length)];
      const spriteX = endX + Math.cos(angle) * (gapSize + spriteSize / 2) - spriteSize / 2;
      const spriteY = endY + Math.sin(angle) * (gapSize + spriteSize / 2) - spriteSize / 2;
      ctx.drawImage(sprite, spriteX, spriteY, spriteSize, spriteSize);
    }
  }
}
