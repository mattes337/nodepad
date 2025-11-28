import React from 'react';
import { BlockComponentProps } from '../../../blocks/types';
import { ContentEditable } from '../../atoms/ContentEditable';

export interface BaseHeadingProps extends BlockComponentProps {
    level: 1 | 2;
}

export const BaseHeadingComponent: React.FC<BaseHeadingProps> = ({ 
    block, onUpdate, onFocus, onAddBlockAfter, onDelete, autoFocus, level, readOnly
}) => {
    const Tag = level === 1 ? 'h1' : 'h2';
    const baseClass = "w-full outline-none font-sans";
    const levelClass = level === 1 
        ? "text-4xl font-bold text-slate-900 leading-tight tracking-tight" 
        : "text-2xl font-semibold text-slate-800 leading-snug mt-4 tracking-tight";

    return (
        <ContentEditable
            tagName={Tag}
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
            placeholder={`Heading ${level}`}
            className={`${baseClass} ${levelClass}`}
        />
    );
};