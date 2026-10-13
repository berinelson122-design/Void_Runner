/* NEW CODE ADDITIONS START: POWER UP HUD COMPONENT */
import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Shield, Flame, Snowflake, AlertCircle } from 'lucide-react';

export const PowerUpHUD: React.FC = () => {
  const { activePowerUp, isStarted, isGameOver } = useGameStore();

  if (!isStarted || isGameOver || !activePowerUp) return null;

  const { type, duration, maxDuration } = activePowerUp;
  const progress = Math.max(0, Math.min(100, (duration / maxDuration) * 100));
  const isExpiringSoon = duration <= 1.5;

  const isShield = type === 'SHIELD';
  const isFreeze = type === 'COMBO_FREEZE';

  const borderColor = isFreeze
    ? 'border-cyan-400 shadow-[0_0_20px_#00f0ffaa]'
    : isShield
    ? 'border-[#E056FD] shadow-[0_0_20px_#E056FDaa]'
    : 'border-[#FF003C] shadow-[0_0_20px_#FF003Caa]';

  const titleColor = isFreeze
    ? 'text-cyan-300'
    : isShield
    ? 'text-[#E056FD]'
    : 'text-[#FF003C]';

  const titleText = isFreeze
    ? 'COMBO FREEZE'
    : isShield
    ? 'AEGIS SHIELD'
    : 'MATRIX OVERCLOCK';

  const subtitleText = isFreeze
    ? 'MULTIPLIER LOCKED'
    : isShield
    ? 'INVULNERABLE'
    : '2X SCORE SURGE';

  return (
    <div className="pointer-events-none select-none font-mono animate-in fade-in slide-in-from-top-2 duration-200">
      <div
        className={`flex items-center gap-2.5 px-3 py-1.5 bg-black/95 border backdrop-blur-md transition-all ${borderColor} ${
          isExpiringSoon ? 'animate-pulse' : ''
        }`}
      >
        {/* Power-up Icon */}
        <div className="flex items-center justify-center">
          {isFreeze ? (
            <Snowflake className="w-4 h-4 text-cyan-300 animate-spin" />
          ) : isShield ? (
            <Shield className="w-4 h-4 text-[#E056FD] animate-bounce" />
          ) : (
            <Flame className="w-4 h-4 text-[#FF003C] animate-pulse fill-[#FF003C]" />
          )}
        </div>

        {/* Status Text & Progress */}
        <div className="flex flex-col min-w-[130px]">
          <div className="flex items-center justify-between text-[8px] tracking-widest font-black uppercase mb-0.5">
            <span className={titleColor}>
              {titleText}
            </span>
            <span className="text-white font-bold">
              {duration.toFixed(1)}S
            </span>
          </div>

          {/* Micro Progress Bar */}
          <div className="w-full h-1.5 bg-[#1a1a1a] border border-[#333] overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                isFreeze
                  ? 'bg-gradient-to-r from-cyan-400 via-[#E056FD] to-white shadow-[0_0_8px_#00f0ff]'
                  : isShield
                  ? 'bg-gradient-to-r from-[#E056FD] to-white shadow-[0_0_8px_#E056FD]'
                  : 'bg-gradient-to-r from-[#FF003C] to-[#E056FD] shadow-[0_0_8px_#FF003C]'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Status Subtitle */}
          <div className="flex items-center justify-between mt-0.5 text-[7px] tracking-wider text-gray-400 font-bold uppercase">
            <span>{subtitleText}</span>
            {isExpiringSoon && (
              <span className="text-[#FF003C] animate-pulse font-black">
                EXPIRING
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
/* NEW CODE ADDITIONS END: POWER UP HUD COMPONENT */
