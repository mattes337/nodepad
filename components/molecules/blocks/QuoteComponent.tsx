import React from 'react';
import { BlockComponentProps } from '../../../blocks/types';
import { ContentEditable } from '../../atoms/ContentEditable';

export const QuoteComponent: React.FC<BlockComponentProps> = ({ 
    block, onUpdate, onFocus, onAddBlockAfter, onDelete, autoFocus, readOnly
}) => {
    return (
        <div className="flex">
            <div className="w-1 bg-brand-500 mr-4 rounded-full opacity-80 shrink-0 shadow-sm shadow-brand-500/30"></div>
            <ContentEditable
                tagName="div"
                html={block.content}
                autoFocus={autoFocus}
                readOnly={readOnly}
                onChange={(val) => onUpdate(block.id, val)}
                onFocus={() => onFocus(block.id)}
                onKeyDown={(e) => {
                    if (readOnly) return;
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onAddBlockAfter(block.id, 'paragraph');
                    }
                    if (e.key === 'Backspace' && !block.content) {
                        e.preventDefault();
                        onDelete(block.id);
                    }
                }}
                placeholder="Quote..."
                className="w-full outline-none text-xl italic text-slate-600 editor-serif"
            />
        </div>
    );
};