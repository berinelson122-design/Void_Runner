import React from 'react';

export const Scanlines: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1000] overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[size:100%_4px]" />
    </div>
  );
};