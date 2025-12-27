import React, { useState } from 'react';
import { Block, BlockType } from '../../types';
import { GripVertical, X } from 'lucide-react';
import { getBlockDefinition } from '../../blocks/registry';

interface BlockProps {
  block: Block;
  activeBlockId: string | null;
  isDragging: boolean;
  canDelete?: boolean;
  readOnly?: boolean;
  onUpdate: (id: string, content: string, extra?: Partial<Block>) => void;
  onFocus: (id: string) => void;
  onDelete: (id: string) => void;
  onAddBlockAfter: (id: string, type: BlockType) => void;
  onChangeType: (id: string, type: BlockType) => void;
  onOpenAI: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (id: string) => void;
  onOpenImageBrowser?: (id: string) => void;
}

export const BlockRenderer: React.FC<BlockProps> = (props) => {
  const {
      block, activeBlockId, isDragging, canDelete = true, readOnly,
      onUpdate, onFocus, onDelete, onAddBlockAfter,
      onChangeType, onOpenAI, onDragStart, onDragEnd, onDrop,
      onOpenImageBrowser
  } = props;

  const [isDraggable, setIsDraggable] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const isActive = !readOnly && activeBlockId === block.id;
  const definition = getBlockDefinition(block.type);
  const Component = definition.Component;

  const isList = ['ul', 'ol', 'check'].includes(block.type);
  const pyClass = isList ? 'py-1' : 'py-2';

  const renderChild = (childBlock: Block) => (
      <BlockRenderer 
          {...props} 
          block={childBlock} 
          canDelete={true} 
      />
  );

  if (readOnly) {
      return (
          <div className={`${pyClass} w-full`}>
              <Component 
                block={block}
                activeBlockId={null}
                isDragging={false}
                readOnly={true}
                onUpdate={() => {}}
                onFocus={() => {}}
                onDelete={() => {}}
                onAddBlockAfter={() => {}}
                onChangeType={() => {}}
                onOpenAI={() => {}}
                onDragStart={() => {}}
                onDragEnd={() => {}}
                onDrop={() => {}}
                autoFocus={false}
                renderChild={renderChild}
              />
          </div>
      );
  }

  return (
    <div 
        draggable={isDraggable && block.type !== 'layout'}
        onDragStart={(e) => {
            onDragStart(block.id);
            e.dataTransfer.effectAllowed = 'move';
        }}
        onDragEnd={() => {
            setIsDraggable(false);
            setIsDragOver(false);
            onDragEnd();
        }}
        onDragOver={(e) => {
            // Only capture drag over if it's a block we are moving.
            // If it is text (from outside or variable tree), let standard behavior happen 
            // so drop can occur in contentEditable.
            if (e.dataTransfer.types.includes('node-id')) {
                e.preventDefault();
                if (!isDragging && !isDragOver && block.type !== 'layout') setIsDragOver(true);
            }
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
            if (e.dataTransfer.types.includes('node-id')) {
                e.preventDefault();
                e.stopPropagation();
                setIsDragOver(false);
                onDrop(block.id);
            }
            // If dragging variables (text/plain), we do NOT preventDefault here, 
            // allowing the event to bubble or be handled by the child ContentEditable.
        }}
        className={`group/block relative pl-8 pr-4 ${pyClass} -ml-8 rounded-lg transition-all duration-200 border-l-2 
            ${isActive ? 'bg-white/50 shadow-sm border-brand-500 z-10 ring-1 ring-slate-200' : 'border-transparent hover:bg-slate-50'}
            ${isDragging ? 'opacity-40 scale-[0.98] grayscale' : 'opacity-100'}
            ${isDragOver ? 'border-t-2 border-t-brand-500 bg-brand-50' : ''}
        `}
    >
      
      <div className={`absolute left-1 top-3 flex items-center opacity-0 group-hover/block:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`}>
        <div 
            className="p-1 text-slate-400 hover:text-brand-500 cursor-grab active:cursor-grabbing transition-colors"
            onMouseEnter={() => setIsDraggable(true)}
            onMouseLeave={() => setIsDraggable(false)}
            title="Drag to move"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      </div>

      <div className={`absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover/block:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`}>
        {canDelete && (
            <button 
                onClick={() => onDelete(block.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="Delete block"
            >
                <X className="w-4 h-4" />
            </button>
        )}
      </div>

      <div className="w-full">
        <Component 
            block={block}
            activeBlockId={activeBlockId}
            isDragging={isDragging}
            onUpdate={onUpdate}
            onFocus={onFocus}
            onDelete={onDelete}
            onAddBlockAfter={onAddBlockAfter}
            onChangeType={onChangeType}
            onOpenAI={onOpenAI}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDrop={onDrop}
            autoFocus={isActive}
            renderChild={renderChild}
            onOpenImageBrowser={onOpenImageBrowser}
        />
      </div>
    </div>
  );
};