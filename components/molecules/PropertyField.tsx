import React from 'react';

interface PropertyFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const PropertyField: React.FC<PropertyFieldProps> = ({ label, className = '', ...props }) => {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 mb-1.5 block">{label}</label>
      <input
        className={`w-full text-sm px-3 py-2 rounded-lg bg-white/70 border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm ${className}`}
        {...props}
      />
    </div>
  );
};