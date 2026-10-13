/* NEW CODE ADDITIONS START: DEVICE CONTROLS */
import React from 'react';
import { useGameStore, MAX_BOOST } from '../../store/useGameStore';
import { useInputStore } from '../../store/useInputStore';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';

export const VirtualJoystick: React.FC = () => {
  const {
    moveLane,
    setJumping,
    setSliding,
    isJumping,
    isSliding,
    dimensionBoost,
    isDimensionShiftActive,
    triggerDimensionShift,
  } = useGameStore();
  const { triggerCommand } = useInputStore();

  const isShiftReady = dimensionBoost >= MAX_BOOST && !isDimensionShiftActive;

  const handleAction = (type: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | 'SHIFT') => {
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
    /* NEW CODE ADDITIONS START: MOBILE SHIFT TRIGGER */
    if (type === 'SHIFT') {
      triggerCommand('SHIFT');
      triggerDimensionShift();
    }
    /* NEW CODE ADDITIONS END: MOBILE SHIFT TRIGGER */
  };

  return (
    <>
      {/* Mobile D-Pad Left */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 pointer-events-auto md:hidden font-mono select-none">
        <div className="flex justify-center">
          <button
            onTouchStart={(e) => { e.preventDefault(); handleAction('UP'); }}
            onClick={() => handleAction('UP')}
            className="w-14 h-14 bg-black/80 border-2 border-[#E056FD] text-[#E056FD] active:bg-[#E056FD] active:text-black flex items-center justify-center rounded-full shadow-[0_0_12px_#E056FD44]"
          >
            <ArrowUp size={22} />
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onTouchStart={(e) => { e.preventDefault(); handleAction('LEFT'); }}
            onClick={() => handleAction('LEFT')}
            className="w-14 h-14 bg-black/80 border-2 border-[#E056FD] text-[#E056FD] active:bg-[#E056FD] active:text-black flex items-center justify-center rounded-full shadow-[0_0_12px_#E056FD44]"
          >
            <ArrowLeft size={22} />
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); handleAction('DOWN'); }}
            onClick={() => handleAction('DOWN')}
            className="w-14 h-14 bg-black/80 border-2 border-[#E056FD] text-[#E056FD] active:bg-[#E056FD] active:text-black flex items-center justify-center rounded-full shadow-[0_0_12px_#E056FD44]"
          >
            <ArrowDown size={22} />
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); handleAction('RIGHT'); }}
            onClick={() => handleAction('RIGHT')}
            className="w-14 h-14 bg-black/80 border-2 border-[#E056FD] text-[#E056FD] active:bg-[#E056FD] active:text-black flex items-center justify-center rounded-full shadow-[0_0_12px_#E056FD44]"
          >
            <ArrowRight size={22} />
          </button>
        </div>
      </div>

      {/* NEW CODE ADDITIONS START: DEDICATED BOTTOM-RIGHT MOBILE DASH BUTTON */}
      {/* Mobile Dedicated DASH / SHIFT Action Button Right */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-auto md:hidden font-mono select-none">
        <button
          onTouchStart={(e) => { e.preventDefault(); handleAction('SHIFT'); }}
          onClick={() => handleAction('SHIFT')}
          disabled={!isShiftReady && !isDimensionShiftActive}
          className={`w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center transition-all ${
            isDimensionShiftActive
              ? 'bg-[#FF003C] border-white text-black shadow-[0_0_25px_#FF003C] animate-pulse'
              : isShiftReady
              ? 'bg-[#FF003C] border-[#FF003C] text-black shadow-[0_0_25px_#FF003C] animate-bounce cursor-pointer'
              : 'bg-black/90 border-[#333] text-gray-500 opacity-60 cursor-not-allowed'
          }`}
        >
          <Sparkles size={20} className={isShiftReady ? 'fill-black animate-spin' : ''} />
          <span className="text-[11px] font-black tracking-tighter mt-0.5">
            {isDimensionShiftActive ? 'PHASE' : 'DASH'}
          </span>
          <span className="text-[8px] font-bold">
            {isDimensionShiftActive ? 'ACTIVE' : isShiftReady ? 'READY' : `${Math.round(dimensionBoost)}%`}
          </span>
        </button>
      </div>
      {/* NEW CODE ADDITIONS END: DEDICATED BOTTOM-RIGHT MOBILE DASH BUTTON */}
    </>
  );
};
/* NEW CODE ADDITIONS END: DEVICE CONTROLS */