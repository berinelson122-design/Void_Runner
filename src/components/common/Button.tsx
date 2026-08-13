import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseStyle =
    'px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest transition-all duration-150 cursor-pointer pointer-events-auto border-2';
  const variants = {
    primary:
      'bg-[#FF003C] text-black border-[#FF003C] hover:bg-white hover:text-black hover:border-white shadow-[0_0_20px_#FF003Caa]',
    secondary:
      'bg-black text-[#E056FD] border-[#E056FD] hover:bg-[#E056FD] hover:text-black shadow-[0_0_20px_#E056FD55]',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};