import React from 'react';
import { BlockType } from '../../types';
import { LayoutGrid } from 'lucide-react';
import { BLOCK_REGISTRY } from '../../blocks/registry';
import { BlockCard } from '../molecules/BlockCard';

interface BlockBrowserProps {
  onDragStartType: (type: BlockType) => void;
  onDragEnd: () => void;
}

export const BlockBrowser: React.FC<BlockBrowserProps> = ({ onDragStartType, onDragEnd }) => {
  return (
    <div className="bg-transparent flex flex-col h-full border-t border-white/40">
      <div className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-200/60 shrink-0 bg-slate-50/50">
          <LayoutGrid className="w-3 h-3" /> Block Browser
      </div>
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        <div className="grid grid-cols-2 gap-2">
            {Object.values(BLOCK_REGISTRY).map((def) => (
                <BlockCard 
                    key={def.type}
                    definition={def}
                    onDragStart={onDragStartType}
                    onDragEnd={onDragEnd}
                />
            ))}
        </div>
      </div>
    </div>
  );
};