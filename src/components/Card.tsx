import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`
        bg-white/30 
        backdrop-blur-md 
        border border-white/50 
        rounded-2xl 
        shadow-glass 
        p-8 
        ${className}
      `}
    >
      {children}
    </div>
  );
};