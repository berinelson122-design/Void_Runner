/* NEW CODE ADDITIONS START: DAILY MISSION HUD BUTTON COMPONENT */
import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Target } from 'lucide-react';

export const DailyMissionButton: React.FC = () => {
  const { dailyMission, toggleMissionDrawer, isMissionDrawerOpen } = useGameStore();

  const isCompleted = dailyMission.completed;

  return (
    <button
      onClick={() => toggleMissionDrawer()}
      className={`relative pointer-events-auto flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 border transition-all duration-150 cursor-pointer font-mono select-none ${
        isMissionDrawerOpen
          ? 'bg-[#FF003C] text-black border-[#FF003C] shadow-[0_0_15px_#FF003C]'
          : isCompleted
          ? 'bg-black/85 text-[#39FF14] border-[#39FF14] shadow-[0_0_10px_#39FF1444] hover:bg-[#39FF14]/10'
          : 'bg-black/85 text-[#FF003C] border-[#FF003C] shadow-[0_0_10px_#FF003C33] hover:bg-[#FF003C]/10'
      }`}
      title="Toggle Daily Mission Directive Drawer [M]"
      aria-label="Daily Mission Directive"
    >
      <Target className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${!isCompleted ? 'animate-pulse' : ''}`} />
      
      <span className="hidden md:inline text-[10px] font-bold tracking-widest uppercase">
        {isCompleted ? 'MISSION CLAIMED' : 'MISSION'}
      </span>

      {/* Pulsing Alert Pip for Active Uncompleted Mission */}
      {!isCompleted && (
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF003C] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF003C]" />
        </span>
      )}
    </button>
  );
};
/* NEW CODE ADDITIONS END: DAILY MISSION HUD BUTTON COMPONENT */
