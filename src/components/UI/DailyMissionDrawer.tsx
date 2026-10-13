/* NEW CODE ADDITIONS START: DAILY MISSION SLIDE-OUT DRAWER COMPONENT */
import React, { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Target, X, CheckCircle2, Award, Sparkles, Clock, AlertCircle } from 'lucide-react';

export const DailyMissionDrawer: React.FC = () => {
  const {
    dailyMission,
    isMissionDrawerOpen,
    toggleMissionDrawer,
  } = useGameStore();

  // Keyboard shortcut: close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMissionDrawerOpen) {
        toggleMissionDrawer(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMissionDrawerOpen, toggleMissionDrawer]);

  if (!isMissionDrawerOpen) return null;

  const progressPercent = Math.min(
    100,
    Math.round((dailyMission.currentProgress / dailyMission.targetValue) * 100)
  );

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-mono select-none">
      {/* Backdrop */}
      <div
        onClick={() => toggleMissionDrawer(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in cursor-pointer"
      />

      {/* Slide-out Panel */}
      <div
        className="relative w-full max-w-md sm:max-w-lg h-full bg-black/95 border-l-2 border-[#FF003C] shadow-[-15px_0_40px_#FF003C55] flex flex-col p-5 sm:p-6 overflow-y-auto animate-in slide-in-from-right duration-200 z-10"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#FF003C]/40 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#FF003C]/20 border border-[#FF003C] text-[#FF003C]">
              <Target className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                DAILY DIRECTIVE
                <span className="text-[9px] px-1.5 py-0.5 bg-[#E056FD]/20 border border-[#E056FD] text-[#E056FD]">
                  LIVE
                </span>
              </h2>
              <div className="flex items-center gap-1.5 text-[9px] text-gray-400">
                <Clock className="w-3 h-3 text-[#E056FD]" />
                <span>CYCLE: {dailyMission.dateKey}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => toggleMissionDrawer(false)}
            className="p-1.5 border border-[#333] hover:border-[#FF003C] hover:text-[#FF003C] text-gray-400 transition-colors cursor-pointer"
            title="Close Drawer [ESC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          {dailyMission.completed ? (
            <div className="p-2.5 bg-[#39FF14]/15 border border-[#39FF14] text-[#39FF14] flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                OBJECTIVE ACCOMPLISHED // REWARD CLAIMED
              </span>
              <span className="text-[10px] tracking-widest uppercase bg-[#39FF14] text-black px-1.5 py-0.5">
                COMPLETED
              </span>
            </div>
          ) : (
            <div className="p-2.5 bg-[#FF003C]/10 border border-[#FF003C] text-[#FF003C] flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF003C] animate-ping" />
                ACTIVE IN-RUN DIRECTIVE
              </span>
              <span className="text-[10px] tracking-widest uppercase bg-[#FF003C] text-black px-1.5 py-0.5">
                IN PROGRESS
              </span>
            </div>
          )}
        </div>

        {/* Objective Card */}
        <div className="p-4 bg-[#0a0a0a] border border-[#222] mb-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[9px] text-[#E056FD] tracking-widest uppercase font-bold mb-1">
                TARGET SPECIFICATION
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                {dailyMission.title}
              </h3>
            </div>
            <Award className="w-6 h-6 text-[#E056FD] shrink-0" />
          </div>

          <p className="text-xs text-gray-300 leading-relaxed font-mono">
            {dailyMission.description}
          </p>

          {/* Progress Bar */}
          <div className="pt-2">
            <div className="flex justify-between items-center text-[10px] mb-1.5">
              <span className="text-gray-400 tracking-wider">PROGRESS METRIC</span>
              <span className={`font-black tracking-widest ${dailyMission.completed ? 'text-[#39FF14]' : 'text-white'}`}>
                {dailyMission.currentProgress.toLocaleString()} / {dailyMission.targetValue.toLocaleString()} ({progressPercent}%)
              </span>
            </div>

            <div className="w-full h-3 bg-black border border-[#333] p-0.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  dailyMission.completed
                    ? 'bg-[#39FF14] shadow-[0_0_10px_#39FF14]'
                    : 'bg-gradient-to-r from-[#FF003C] to-[#E056FD] shadow-[0_0_8px_#FF003C]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Reward Card */}
        <div className="p-4 bg-gradient-to-br from-[#120008] to-black border border-[#FF003C]/60 mb-5 shadow-[0_0_20px_#FF003C22]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF003C]" />
              <span className="text-[10px] text-[#FF003C] tracking-widest uppercase font-black">
                COMPLETION BOUNTY
              </span>
            </div>
            <span className="text-xs px-2 py-0.5 bg-[#FF003C]/20 border border-[#FF003C] text-white font-bold">
              +{dailyMission.rewardPoints.toLocaleString()} PTS
            </span>
          </div>

          <div className="mt-2 text-xs text-gray-400 font-mono">
            Directly credited into your current run score upon hitting 100% target progress.
          </div>
        </div>

        {/* Operational Protocol Notes */}
        <div className="border border-[#222] bg-[#050505] p-3 text-[10px] text-gray-400 space-y-1.5 font-mono mb-6">
          <div className="flex items-center gap-1.5 text-gray-300 font-bold">
            <AlertCircle className="w-3.5 h-3.5 text-[#E056FD]" />
            <span>DIRECTIVE PROTOCOL RULES</span>
          </div>
          <p>• Resets once every calendar day at midnight local time.</p>
          <p>• Completion rewards are permanently saved to your runner profile.</p>
          <p>• Objectives measure high performance within an unbroken single run.</p>
        </div>

        {/* Bottom Action Button */}
        <div className="mt-auto">
          <button
            onClick={() => toggleMissionDrawer(false)}
            className="w-full py-3 bg-[#FF003C] hover:bg-white hover:text-black text-black font-black text-xs tracking-widest uppercase border border-[#FF003C] transition-all cursor-pointer shadow-[0_0_15px_#FF003C66] active:scale-98"
          >
            RETURN TO RUNNER VIEW
          </button>
        </div>
      </div>
    </div>
  );
};
/* NEW CODE ADDITIONS END: DAILY MISSION SLIDE-OUT DRAWER COMPONENT */
