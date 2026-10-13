/* NEW CODE ADDITIONS START: TOP RUNNERS LEADERBOARD COMPONENT */
import React, { useState } from 'react';
import { useGameStore, DIMENSION_TIERS, DEFAULT_TOP_RUNNERS, STORAGE_KEYS } from '../../store/useGameStore';
import { Trophy, Award, User, RefreshCw, ChevronRight } from 'lucide-react';

export const TopRunnersList: React.FC = () => {
  const { topRunners, playerCallsign, setPlayerCallsign } = useGameStore();
  const [isEditingCallsign, setIsEditingCallsign] = useState(false);
  const [customCallsign, setCustomCallsign] = useState(playerCallsign);

  const handleSaveCallsign = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCallsign.trim()) {
      setPlayerCallsign(customCallsign.trim().toUpperCase());
      setIsEditingCallsign(false);
    }
  };

  const handleResetHistory = () => {
    if (window.confirm('RESET TOP RUNNERS LEADERBOARD TO FACTORY DEFAULTS?')) {
      localStorage.setItem(STORAGE_KEYS.RUNNERS_HISTORY, JSON.stringify(DEFAULT_TOP_RUNNERS));
      window.location.reload();
    }
  };

  return (
    <div className="w-full border border-[#333] bg-black/90 p-4 text-left font-mono">
      {/* Header telemetry */}
      <div className="flex items-center justify-between border-b border-[#333] pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#FF003C]" />
          <span className="text-xs font-black tracking-widest text-white uppercase">
            TOP RUNNERS <span className="text-[#FF003C]">//</span> BEST DISTANCE
          </span>
        </div>
        <button
          onClick={handleResetHistory}
          title="Reset to Baseline"
          className="text-[9px] text-gray-500 hover:text-[#FF003C] flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-2.5 h-2.5" />
          RESET
        </button>
      </div>

      {/* Callsign configuration */}
      <div className="mb-3.5 p-2 bg-[#111] border border-[#222] flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5 text-gray-400">
          <User className="w-3 h-3 text-[#E056FD]" />
          <span>PILOT ID:</span>
          {isEditingCallsign ? (
            <form onSubmit={handleSaveCallsign} className="flex items-center gap-1">
              <input
                type="text"
                value={customCallsign}
                onChange={(e) => setCustomCallsign(e.target.value)}
                maxLength={16}
                className="bg-black border border-[#FF003C] px-1.5 py-0.5 text-white font-mono text-[10px] uppercase outline-none w-32"
                autoFocus
              />
              <button
                type="submit"
                className="bg-[#FF003C] text-black font-bold px-1.5 py-0.5 text-[9px] hover:bg-white"
              >
                SAVE
              </button>
            </form>
          ) : (
            <span className="text-white font-bold tracking-wider">{playerCallsign}</span>
          )}
        </div>
        {!isEditingCallsign && (
          <button
            onClick={() => setIsEditingCallsign(true)}
            className="text-[9px] text-[#E056FD] hover:text-white underline cursor-pointer"
          >
            EDIT
          </button>
        )}
      </div>

      {/* Top 5 Runner Records Table */}
      <div className="space-y-1.5">
        {topRunners.map((runner, index) => {
          const tierPreset =
            DIMENSION_TIERS[Math.min(DIMENSION_TIERS.length - 1, runner.tierReached || 0)];
          const isFirst = index === 0;

          return (
            <div
              key={runner.id}
              className={`p-2 border flex items-center justify-between text-xs transition-all ${
                isFirst
                  ? 'border-[#FF003C] bg-[#FF003C]/10 shadow-[0_0_12px_#FF003C33]'
                  : index === 1
                  ? 'border-[#E056FD]/60 bg-[#E056FD]/5'
                  : 'border-[#222] bg-black/60'
              }`}
            >
              {/* Rank & Callsign */}
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 font-black text-center text-[10px] ${
                    isFirst
                      ? 'text-[#FF003C]'
                      : index === 1
                      ? 'text-[#E056FD]'
                      : 'text-gray-500'
                  }`}
                >
                  #{index + 1}
                </span>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold tracking-wider text-[11px]">
                      {runner.callsign}
                    </span>
                    {isFirst && <Award className="w-3 h-3 text-[#FF003C]" />}
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-gray-400">
                    <span style={{ color: tierPreset.accentHex }}>
                      T-{runner.tierReached + 1} // {tierPreset.name.split('//')[1]?.trim() || 'VOID'}
                    </span>
                    <span>•</span>
                    <span>{runner.score.toLocaleString()} PTS</span>
                  </div>
                </div>
              </div>

              {/* Distance Readout */}
              <div className="text-right">
                <div
                  className={`font-black tracking-widest text-sm ${
                    isFirst ? 'text-[#FF003C]' : 'text-white'
                  }`}
                >
                  {runner.distance.toLocaleString()}{' '}
                  <span className="text-[9px] font-normal text-gray-400">M</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 text-center text-[8px] text-gray-500 tracking-widest uppercase">
        LOCAL SYNAPSE STORAGE // ARCHIVED IN BROWSER STATE
      </div>
    </div>
  );
};
/* NEW CODE ADDITIONS END: TOP RUNNERS LEADERBOARD COMPONENT */
