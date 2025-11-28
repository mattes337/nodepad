import React from 'react';
import { BlockComponentProps } from '../../../blocks/types';
import { Plus } from 'lucide-react';

export const LayoutComponent: React.FC<BlockComponentProps> = ({ 
    block, activeBlockId, onFocus, onAddBlockAfter, renderChild, readOnly
}) => {
    const cols = block.metadata?.columnCount || 2;
    const columns = block.columns || Array(cols).fill([]).map(() => []);
    const style = block.metadata?.layoutStyle || 'equal';
    
    let gridStyle: React.CSSProperties = { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` };
    
    if (cols === 2) {
         switch (style) {
             case '1:2': gridStyle = { gridTemplateColumns: '1fr 2fr' }; break;
             case '2:1': gridStyle = { gridTemplateColumns: '2fr 1fr' }; break;
             case '1:3': gridStyle = { gridTemplateColumns: '1fr 3fr' }; break;
             case '3:1': gridStyle = { gridTemplateColumns: '3fr 1fr' }; break;
             default: gridStyle = { gridTemplateColumns: '1fr 1fr' }; break;
         }
    }

    return (
        <div className="w-full" onClick={(e) => {
            if (!readOnly) {
                e.stopPropagation();
                onFocus(block.id);
            }
        }}>
            <div className={`grid gap-4 w-full`} style={gridStyle}>
                {columns.map((colBlocks, colIndex) => (
                    <div key={colIndex} className={`min-h-[100px] ${!readOnly ? 'border border-slate-100 rounded-lg bg-slate-50/50' : ''} p-2 relative`}>
                        {!readOnly && colBlocks.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                                <button 
                                    className="pointer-events-auto bg-white shadow-sm border px-3 py-1 rounded text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddBlockAfter(block.id + `_col_${colIndex}_empty`, 'paragraph');
                                    }}
                                >
                                    <Plus className="w-3 h-3" /> Add content
                                </button>
                            </div>
                        )}
                        {/* Use the passed renderChild callback for recursion */}
                        {renderChild && colBlocks.map(childBlock => (
                             <div key={childBlock.id} className="w-full" onClick={(e) => !readOnly && e.stopPropagation()}>
                                {renderChild(childBlock)}
                             </div>
                        ))}
                        
                        {!readOnly && (
                            <div 
                                className="h-6 hover:bg-brand-50 rounded flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity mt-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const lastId = colBlocks.length > 0 ? colBlocks[colBlocks.length-1].id : block.id + `_col_${colIndex}_end`;
                                    onAddBlockAfter(lastId, 'paragraph');
                                }}
                            >
                                <Plus className="w-4 h-4 text-brand-300" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};