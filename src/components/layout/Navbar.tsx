import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Zap, Activity, Shield } from 'lucide-react';
/* NEW CODE ADDITIONS START: DIMENSION BOOST, COMBO, POWER UP, TIER & DAILY MISSION DISPLAY IMPORTS */
import { DimensionBoostGauge } from '../UI/DimensionBoostGauge';
import { ComboDisplay } from '../UI/ComboDisplay';
import { PowerUpHUD } from '../UI/PowerUpHUD';
import { DimensionTierBadge } from '../UI/DimensionTierBadge';
import { DailyMissionButton } from '../UI/DailyMissionButton';
/* NEW CODE ADDITIONS END: DIMENSION BOOST, COMBO, POWER UP, TIER & DAILY MISSION DISPLAY IMPORTS */

export const Navbar: React.FC = () => {
  const { score, distance, speed, health, orbs } = useGameStore();

  return (
    <div className="fixed top-0 left-0 right-0 p-3 sm:p-4 z-50 flex flex-wrap justify-between items-center pointer-events-none font-mono gap-2">
      {/* Left Telemetry (Shield, Speed & Dimension Tier) */}
      <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto flex-wrap">
        <div className="flex items-center gap-2 border border-[#FF003C] bg-black/80 px-2.5 sm:px-3 py-1.5 shadow-[0_0_15px_#FF003C66]">
          <Shield className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#FF003C]" />
          <div className="w-16 sm:w-20 bg-[#222] h-2.5 relative border border-[#444]">
            <div
              className="bg-[#FF003C] h-full transition-all duration-200"
              style={{ width: `${health}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 border border-[#E056FD] bg-black/80 px-2.5 sm:px-3 py-1.5 shadow-[0_0_10px_#E056FD33]">
          <Activity className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#E056FD]" />
          <span className="text-[11px] sm:text-xs text-white tracking-widest font-bold">
            {speed.toFixed(0)}m/s
          </span>
        </div>

        {/* NEW CODE ADDITIONS START: DIMENSION TIER HUD BADGE */}
        <DimensionTierBadge />
        {/* NEW CODE ADDITIONS END: DIMENSION TIER HUD BADGE */}
      </div>

      {/* NEW CODE ADDITIONS START: CENTER DIMENSION BOOST GAUGE */}
      <div className="order-last sm:order-none w-full sm:w-auto flex justify-center mt-1 sm:mt-0">
        <DimensionBoostGauge />
      </div>
      {/* NEW CODE ADDITIONS END: CENTER DIMENSION BOOST GAUGE */}

      {/* Right Telemetry (Daily Mission Button, Combo, Orbs & Score) */}
      <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
        {/* NEW CODE ADDITIONS START: DAILY MISSION HUD BUTTON */}
        <DailyMissionButton />
        {/* NEW CODE ADDITIONS END: DAILY MISSION HUD BUTTON */}

        {/* NEW CODE ADDITIONS START: COMBO MULTIPLIER HUD EMBED */}
        <ComboDisplay />
        {/* NEW CODE ADDITIONS END: COMBO MULTIPLIER HUD EMBED */}

        <div className="flex items-center gap-1.5 sm:gap-2 border border-[#E056FD] bg-black/80 px-2.5 sm:px-3 py-1.5 shadow-[0_0_10px_#E056FD33]">
          <Zap className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#E056FD]" />
          <span className="text-[11px] sm:text-xs text-white tracking-widest font-bold">{orbs}</span>
        </div>

        <div className="flex flex-col items-end border border-[#FF003C] bg-black/80 px-3 sm:px-4 py-1 shadow-[0_0_15px_#FF003C66]">
          <span className="text-[8px] sm:text-[9px] text-[#FF003C] tracking-widest uppercase font-bold">
            SCORE
          </span>
          <span className="text-base sm:text-lg font-black text-white tracking-tighter">
            {score.toString().padStart(6, '0')}
          </span>
        </div>
      </div>

      {/* NEW CODE ADDITIONS START: ACTIVE POWER UP HUD ROW */}
      <div className="w-full flex justify-center pointer-events-none mt-1">
        <PowerUpHUD />
      </div>
      {/* NEW CODE ADDITIONS END: ACTIVE POWER UP HUD ROW */}
    </div>
  );
};