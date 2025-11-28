import React, { useState } from 'react';
import { Box } from 'lucide-react';
import { Block } from '../../types';
import { getBlockDefinition } from '../../blocks/registry';
import { NavigatorColumn } from './NavigatorColumn';

interface NavigatorItemProps {
  block: Block; 
  depth: number; 
  activeBlockId: string | null;
  draggedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onMoveBlock: (draggedId: string, targetId: string, position: 'top' | 'bottom' | 'inside') => void;
}

export const NavigatorItem: React.FC<NavigatorItemProps> = ({ block, depth, activeBlockId, draggedBlockId, onSelectBlock, onMoveBlock }) => {
  const definition = getBlockDefinition(block.type);
  const Icon = definition.icon || Box;
  const isActive = activeBlockId === block.id;
  const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | 'none'>('none');

  let label: string = block.type;
  if (block.content) {
      const text = block.content.replace(/<[^>]*>/g, '');
      label = text.length > 20 ? text.substring(0, 20) + '...' : text;
  } else if (block.type === 'image') {
      label = block.metadata?.alt || 'Image';
  } else if (block.type === 'layout') {
      label = `Layout (${block.metadata?.columnCount || 2} col)`;
  } else {
      label = definition.label;
  }

  const handleDragStart = (e: React.DragEvent) => {
      e.dataTransfer.setData('node-id', block.id);
      e.dataTransfer.effectAllowed = 'move';
      e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const offset = e.clientY - rect.top;
      if (offset < rect.height / 2) {
          setDropPosition('top');
      } else {
          setDropPosition('bottom');
      }
  };

  const handleDragLeave = () => {
      setDropPosition('none');
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDropPosition('none');
      const draggedId = e.dataTransfer.getData('node-id');
      if (draggedId && draggedId !== block.id) {
          onMoveBlock(draggedId, block.id, dropPosition === 'top' ? 'top' : 'bottom');
      }
  };

  return (
    <div className="relative group">
        {dropPosition === 'top' && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-400 shadow-sm z-20" />
        )}
        
        <div 
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
            flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs select-none transition-all relative rounded-r-md mr-2
            ${isActive 
                ? 'bg-brand-50 text-brand-700 font-medium border-l-2 border-brand-500' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-2 border-transparent'}
            `}
            style={{ paddingLeft: `${depth * 12 + 12}px` }}
            onClick={(e) => {
                e.stopPropagation();
                onSelectBlock(block.id);
            }}
        >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span className="truncate">{label}</span>
        </div>

        {dropPosition === 'bottom' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-400 shadow-sm z-20" />
        )}

        {block.type === 'layout' && block.columns && (
            <div>
                {block.columns.map((col, colIndex) => (
                    <NavigatorColumn
                        key={`${block.id}_col_${colIndex}`}
                        parentBlockId={block.id}
                        colIndex={colIndex}
                        childrenBlocks={col}
                        depth={depth + 1}
                        activeBlockId={activeBlockId}
                        draggedBlockId={draggedBlockId}
                        onSelectBlock={onSelectBlock}
                        onMoveBlock={onMoveBlock}
                    />
                ))}
            </div>
        )}
    </div>
  );
};