/* NEW CODE ADDITIONS START: DEVICE CONTROLS */
import React from 'react';
import { useInputStore } from '../../store/useInputStore';
import { Monitor, Smartphone, Gamepad2 } from 'lucide-react';

export const ControlSettings: React.FC = () => {
  const { deviceType, commands } = useInputStore();

  return (
    <div className="p-4 bg-black border-2 border-[#E056FD] font-mono text-[10px] w-64 shadow-[0_0_20px_#E056FD55]">
      <div className="flex items-center gap-2 text-[#E056FD] mb-3 border-b border-[#E056FD]33 pb-2">
        {deviceType === 'MOBILE' && <Smartphone size={14} />}
        {deviceType === 'PC' && <Monitor size={14} />}
        {deviceType === 'CONSOLE' && <Gamepad2 size={14} />}
        <span className="font-bold tracking-widest uppercase">
          HARDWARE // CALIBRATION
        </span>
      </div>

      <div className="space-y-1.5">
        {Object.entries(commands).map(([key, active]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-gray-500 uppercase">{key}</span>
            <div
              className={`h-2 w-10 border ${active
                ? 'bg-[#FF003C] border-[#FF003C] shadow-[0_0_8px_#FF003C]'
                : 'border-gray-800'
                }`}
            />
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-[#333] text-[8px] text-gray-500 flex justify-between">
        <span>MODE: {deviceType}</span>
        <span>LATENCY: 0.2MS</span>
      </div>
    </div>
  );
};
/* NEW CODE ADDITIONS END: DEVICE CONTROLS */