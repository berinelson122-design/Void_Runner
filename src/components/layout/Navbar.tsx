import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Zap, Activity, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { score, distance, speed, health, orbs } = useGameStore();

  return (
    <div className="fixed top-0 left-0 right-0 p-4 z-50 flex justify-between items-center pointer-events-none font-mono">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border border-[#FF003C] bg-black/80 px-3 py-1.5 shadow-[0_0_15px_#FF003C66]">
          <Shield className="w-4 h-4 text-[#FF003C]" />
          <div className="w-24 bg-[#222] h-2.5 relative border border-[#444]">
            <div
              className="bg-[#FF003C] h-full transition-all duration-200"
              style={{ width: `${health}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 border border-[#E056FD] bg-black/80 px-3 py-1.5">
          <Activity className="w-4 h-4 text-[#E056FD]" />
          <span className="text-xs text-white tracking-widest">
            {speed.toFixed(0)}m/s
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 border border-[#E056FD] bg-black/80 px-3 py-1.5">
          <Zap className="w-4 h-4 text-[#E056FD]" />
          <span className="text-xs text-white tracking-widest">{orbs}</span>
        </div>

        <div className="flex flex-col items-end border border-[#FF003C] bg-black/80 px-4 py-1 shadow-[0_0_15px_#FF003C66]">
          <span className="text-[9px] text-[#FF003C] tracking-widest uppercase">
            SCORE
          </span>
          <span className="text-lg font-bold text-white tracking-tighter">
            {score.toString().padStart(6, '0')}
          </span>
        </div>
      </div>
    </div>
  );
};