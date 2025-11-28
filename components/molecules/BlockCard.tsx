import React from 'react';
import { BlockType } from '../../types';
import { BlockDefinition } from '../../blocks/types';

interface BlockCardProps {
  definition: BlockDefinition;
  onDragStart: (type: BlockType) => void;
  onDragEnd: () => void;
}

export const BlockCard: React.FC<BlockCardProps> = ({ definition, onDragStart, onDragEnd }) => {
  return (
    <div 
        draggable
        onDragStart={(e) => {
            onDragStart(definition.type);
            e.dataTransfer.effectAllowed = 'copy';
        }}
        onDragEnd={onDragEnd}
        className="flex flex-col items-center justify-center p-3 bg-white/70 border border-slate-200/60 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:bg-brand-50 hover:border-brand-200 hover:shadow-md transition-all group"
    >
        <definition.icon className="w-6 h-6 text-slate-400 mb-2 group-hover:text-brand-500 transition-colors" />
        <span className="text-xs font-medium text-slate-500 group-hover:text-brand-700 transition-colors">{definition.label}</span>
    </div>
  );
};