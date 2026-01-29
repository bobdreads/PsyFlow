import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, isLoading, className, ...props }) => {
  return (
    <button
      className={`
        w-full 
        bg-gradient-to-r from-purple-500 to-indigo-500 
        hover:from-purple-600 hover:to-indigo-600
        text-white font-medium 
        py-3 px-6 
        rounded-xl 
        shadow-lg shadow-purple-500/20
        transform transition-all duration-200
        active:scale-[0.98]
        disabled:opacity-70 disabled:cursor-not-allowed
        flex justify-center items-center
        ${className}
      `}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};