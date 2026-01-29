import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 mb-4">
        <label className="text-sm font-medium text-gray-600 ml-1">
          {label}
        </label>

        <div className="relative group">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            className={`
              w-full 
              bg-white/50 
              border border-white/60 
              rounded-xl 
              py-3 
              ${icon ? 'pl-10' : 'pl-4'} 
              pr-4 
              outline-none 
              transition-all duration-200
              focus:bg-white/80 
              focus:border-purple-300 
              focus:ring-4 focus:ring-purple-500/10
              placeholder:text-gray-400
              text-gray-700
              ${className}
            `}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';
