/* NEW CODE ADDITIONS START: DEVICE CONTROLS */
import React from 'react';
import { useInputStore } from '../../store/useInputStore';
import { Monitor, Smartphone, Gamepad2 } from 'lucide-react';

export const ControlSettings: React.FC = () => {
  const { deviceType, commands, bindings } = useInputStore();

  const getBindingText = (key: string) => {
    const binding = bindings[key as keyof typeof bindings];
    if (!binding) return '';
    if (deviceType === 'MOBILE') return binding.mobile;
    if (deviceType === 'CONSOLE') return binding.console;
    return binding.pc;
  };

  return (
    <div className="p-4 bg-black border-2 border-[#E056FD] font-mono text-[10px] w-72 shadow-[0_0_20px_#E056FD55] select-none">
      <div className="flex items-center justify-between text-[#E056FD] mb-3 border-b border-[#E056FD]33 pb-2">
        <div className="flex items-center gap-2">
          {deviceType === 'MOBILE' && <Smartphone size={14} />}
          {deviceType === 'PC' && <Monitor size={14} />}
          {deviceType === 'CONSOLE' && <Gamepad2 size={14} />}
          <span className="font-bold tracking-widest uppercase">
            HARDWARE // CALIBRATION
          </span>
        </div>
        <span className="text-[9px] text-gray-400 font-bold">{deviceType}</span>
      </div>

      <div className="space-y-1.5">
        {Object.entries(commands).map(([key, active]) => (
          <div key={key} className="flex justify-between items-center py-0.5 border-b border-white/5 last:border-0">
            <div className="flex flex-col">
              <span className={`uppercase font-bold ${active ? 'text-[#FF003C]' : 'text-gray-400'}`}>
                {key}
              </span>
              <span className="text-[8px] text-gray-500 truncate max-w-[150px]">
                {getBindingText(key)}
              </span>
            </div>
            <div
              className={`h-2.5 w-10 border transition-all ${
                active
                  ? 'bg-[#FF003C] border-[#FF003C] shadow-[0_0_10px_#FF003C]'
                  : 'bg-black border-gray-800'
              }`}
            />
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-[#333] text-[8px] text-gray-500 flex justify-between">
        <span>DIMENSION SYNC: 100%</span>
        <span>LATENCY: 0.2MS</span>
      </div>
    </div>
  );
};
/* NEW CODE ADDITIONS END: DEVICE CONTROLS */