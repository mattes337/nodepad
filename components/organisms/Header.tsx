import React from 'react';
import { Sparkles, FileCode, Upload, Save, Download, Eye, Edit3 } from 'lucide-react';
import { User } from '../../types';
import { Button } from '../atoms/Button';
import { Avatar } from '../atoms/Avatar';

interface HeaderProps {
  activeUsers: User[];
  isPreview: boolean;
  onTogglePreview: () => void;
  onImportAI: () => void;
  onImportWP: () => void;
  onLoad: () => void;
  onSave: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeUsers, isPreview, onTogglePreview, onImportAI, onImportWP, onLoad, onSave }) => {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-50 relative shadow-sm">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
        <div className="flex items-center gap-2" style={{ display: 'flex' }}> 
             <span className="font-bold text-slate-900 text-lg tracking-tight">NodePad</span>
             <span className="bg-brand-50 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-100 uppercase tracking-wide">Beta</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 mr-2">
           {!isPreview && (
               <>
                <Button variant="brand-ghost" size="sm" icon={Sparkles} onClick={onImportAI} className="mr-1">
                    <span className="hidden sm:inline">AI Assist</span>
                </Button>
                <Button variant="ghost" size="sm" icon={FileCode} onClick={onImportWP} className="mr-1">
                    <span className="hidden sm:inline">WordPress</span>
                </Button>
                <Button variant="ghost" size="sm" icon={Upload} onClick={onLoad}>
                    <span className="hidden sm:inline">Load</span>
                </Button>
                <Button variant="ghost" size="sm" icon={Save} onClick={onSave}>
                    <span className="hidden sm:inline">Save</span>
                </Button>
               </>
           )}
           
           <div className="h-6 w-px bg-slate-200 mx-2"></div>
           
           <Button 
                variant={isPreview ? 'secondary' : 'ghost'} 
                size="sm" 
                icon={isPreview ? Edit3 : Eye} 
                onClick={onTogglePreview}
           >
              {isPreview ? 'Back to Edit' : 'Preview'}
           </Button>
        </div>

        {!isPreview && (
            <>
                <div className="h-6 w-px bg-slate-200 mx-1"></div>
                <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                    {activeUsers.map(u => (
                    <Avatar key={u.id} user={u} />
                    ))}
                </div>
                </div>
                
                <Button variant="primary" size="sm" icon={Download}>
                Publish
                </Button>
            </>
        )}
      </div>
    </header>
  );
};