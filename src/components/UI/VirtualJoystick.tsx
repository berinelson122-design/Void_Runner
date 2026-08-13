/* NEW CODE ADDITIONS START: DEVICE CONTROLS */
import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useInputStore } from '../../store/useInputStore';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

export const VirtualJoystick: React.FC = () => {
  const { moveLane, setJumping, setSliding, isJumping, isSliding } = useGameStore();
  const { triggerCommand } = useInputStore();

  const handleAction = (type: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN') => {
    if (type === 'LEFT') {
      moveLane('LEFT');
      triggerCommand('LEFT');
    }
    if (type === 'RIGHT') {
      moveLane('RIGHT');
      triggerCommand('RIGHT');
    }
    if (type === 'UP' && !isJumping) {
      setJumping(true);
      triggerCommand('UP');
    }
    if (type === 'DOWN' && !isSliding) {
      setSliding(true);
      triggerCommand('DOWN');
    }
  };

  return (
    <div className="fixed bottom-8 left-8 z-50 flex flex-col gap-2 pointer-events-auto md:hidden font-mono">
      <div className="flex justify-center">
        <button
          onTouchStart={() => handleAction('UP')}
          onClick={() => handleAction('UP')}
          className="w-14 h-14 bg-black/80 border-2 border-[#E056FD] text-[#E056FD] active:bg-[#E056FD] active:text-black flex items-center justify-center rounded-full"
        >
          <ArrowUp size={20} />
        </button>
      </div>

      <div className="flex gap-4">
        <button
          onTouchStart={() => handleAction('LEFT')}
          onClick={() => handleAction('LEFT')}
          className="w-14 h-14 bg-black/80 border-2 border-[#E056FD] text-[#E056FD] active:bg-[#E056FD] active:text-black flex items-center justify-center rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onTouchStart={() => handleAction('DOWN')}
          onClick={() => handleAction('DOWN')}
          className="w-14 h-14 bg-black/80 border-2 border-[#E056FD] text-[#E056FD] active:bg-[#E056FD] active:text-black flex items-center justify-center rounded-full"
        >
          <ArrowDown size={20} />
        </button>
        <button
          onTouchStart={() => handleAction('RIGHT')}
          onClick={() => handleAction('RIGHT')}
          className="w-14 h-14 bg-black/80 border-2 border-[#E056FD] text-[#E056FD] active:bg-[#E056FD] active:text-black flex items-center justify-center rounded-full"
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
/* NEW CODE ADDITIONS END: DEVICE CONTROLS */