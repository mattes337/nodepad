import React from 'react';
import { Block, User } from '../types';
import { BlockRenderer } from './organisms/BlockRenderer';

interface NodePadViewProps {
    blocks: Block[];
    user?: User;
}

export const NodePadView: React.FC<NodePadViewProps> = ({ blocks }) => {
    const titleBlock = blocks.find(b => b.type === 'h1');
    
    // Filter out the first H1 if it exists to prevent double rendering if we want a specific title treatment
    // For now, let's render all blocks as they are, same as the editor.
    
    return (
        <div className="w-full h-full overflow-y-auto bg-white">
            <div className="max-w-3xl mx-auto py-16 px-8 md:px-12">
                <article className="prose prose-slate max-w-none">
                    {blocks.length === 0 ? (
                        <div className="text-center text-slate-400 py-20 italic">
                            Empty Document
                        </div>
                    ) : (
                        blocks.map((block) => (
                            <div key={block.id} className="mb-2">
                                <BlockRenderer
                                    block={block}
                                    readOnly={true}
                                    activeBlockId={null}
                                    isDragging={false}
                                    onUpdate={() => {}}
                                    onFocus={() => {}}
                                    onDelete={() => {}}
                                    onAddBlockAfter={() => {}}
                                    onChangeType={() => {}}
                                    onOpenAI={() => {}}
                                    onDragStart={() => {}}
                                    onDragEnd={() => {}}
                                    onDrop={() => {}}
                                />
                            </div>
                        ))
                    )}
                </article>
                
                <div className="mt-20 pt-8 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-400">Published with NodePad AI</p>
                </div>
            </div>
        </div>
    );
};