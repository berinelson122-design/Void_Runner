/* NEW CODE ADDITIONS START: DIMENSION BOOST GAUGE COMPONENT */
import React from 'react';
import { useGameStore, MAX_BOOST, SHIFT_DURATION_SECONDS } from '../../store/useGameStore';
import { useInputStore } from '../../store/useInputStore';
import { Zap, Sparkles, FastForward, ShieldAlert } from 'lucide-react';

export const DimensionBoostGauge: React.FC = () => {
  const {
    dimensionBoost,
    isDimensionShiftActive,
    dimensionShiftTimer,
    triggerDimensionShift,
    isStarted,
    isGameOver,
  } = useGameStore();

  const { triggerCommand } = useInputStore();

  if (!isStarted || isGameOver) return null;

  const isFull = dimensionBoost >= MAX_BOOST && !isDimensionShiftActive;
  const segments = 5;
  const currentSegmentFill = (dimensionBoost / MAX_BOOST) * segments;

  const handleShiftClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (isFull) {
      triggerCommand('SHIFT');
      triggerDimensionShift();
    }
  };

  return (
    <div className="pointer-events-auto flex flex-col items-center gap-1.5 font-mono select-none">
      {/* HUD Header Label */}
      <div className="flex items-center justify-between w-full px-1 text-[9px] tracking-widest uppercase">
        <span className="flex items-center gap-1 font-bold text-[#E056FD]">
          {isDimensionShiftActive ? (
            <FastForward className="w-3 h-3 text-[#FF003C] animate-pulse" />
          ) : (
            <Zap className={`w-3 h-3 ${isFull ? 'text-[#FF003C] animate-bounce' : 'text-[#E056FD]'}`} />
          )}
          DIMENSION BOOST
        </span>

        <span
          className={`font-black ${
            isDimensionShiftActive
              ? 'text-[#FF003C] animate-pulse'
              : isFull
              ? 'text-[#FF003C]'
              : 'text-white/80'
          }`}
        >
          {isDimensionShiftActive
            ? `${dimensionShiftTimer.toFixed(1)}S [INTANGIBLE]`
            : isFull
            ? '100% READY'
            : `${Math.round(dimensionBoost)}%`}
        </span>
      </div>

      {/* Main Segmented Gauge Bar */}
      <div
        className={`relative w-48 sm:w-60 h-4 bg-black border p-0.5 flex gap-1 transition-all duration-200 ${
          isDimensionShiftActive
            ? 'border-[#FF003C] shadow-[0_0_20px_#FF003C99]'
            : isFull
            ? 'border-[#FF003C] shadow-[0_0_18px_#FF003Caa] animate-pulse'
            : 'border-[#333] shadow-[0_0_10px_#E056FD22]'
        }`}
      >
        {Array.from({ length: segments }).map((_, idx) => {
          const isFilled = currentSegmentFill >= idx + 1;
          const isPartial = currentSegmentFill > idx && currentSegmentFill < idx + 1;
          const partialWidth = isPartial ? (currentSegmentFill - idx) * 100 : 0;

          return (
            <div
              key={idx}
              className="relative flex-1 h-full bg-[#111] overflow-hidden border-r border-[#222] last:border-r-0"
            >
              {isFilled && (
                <div
                  className={`w-full h-full transition-all duration-150 ${
                    isDimensionShiftActive
                      ? 'bg-gradient-to-r from-[#FF003C] to-[#E056FD] shadow-[0_0_10px_#FF003C]'
                      : isFull
                      ? 'bg-[#FF003C] shadow-[0_0_8px_#FF003C]'
                      : 'bg-[#E056FD]'
                  }`}
                />
              )}
              {isPartial && (
                <div
                  className="h-full bg-[#E056FD] transition-all duration-100"
                  style={{ width: `${partialWidth}%` }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* NEW CODE ADDITIONS START: REMOVE TOP DASH PROMPT ON MOBILE */}
      {/* Interactive Shift Button When Ready or Active Status - Hidden on mobile, retained on PC */}
      <div className="w-full flex justify-center">
        {isFull ? (
          <button
            onClick={handleShiftClick}
            className="hidden sm:flex w-full py-1.5 px-3 bg-[#FF003C] hover:bg-white hover:text-black text-black text-xs font-black tracking-widest uppercase border border-[#FF003C] transition-all cursor-pointer shadow-[0_0_25px_#FF003C] items-center justify-center gap-2 active:scale-95 animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>TRIGGER SHIFT [PRESS SHIFT / SPACE]</span>
          </button>
        ) : isDimensionShiftActive ? (
          <div className="w-full py-0.5 sm:py-1 px-2 bg-[#FF003C]/20 border border-[#FF003C] text-[#FF003C] text-[9px] sm:text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-1.5 shadow-[0_0_15px_#FF003C66]">
            <ShieldAlert className="w-3 h-3 text-[#FF003C] animate-spin" />
            <span>WARP SPEED // INTANGIBLE PHASE ACTIVE</span>
          </div>
        ) : (
          <div className="hidden sm:block text-[8px] text-gray-500 tracking-wider">
            COLLECT ORBS TO CHARGE DIMENSION SHIFT
          </div>
        )}
      </div>
      {/* NEW CODE ADDITIONS END: REMOVE TOP DASH PROMPT ON MOBILE */}
    </div>
  );
};
/* NEW CODE ADDITIONS END: DIMENSION BOOST GAUGE COMPONENT */
