import React, { useState, useEffect } from 'react';
import { BlockComponentProps } from '../../../blocks/types';
import { ContentEditable } from '../../atoms/ContentEditable';
import { ListItem } from '../../../types';
import { AutoFocuser } from '../../atoms/AutoFocuser';

export const ListComponent: React.FC<BlockComponentProps> = ({ 
    block, activeBlockId, onUpdate, onFocus, onDelete, onAddBlockAfter, onChangeType, autoFocus, readOnly
}) => {
    const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
    const isActive = !readOnly && activeBlockId === block.id;

    useEffect(() => {
        if (isActive && activeItemIndex === null) {
            setActiveItemIndex(0);
        }
        if (!isActive) {
            setActiveItemIndex(null);
        }
    }, [isActive]);

    const getListContentString = (items: ListItem[]) => items.map(i => i.content).join('\n');
    const items = block.listItems || [{ content: block.content || '', checked: false }];

    const handleListKeyDown = (e: React.KeyboardEvent, index: number) => {
       if (readOnly) return;
       
       if (e.key === 'Enter' && !e.shiftKey) {
           e.preventDefault();
           const currentItem = items[index];
           const isEmpty = !currentItem.content || currentItem.content === '<br>' || currentItem.content.trim() === '';
           
           if (isEmpty && index === items.length - 1) {
               if (items.length === 1) {
                   onChangeType(block.id, 'paragraph');
               } else {
                   const newItems = [...items];
                   newItems.splice(index, 1);
                   onUpdate(block.id, getListContentString(newItems), { listItems: newItems });
                   onAddBlockAfter(block.id, 'paragraph');
               }
               return;
           }

           const newItems = [...items];
           newItems.splice(index + 1, 0, { content: '', checked: false });
           onUpdate(block.id, getListContentString(newItems), { listItems: newItems });
           setTimeout(() => setActiveItemIndex(index + 1), 10);
       }

       if (e.key === 'Backspace') {
           const currentItem = items[index];
           const isEmpty = !currentItem.content || currentItem.content === '<br>' || currentItem.content === '';
           
           if (isEmpty) {
               e.preventDefault();
               if (items.length === 1) {
                   onDelete(block.id);
               } else {
                   const newItems = [...items];
                   newItems.splice(index, 1);
                   onUpdate(block.id, getListContentString(newItems), { listItems: newItems });
                   setTimeout(() => setActiveItemIndex(Math.max(0, index - 1)), 10);
               }
           }
       }

       if (e.key === 'ArrowUp') {
           if (index > 0) {
               e.preventDefault();
               setActiveItemIndex(index - 1);
           }
       }

       if (e.key === 'ArrowDown') {
           if (index < items.length - 1) {
               e.preventDefault();
               setActiveItemIndex(index + 1);
           }
       }
    };

    return (
        <div className="flex flex-col w-full" onClick={() => !readOnly && onFocus(block.id)}>
            {items.map((item, index) => (
                <div key={index} className="flex items-start py-1 relative group/item">
                    <div className="w-8 flex justify-center shrink-0 select-none pt-1">
                        {block.type === 'ul' && <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-1.5" />}
                        {block.type === 'ol' && <span className="text-slate-500 font-mono text-sm">{index + 1}.</span>}
                        {block.type === 'check' && (
                            <input 
                                type="checkbox" 
                                checked={item.checked || false}
                                disabled={readOnly}
                                onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[index] = { ...item, checked: e.target.checked };
                                    onUpdate(block.id, getListContentString(newItems), { listItems: newItems });
                                }}
                                className="w-4 h-4 accent-brand-600 cursor-pointer mt-0.5 rounded bg-white border-slate-300"
                            />
                        )}
                    </div>
                    
                    <ContentEditable
                        tagName="div"
                        html={item.content}
                        autoFocus={autoFocus && index === 0}
                        readOnly={readOnly}
                        className={`w-full outline-none text-lg editor-serif ${item.checked ? 'line-through text-slate-400' : 'text-slate-800'}`}
                        placeholder="List item"
                        onChange={(val) => {
                            const newItems = [...items];
                            newItems[index] = { ...item, content: val };
                            onUpdate(block.id, getListContentString(newItems), { listItems: newItems });
                        }}
                        onFocus={() => {
                            onFocus(block.id);
                            setActiveItemIndex(index);
                        }}
                        onKeyDown={(e) => handleListKeyDown(e, index)}
                    />
                    {isActive && activeItemIndex === index && (
                        <AutoFocuser />
                    )}
                </div>
            ))}
        </div>
    );
};