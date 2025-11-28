import React from 'react';
import { Block } from '../../types';
import { Box } from 'lucide-react';
import { NavigatorItem } from '../molecules/NavigatorItem';

interface NavigatorProps {
  blocks: Block[];
  activeBlockId: string | null;
  draggedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onMoveBlock: (draggedId: string, targetId: string, position: 'top' | 'bottom' | 'inside') => void;
}

export const Navigator: React.FC<NavigatorProps> = ({ blocks, activeBlockId, draggedBlockId, onSelectBlock, onMoveBlock }) => {
  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-200/60 shrink-0">
          <Box className="w-3 h-3" /> Navigator
      </div>
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5 custom-scrollbar">
          {blocks.length === 0 ? (
              <div className="px-4 text-xs text-slate-500 italic mt-4 text-center">No blocks</div>
          ) : (
              blocks.map(block => (
                <NavigatorItem 
                    key={block.id} 
                    block={block} 
                    depth={0} 
                    activeBlockId={activeBlockId}
                    draggedBlockId={draggedBlockId}
                    onSelectBlock={onSelectBlock} 
                    onMoveBlock={onMoveBlock}
                />
              ))
          )}
      </div>
    </div>
  );
};