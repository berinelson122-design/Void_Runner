/* NEW CODE ADDITIONS START: DIMENSION TIER BADGE & ESCALATION HUD COMPONENT */
import React, { useEffect } from 'react';
import { useGameStore, DIMENSION_TIERS, TIER_INTERVAL_METERS } from '../../store/useGameStore';
import { Globe, Layers, AlertTriangle } from 'lucide-react';

export const DimensionTierBadge: React.FC = () => {
  const { distance, currentTier, isStarted, isGameOver, tierShiftAlert, dismissTierShiftAlert } =
    useGameStore();

  const preset = DIMENSION_TIERS[Math.min(DIMENSION_TIERS.length - 1, currentTier)];

  // Progress to next tier (0 to 100%)
  const tierProgressMeters = distance % TIER_INTERVAL_METERS;
  const progressPercent = Math.min(100, (tierProgressMeters / TIER_INTERVAL_METERS) * 100);

  // Auto-dismiss alert after 4 seconds
  useEffect(() => {
    if (tierShiftAlert?.active) {
      const timer = setTimeout(() => {
        dismissTierShiftAlert();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [tierShiftAlert, dismissTierShiftAlert]);

  if (!isStarted || isGameOver) return null;

  return (
    <>
      {/* Tier HUD telemetry indicator */}
      <div className="flex items-center gap-2 border border-[#333] bg-black/80 px-2.5 py-1 text-xs backdrop-blur-sm shadow-[0_0_10px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#E056FD] animate-pulse" />
          <div className="flex flex-col text-left leading-none">
            <span className="text-[8px] text-gray-400 tracking-widest uppercase">DIMENSION</span>
            <span
              className="text-[11px] font-black tracking-tight uppercase"
              style={{ color: preset.accentHex }}
            >
              T-{currentTier + 1}
            </span>
          </div>
        </div>

        {/* Micro progression bar to next tier */}
        <div className="hidden sm:flex flex-col gap-0.5 w-16">
          <div className="flex justify-between text-[7px] text-gray-400 font-mono leading-none">
            <span>NEXT TIER</span>
            <span>{Math.floor(progressPercent)}%</span>
          </div>
          <div className="h-1 bg-gray-900 border border-gray-700 overflow-hidden">
            <div
              className="h-full transition-all duration-200"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: preset.accentHex,
              }}
            />
          </div>
        </div>
      </div>

      {/* Full-screen Cyber Escalation Alert Banner upon crossing tier boundary */}
      {tierShiftAlert?.active && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-300">
          <div
            className="border-2 px-6 py-3 bg-black/95 shadow-2xl flex flex-col items-center gap-1 min-w-[280px]"
            style={{
              borderColor: preset.accentHex,
              boxShadow: `0 0 30px ${preset.accentHex}88`,
            }}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 animate-spin text-[#E056FD]" />
              <span className="text-[10px] tracking-[0.3em] font-black text-white uppercase">
                DIMENSION PHASE SHIFT
              </span>
              <AlertTriangle
                className="w-4 h-4 animate-bounce"
                style={{ color: preset.accentHex }}
              />
            </div>
            <div
              className="text-lg font-black tracking-widest uppercase italic"
              style={{ color: preset.accentHex }}
            >
              {preset.name}
            </div>
            <div className="text-[9px] text-[#E056FD] tracking-widest font-mono uppercase">
              {preset.subName} // VELOCITY INCREASED
            </div>
          </div>
        </div>
      )}
    </>
  );
};
/* NEW CODE ADDITIONS END: DIMENSION TIER BADGE & ESCALATION HUD COMPONENT */
