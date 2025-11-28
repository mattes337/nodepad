import React, { useState } from 'react';
import { BlockComponentProps } from '../../../blocks/types';
import { ContentEditable } from '../../atoms/ContentEditable';
import { Plus, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export const TableComponent: React.FC<BlockComponentProps> = ({ 
    block, activeBlockId, onUpdate, onFocus, readOnly
}) => {
    const [focusedCell, setFocusedCell] = useState<{ r: number, c: number } | null>(null);
    const isActive = !readOnly && activeBlockId === block.id;
    const rows = block.tableContent || [['', '', ''], ['', '', ''], ['', '', '']];
    const colCount = rows[0] ? rows[0].length : 3;

    const updateTable = (newRows: string[][]) => {
        onUpdate(block.id, block.content, { tableContent: newRows });
    };

    const updateCell = (r: number, c: number, val: string) => {
         const newRows = [...rows];
         newRows[r] = [...newRows[r]];
         newRows[r][c] = val;
         updateTable(newRows);
    };

    const addRow = (afterIndex: number) => {
         const newRows = [...rows];
         const newRow = new Array(colCount).fill('');
         newRows.splice(afterIndex + 1, 0, newRow);
         updateTable(newRows);
    };

    const removeRow = (index: number) => {
        if (rows.length <= 1) return;
        const newRows = rows.filter((_, i) => i !== index);
        updateTable(newRows);
    };

    const moveRow = (index: number, direction: 'up' | 'down') => {
         if ((direction === 'up' && index === 0) || (direction === 'down' && index === rows.length - 1)) return;
         const newRows = [...rows];
         const swapIndex = direction === 'up' ? index - 1 : index + 1;
         [newRows[index], newRows[swapIndex]] = [newRows[swapIndex], newRows[index]];
         updateTable(newRows);
    };

    const addCol = (afterIndex: number) => {
         const newRows = rows.map(row => {
             const r = [...row];
             r.splice(afterIndex + 1, 0, '');
             return r;
         });
         updateTable(newRows);
    };
    
    const removeCol = (index: number) => {
        if (colCount <= 1) return;
        const newRows = rows.map(row => row.filter((_, i) => i !== index));
        updateTable(newRows);
    };

    const moveCol = (index: number, direction: 'left' | 'right') => {
         if ((direction === 'left' && index === 0) || (direction === 'right' && index === colCount - 1)) return;
         const newRows = rows.map(row => {
             const r = [...row];
             const swapIndex = direction === 'left' ? index - 1 : index + 1;
             [r[index], r[swapIndex]] = [r[swapIndex], r[index]];
             return r;
         });
         updateTable(newRows);
    };

    return (
        <div className="w-full relative group/table mt-2" onClick={() => !readOnly && onFocus(block.id)}>
           {isActive && (
               <div className="absolute -top-12 left-0 z-20 bg-white border border-slate-200 shadow-lg rounded-md p-1 flex items-center gap-1 animate-in fade-in slide-in-from-bottom-2 ring-1 ring-black/5">
                    <div className="flex items-center gap-0.5 pr-2 border-r border-slate-200 mr-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase px-1">Row</span>
                        <button onClick={() => addRow(rows.length - 1)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700" title="Add Row Bottom"><Plus className="w-3.5 h-3.5"/></button>
                        <button onClick={() => removeRow(rows.length - 1)} className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-slate-400" title="Remove Last Row"><Trash2 className="w-3.5 h-3.5"/></button>
                        <button onClick={() => moveRow(focusedCell?.r || 0, 'up')} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700" title="Move Current Row Up"><ArrowUp className="w-3.5 h-3.5"/></button>
                        <button onClick={() => moveRow(focusedCell?.r || 0, 'down')} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700" title="Move Current Row Down"><ArrowDown className="w-3.5 h-3.5"/></button>
                    </div>
                    <div className="flex items-center gap-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase px-1">Col</span>
                        <button onClick={() => addCol(colCount - 1)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700" title="Add Col Right"><Plus className="w-3.5 h-3.5"/></button>
                        <button onClick={() => removeCol(colCount - 1)} className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-slate-400" title="Remove Last Col"><Trash2 className="w-3.5 h-3.5"/></button>
                        <button onClick={() => moveCol(focusedCell?.c || 0, 'left')} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700" title="Move Current Col Left"><ArrowLeft className="w-3.5 h-3.5"/></button>
                        <button onClick={() => moveCol(focusedCell?.c || 0, 'right')} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700" title="Move Current Col Right"><ArrowRight className="w-3.5 h-3.5"/></button>
                    </div>
               </div>
           )}

           <div className="overflow-x-auto">
               <table className="w-full border-collapse border border-slate-200 text-sm text-slate-700 bg-white/40">
                   {block.metadata?.caption && (
                       <caption className="text-sm text-slate-500 font-medium py-2 caption-bottom">
                           {block.metadata.caption}
                       </caption>
                   )}
                   <tbody>
                       {rows.map((row, rIndex) => (
                           <tr key={rIndex}>
                               {row.map((cellContent, cIndex) => (
                                   <td key={`${rIndex}-${cIndex}`} className="border border-slate-200 p-2 min-w-[100px] relative group/cell hover:bg-white/60 transition-colors">
                                       <ContentEditable
                                           tagName="div"
                                           html={cellContent}
                                           autoFocus={isActive && focusedCell?.r === rIndex && focusedCell?.c === cIndex}
                                           readOnly={readOnly}
                                           onChange={(val) => updateCell(rIndex, cIndex, val)}
                                           onFocus={() => {
                                               onFocus(block.id);
                                               setFocusedCell({ r: rIndex, c: cIndex });
                                           }}
                                           onKeyDown={(e) => {
                                               if (readOnly) return;
                                               if (e.key === 'Tab' && !e.shiftKey) {
                                                   if (rIndex === rows.length - 1 && cIndex === colCount - 1) {
                                                       e.preventDefault();
                                                       addRow(rIndex);
                                                       setTimeout(() => setFocusedCell({ r: rIndex + 1, c: 0 }), 10);
                                                   }
                                               }
                                           }}
                                           placeholder="Cell"
                                           className="w-full outline-none bg-transparent"
                                       />
                                   </td>
                               ))}
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
        </div>
    );
};