import { useEffect, useRef } from 'react';

export const useGameLoop = (callback: (delta: number) => void, isRunning: boolean = true) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!isRunning) return;

    let lastTime = performance.now();
    let frameId: number;

    const loop = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap max delta to prevent large jumps
      lastTime = currentTime;

      callbackRef.current(delta);
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isRunning]);
};
