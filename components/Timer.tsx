import React, { useEffect, useState, useRef } from 'react';

interface TimerProps {
  startTime: number;
  penaltyMs: number;
  isRunning: boolean;
  onTick?: (time: number) => void;
}

const Timer: React.FC<TimerProps> = ({ startTime, penaltyMs, isRunning }) => {
  const [displayTime, setDisplayTime] = useState(0);
  const requestRef = useRef<number>(0);

  const updateTimer = () => {
    if (!isRunning) return;
    
    const now = Date.now();
    const elapsed = now - startTime + penaltyMs;
    setDisplayTime(elapsed);
    
    requestRef.current = requestAnimationFrame(updateTimer);
  };

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(updateTimer);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, startTime, penaltyMs]);

  // If paused/stopped, still update display to show current total
  useEffect(() => {
    if (!isRunning && startTime > 0) {
        // Just show the static time if stopped
         setDisplayTime(Date.now() - startTime + penaltyMs);
    } else if (!isRunning && startTime === 0) {
        setDisplayTime(0);
    }
  }, [penaltyMs, startTime, isRunning]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    return `${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
  };

  return (
    <div className="bg-white border-4 border-black rounded-xl px-4 py-2 cartoon-shadow flex items-center gap-2">
      <span className="text-3xl">⏱️</span>
      <span className="text-2xl font-black font-mono tracking-widest text-gray-800">
        {formatTime(displayTime)}
      </span>
    </div>
  );
};

export default Timer;