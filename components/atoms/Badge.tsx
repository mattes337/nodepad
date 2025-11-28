import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'info' | 'neutral' | 'warning';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    info: 'bg-blue-50 border-blue-100 text-blue-700',
    neutral: 'bg-slate-100 border-slate-200 text-slate-600',
    warning: 'bg-amber-50 border-amber-100 text-amber-700'
  };

  return (
    <div className={`px-2 py-1 rounded border text-xs font-medium flex items-center ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};