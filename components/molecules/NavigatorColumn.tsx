import React, { useState } from 'react';
import { Columns } from 'lucide-react';
import { Block } from '../../types';
import { NavigatorItem } from './NavigatorItem';

interface NavigatorColumnProps {
    parentBlockId: string;
    colIndex: number;
    childrenBlocks: Block[];
    depth: number;
    activeBlockId: string | null;
    draggedBlockId: string | null;
    onSelectBlock: (id: string) => void;
    onMoveBlock: (draggedId: string, targetId: string, position: 'top' | 'bottom' | 'inside') => void;
}

export const NavigatorColumn: React.FC<NavigatorColumnProps> = ({ 
    parentBlockId, colIndex, childrenBlocks, depth, activeBlockId, draggedBlockId, onSelectBlock, onMoveBlock 
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const syntheticId = `${parentBlockId}_col_${colIndex}`;

    const handleDragOver = (e: React.DragEvent) => {
        if (draggedBlockId === parentBlockId) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const draggedId = e.dataTransfer.getData('node-id');
        if (draggedId) {
            onMoveBlock(draggedId, syntheticId, 'inside');
        }
    };

    return (
        <div>
            <div 
                className={`
                    flex items-center gap-2 px-3 py-1 cursor-default text-[10px] font-semibold uppercase tracking-wide text-slate-400
                    ${isDragOver ? 'bg-brand-50 text-brand-600' : 'hover:bg-slate-50'}
                `}
                style={{ paddingLeft: `${depth * 12 + 12}px` }}
                onDragOver={handleDragOver}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
            >
                <Columns className="w-3 h-3" />
                <span>Column {colIndex + 1}</span>
            </div>
            
            {childrenBlocks.length === 0 ? (
                <div 
                    className="text-[10px] text-slate-300 italic py-0.5 hover:bg-slate-50"
                    style={{ paddingLeft: `${(depth+1) * 12 + 12}px` }}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    Empty
                </div>
            ) : (
                childrenBlocks.map(child => (
                    <NavigatorItem
                        key={child.id}
                        block={child}
                        depth={depth + 1}
                        activeBlockId={activeBlockId}
                        draggedBlockId={draggedBlockId}
                        onSelectBlock={onSelectBlock}
                        onMoveBlock={onMoveBlock}
                    />
                ))
            )}
        </div>
    );
};