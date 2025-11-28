import React from 'react';
import { BlockComponentProps } from '../../../blocks/types';
import { ContentEditable } from '../../atoms/ContentEditable';

export const ParagraphComponent: React.FC<BlockComponentProps> = ({ 
    block, onUpdate, onFocus, onAddBlockAfter, onDelete, autoFocus, readOnly
}) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (readOnly) return;
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onAddBlockAfter(block.id, 'paragraph');
        }
        if (e.key === 'Backspace' && (!block.content || block.content === '<br>' || block.content === '')) {
            e.preventDefault();
            onDelete(block.id);
        }
    };

    return (
        <ContentEditable
            tagName="div"
            html={block.content}
            autoFocus={autoFocus}
            readOnly={readOnly}
            onChange={(val) => onUpdate(block.id, val)}
            onFocus={() => onFocus(block.id)}
            onKeyDown={handleKeyDown}
            placeholder="Type something..."
            className="w-full outline-none text-lg text-slate-800 editor-serif leading-relaxed"
        />
    );
};