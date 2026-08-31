import React, { useEffect, useRef, useState } from 'react';

interface WaveformProps {
  audioBuffer: AudioBuffer | null;
  isPlaying: boolean;
  currentTime: number; // Current playback time in seconds
  onSeek: (time: number) => void;
}

const Waveform: React.FC<WaveformProps> = ({ audioBuffer, isPlaying, currentTime, onSeek }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  // Helper to draw the waveform
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const data = audioBuffer.getChannelData(0); // Use first channel
    const step = Math.ceil(data.length / width) * 2; // Downsampling factor for visual clarity
    const amp = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Style Configuration
    const barWidth = 4;
    const gap = 2;
    const totalBars = Math.floor(width / (barWidth + gap));
    const samplesPerBar = Math.floor(data.length / totalBars);

    // Current Playback X Position
    const duration = audioBuffer.duration;
    const progressPercent = currentTime / duration;
    const currentX = width * progressPercent;

    for (let i = 0; i < totalBars; i++) {
      let min = 1.0;
      let max = -1.0;
      
      // Calculate min/max for this chunk
      for (let j = 0; j < samplesPerBar; j++) {
        const datum = data[(i * samplesPerBar) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      // Calculate bar height based on amplitude
      // Normalize slightly to make quiet parts visible
      const rawHeight = Math.max(0, max - min); 
      const barHeight = Math.max(4, rawHeight * amp * 1.5); 
      
      const x = i * (barWidth + gap);
      const y = (height - barHeight) / 2;

      // Determine Color
      let color = '#CBD5E1'; // Slate-300 (Unplayed)
      
      // Highlight played portion
      if (x < currentX) {
        color = '#6366F1'; // Indigo-500 (Played)
      }

      // Highlight hover
      if (hoverTime !== null) {
         const hoverX = (hoverTime / duration) * width;
         if (x < hoverX && x > currentX) {
             color = '#A5B4FC'; // Indigo-300 (Hover preview)
         }
      }

      ctx.fillStyle = color;
      
      // Draw rounded rect manually or just rect
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 4);
      ctx.fill();
    }
  };

  useEffect(() => {
    draw();
  }, [audioBuffer, currentTime, hoverTime]);

  // Handle Resize
  useEffect(() => {
      const handleResize = () => {
          if (containerRef.current && canvasRef.current) {
              canvasRef.current.width = containerRef.current.offsetWidth;
              canvasRef.current.height = containerRef.current.offsetHeight;
              draw();
          }
      };
      
      window.addEventListener('resize', handleResize);
      handleResize(); // Initial size
      
      return () => window.removeEventListener('resize', handleResize);
  }, [audioBuffer]);


  // Interaction Handlers
  const handleMouseEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!audioBuffer) return;
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      const time = percent * audioBuffer.duration;
      
      if (e.type === 'click') {
          onSeek(time);
      } else if (e.type === 'mousemove') {
          setHoverTime(time);
      } else if (e.type === 'mouseleave') {
          setHoverTime(null);
      }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative group cursor-pointer">
      <canvas 
        ref={canvasRef}
        className="w-full h-full block"
        onClick={handleMouseEvent}
        onMouseMove={handleMouseEvent}
        onMouseLeave={handleMouseEvent}
      />
      
      {/* Time Tooltip on Hover */}
      {hoverTime !== null && (
          <div 
            className="absolute top-0 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded -translate-y-full pointer-events-none"
            style={{ left: `${(hoverTime / (audioBuffer?.duration || 1)) * 100}%`, transform: 'translateX(-50%) translateY(-5px)' }}
          >
              {formatTime(hoverTime)}
          </div>
      )}
      
      {/* Current Time Display (Static) */}
      <div className="absolute bottom-1 right-2 text-[10px] font-mono text-slate-400 pointer-events-none select-none">
          {formatTime(currentTime)} / {formatTime(audioBuffer?.duration || 0)}
      </div>
    </div>
  );
};

// Helper for mm:ss
function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default Waveform;