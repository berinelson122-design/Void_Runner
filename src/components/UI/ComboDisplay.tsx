/* NEW CODE ADDITIONS START: COMBO MULTIPLIER DISPLAY COMPONENT */
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Flame, Zap, AlertTriangle, Disc3, Snowflake } from 'lucide-react';

export const ComboDisplay: React.FC = () => {
  const {
    combo,
    comboMultiplier,
    comboRank,
    comboLostAlert,
    isDimensionShiftActive,
    activePowerUp,
    isStarted,
    isGameOver,
  } = useGameStore();

  const isComboFrozen = activePowerUp?.type === 'COMBO_FREEZE';
  const [popScale, setPopScale] = useState(false);

  // Trigger brief scale pop when combo increases
  useEffect(() => {
    if (combo > 0) {
      setPopScale(true);
      const t = setTimeout(() => setPopScale(false), 180);
      return () => clearTimeout(t);
    }
  }, [combo]);

  if (!isStarted || isGameOver) return null;

  // Next tier threshold calculation
  const getNextTierThreshold = (current: number) => {
    if (current < 3) return { target: 3, prev: 0 };
    if (current < 6) return { target: 6, prev: 3 };
    if (current < 10) return { target: 10, prev: 6 };
    if (current < 15) return { target: 15, prev: 10 };
    if (current < 21) return { target: 21, prev: 15 };
    if (current < 30) return { target: 30, prev: 21 };
    return { target: 30, prev: 30 };
  };

  const { target, prev } = getNextTierThreshold(combo);
  const tierProgress = target === prev ? 100 : Math.min(100, Math.max(0, ((combo - prev) / (target - prev)) * 100));

  const isHighTier = comboMultiplier >= 4;
  const isSingularity = comboMultiplier >= 8;

  return (
    <div className="pointer-events-none select-none font-mono flex flex-col items-center">
      {/* Active Combo HUD Container */}
      <div
        className={`transition-all duration-150 flex items-center gap-2 px-3 py-1.5 bg-black/90 border ${
          isComboFrozen
            ? 'border-cyan-400 shadow-[0_0_20px_#00f0ffaa]'
            : comboLostAlert
            ? 'border-[#FF003C] shadow-[0_0_20px_#FF003C]'
            : isSingularity
            ? 'border-[#FF003C] shadow-[0_0_25px_#FF003C] animate-pulse'
            : isHighTier
            ? 'border-[#E056FD] shadow-[0_0_18px_#E056FD88]'
            : comboMultiplier > 1
            ? 'border-[#E056FD]/60 shadow-[0_0_10px_#E056FD44]'
            : 'border-[#333] shadow-none opacity-80'
        } ${popScale ? 'scale-110' : 'scale-100'}`}
      >
        {/* Left Multiplier Badge */}
        <div className="flex items-center gap-1">
          {comboMultiplier > 1 ? (
            <Flame
              className={`w-4 h-4 ${
                isSingularity
                  ? 'text-[#FF003C] animate-bounce fill-[#FF003C]'
                  : isHighTier
                  ? 'text-[#FF003C] fill-[#FF003C]'
                  : 'text-[#E056FD]'
              }`}
            />
          ) : (
            <Disc3 className="w-3.5 h-3.5 text-gray-500" />
          )}

          <div className="flex flex-col">
            <span
              className={`text-base sm:text-lg font-black tracking-tighter leading-none ${
                isSingularity
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#FF003C] via-white to-[#E056FD]'
                  : isHighTier
                  ? 'text-[#FF003C]'
                  : comboMultiplier > 1
                  ? 'text-[#E056FD]'
                  : 'text-gray-300'
              }`}
            >
              x{comboMultiplier}
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-white/20" />

        {/* Center Streak & Rank */}
        <div className="flex flex-col items-start min-w-[90px]">
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
              {combo > 0 ? `${combo} ORB STREAK` : 'NO STREAK'}
            </span>
            {isComboFrozen && (
              <span className="text-[7px] bg-cyan-400 text-black px-1 font-black flex items-center gap-0.5 animate-pulse">
                <Snowflake className="w-2.5 h-2.5" />
                FROZEN
              </span>
            )}
            {isDimensionShiftActive && (
              <span className="text-[7px] bg-[#FF003C] text-black px-1 font-black">
                OVERCLOCK
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 w-full">
            <span
              className={`text-[10px] font-black tracking-widest uppercase ${
                isSingularity
                  ? 'text-[#FF003C] animate-pulse'
                  : isHighTier
                  ? 'text-[#E056FD]'
                  : comboMultiplier > 1
                  ? 'text-[#E056FD]/80'
                  : 'text-gray-500'
              }`}
            >
              [{comboRank}]
            </span>

            {/* Micro Tier Progress Line */}
            {comboMultiplier < 8 && combo > 0 && (
              <div className="flex-1 h-1 bg-[#222] overflow-hidden border border-[#444]/60">
                <div
                  className="h-full bg-gradient-to-r from-[#E056FD] to-[#FF003C] transition-all duration-150"
                  style={{ width: `${tierProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Combo Loss Notification Glitch Alert */}
      {comboLostAlert && (
        <div className="mt-1 flex items-center gap-1 px-2 py-0.5 bg-[#FF003C]/20 border border-[#FF003C] text-[8px] text-[#FF003C] font-black tracking-widest uppercase animate-bounce">
          <AlertTriangle className="w-2.5 h-2.5" />
          <span>COMBO INTERRUPTED // ORB MISSED</span>
        </div>
      )}
    </div>
  );
};
/* NEW CODE ADDITIONS END: COMBO MULTIPLIER DISPLAY COMPONENT */
