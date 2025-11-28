import React, { useState, useEffect } from 'react';
import { Block, BlockType } from '../../types';
import { Navigator } from './Navigator';
import { BlockBrowser } from './BlockBrowser';

interface SidebarLeftProps {
  blocks: Block[];
  activeBlockId: string | null;
  draggedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onMoveBlock: (draggedId: string, targetId: string, position: 'top' | 'bottom' | 'inside') => void;
  onDragStartType: (type: BlockType) => void;
  onDragEnd: () => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  blocks,
  activeBlockId,
  draggedBlockId,
  onSelectBlock,
  onMoveBlock,
  onDragStartType,
  onDragEnd
}) => {
  const [browserHeight, setBrowserHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newHeight = window.innerHeight - e.clientY;
      const maxBrowserHeight = window.innerHeight - 160;
      const clampedHeight = Math.min(Math.max(newHeight, 100), maxBrowserHeight);
      setBrowserHeight(clampedHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col z-40 shrink-0">
       <div className="flex-1 flex flex-col min-h-0">
           <Navigator 
              blocks={blocks} 
              activeBlockId={activeBlockId}
              draggedBlockId={draggedBlockId}
              onSelectBlock={onSelectBlock}
              onMoveBlock={onMoveBlock}
           />
       </div>
       
       {/* Resize Handle */}
       <div 
         onMouseDown={startResizing}
         className={`
            h-2 cursor-row-resize flex items-center justify-center shrink-0 
            bg-slate-100 border-y border-slate-200 hover:bg-brand-50 hover:border-brand-200
            transition-colors z-20
            ${isResizing ? 'bg-brand-50 border-brand-300' : ''}
         `}
         title="Drag to resize"
       >
          <div className={`w-8 h-1 rounded-full transition-colors ${isResizing ? 'bg-brand-400' : 'bg-slate-300'}`} />
       </div>
       
       <div style={{ height: browserHeight }} className="shrink-0 bg-white">
           <BlockBrowser 
              onDragStartType={onDragStartType}
              onDragEnd={onDragEnd}
           />
       </div>
    </aside>
  );
};