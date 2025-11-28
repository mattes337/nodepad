import React from 'react';
import { BlockPropertiesProps } from '../../../blocks/types';

export const LayoutProperties: React.FC<BlockPropertiesProps> = ({ block, onUpdateMetadata }) => (
    <div className="space-y-4">
        <div>
            <label className="text-xs font-medium text-slate-500 mb-2 block">Columns</label>
            <div className="flex gap-2 mb-4">
                {[2, 3, 4].map(num => (
                    <button
                    key={num}
                    onClick={() => {
                        onUpdateMetadata(block.id, { columnCount: num, layoutStyle: 'equal' });
                    }}
                    className={`flex-1 py-2 text-sm border rounded-md ${
                        (block.metadata?.columnCount || 2) === num
                        ? 'bg-brand-50 border-brand-500 text-brand-700'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                    >
                        {num} Columns
                    </button>
                ))}
            </div>
            
            {(block.metadata?.columnCount || 2) === 2 && (
                <div>
                <label className="text-xs font-medium text-slate-500 mb-2 block">Column Ratio</label>
                <div className="grid grid-cols-5 gap-2">
                    {[
                        { id: 'equal', label: '50/50', left: 50, right: 50 },
                        { id: '1:2', label: '33/67', left: 33, right: 67 },
                        { id: '2:1', label: '67/33', left: 67, right: 33 },
                        { id: '1:3', label: '25/75', left: 25, right: 75 },
                        { id: '3:1', label: '75/25', left: 75, right: 25 },
                    ].map((layout) => (
                        <button
                            key={layout.id}
                            onClick={() => onUpdateMetadata(block.id, { layoutStyle: layout.id })}
                            className={`flex flex-col gap-1 p-1 border rounded hover:bg-slate-50 ${
                                (block.metadata?.layoutStyle || 'equal') === layout.id
                                ? 'border-brand-500 bg-brand-50' 
                                : 'border-slate-200'
                            }`}
                            title={layout.label}
                        >
                            <div className="flex gap-0.5 h-4 w-full">
                                <div className="bg-slate-300 rounded-sm" style={{ width: `${layout.left}%` }}></div>
                                <div className="bg-slate-300 rounded-sm" style={{ width: `${layout.right}%` }}></div>
                            </div>
                        </button>
                    ))}
                </div>
                </div>
            )}
        </div>
    </div>
);