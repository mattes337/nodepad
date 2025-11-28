import React from 'react';
import { X, LucideIcon } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  icon?: LucideIcon;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  icon: Icon, 
  children, 
  footer 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
            <div>
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    {Icon && <Icon className="w-5 h-5" />}
                    {title}
                </h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
            </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
            {children}
        </div>

        {footer && (
            <div className="p-5 border-t border-slate-100 bg-white flex justify-end items-center gap-3">
                {footer}
            </div>
        )}
      </div>
    </div>
  );
};