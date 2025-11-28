import React from 'react';
import { Block, BlockType } from '../../types';
import { BlockRenderer } from './BlockRenderer';
import { TextFormatToolbar } from '../molecules/TextFormatToolbar';
import { ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';

interface EditorCanvasProps {
  blocks: Block[];
  activeBlockId: string | null;
  draggedBlockId: string | null;
  onUpdateBlock: (id: string, content: string, extra?: Partial<Block>) => void;
  onFocus: (id: string) => void;
  onDelete: (id: string) => void;
  onAddBlockAfter: (id: string, type: BlockType) => void;
  onChangeType: (id: string, type: BlockType) => void;
  onOpenAI: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (id: string) => void;
  moveBlock: (direction: 'up' | 'down') => void;
  onOpenImageBrowser?: (id: string) => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  blocks,
  activeBlockId,
  draggedBlockId,
  onUpdateBlock,
  onFocus,
  onDelete,
  onAddBlockAfter,
  onChangeType,
  onOpenAI,
  onDragStart,
  onDragEnd,
  onDrop,
  moveBlock,
  onOpenImageBrowser
}) => {
  return (
    <main className="flex-1 flex flex-col relative min-w-0">
      <TextFormatToolbar />
      <div 
        className="flex-1 overflow-y-auto scroll-smooth px-4 md:px-16 pt-8 pb-32" 
        onClick={(e) => {
             if (e.target === e.currentTarget && blocks.length > 0 && !activeBlockId) {
                onFocus(blocks[blocks.length-1].id);
             }
        }}
        onDragOver={(e) => {
            e.preventDefault();
        }}
        onDrop={(e) => {
            e.preventDefault();
            onDrop('__CANVAS_BOTTOM__');
        }}
      >
         <div className="max-w-4xl mx-auto bg-white min-h-[calc(100vh-4rem)] shadow-sm border border-slate-200 rounded-xl p-12 transition-all">
            <div className="space-y-1">
                {blocks.map((block) => (
                    <div id={`block-${block.id}`} key={block.id}>
                        <BlockRenderer
                            block={block}
                            activeBlockId={activeBlockId}
                            isDragging={draggedBlockId === block.id}
                            onUpdate={onUpdateBlock}
                            onFocus={onFocus}
                            onDelete={onDelete}
                            onAddBlockAfter={onAddBlockAfter}
                            onChangeType={onChangeType}
                            onOpenAI={onOpenAI}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                            onDrop={onDrop}
                            onOpenImageBrowser={onOpenImageBrowser}
                        />
                    </div>
                ))}
            </div>
            
            <button 
                className="w-full py-4 mt-8 border border-dashed border-slate-300 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50 cursor-pointer transition-all group"
                onClick={() => onAddBlockAfter('__END__', 'paragraph')}
            >
                <div className="flex items-center gap-2 font-medium text-sm">
                    <Plus className="w-5 h-5" />
                    <span>Add block to end</span>
                </div>
            </button>
         </div>
      </div>

      {activeBlockId && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 w-auto">
             <div className="bg-white border border-slate-200 shadow-lg rounded-full p-2 animate-in fade-in slide-in-from-bottom-4 duration-200 flex items-center gap-1">
                <button onClick={() => moveBlock('up')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors" title="Move Up"><ArrowUp className="w-4 h-4"/></button>
                <button onClick={() => moveBlock('down')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors" title="Move Down"><ArrowDown className="w-4 h-4"/></button>
                <div className="h-4 w-px bg-slate-200 mx-2"></div>
                <button onClick={() => onDelete(activeBlockId)} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full text-slate-400 transition-colors" title="Delete"><Trash2 className="w-4 h-4"/></button>
             </div>
          </div>
      )}
    </main>
  );
};