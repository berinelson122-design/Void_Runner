/* NEW CODE ADDITIONS START: WATERMARK SPEC */
import React from 'react';

export const Watermark: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end pointer-events-none z-[1000] opacity-50">
      <span className="text-[10px] text-[#E056FD] font-bold tracking-widest font-mono shadow-[0_0_8px_#E056FD88]">
        ARCHITECT // VOID_WEAVER
      </span>
      <span className="text-[8px] text-white/50 tracking-widest font-mono">
        NINJA DIMENSION RUNNER v4.0
      </span>
    </div>
  );
};
/* NEW CODE ADDITIONS END: WATERMARK SPEC */