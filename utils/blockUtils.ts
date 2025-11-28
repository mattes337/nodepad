import { Block } from '../types';

export const findBlockRecursive = (blocks: Block[], id: string): Block | null => {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.columns) {
      for (const col of block.columns) {
        const found = findBlockRecursive(col, id);
        if (found) return found;
      }
    }
  }
  return null;
};

export const updateBlockRecursive = (blocks: Block[], id: string, updateFn: (b: Block) => Block): Block[] => {
  return blocks.map(block => {
    if (block.id === id) {
      return updateFn(block);
    }
    if (block.columns) {
      return {
        ...block,
        columns: block.columns.map(col => updateBlockRecursive(col, id, updateFn))
      };
    }
    return block;
  });
};

export const deleteBlockRecursive = (blocks: Block[], id: string): Block[] => {
    return blocks.filter(b => b.id !== id).map(block => {
        if (block.columns) {
            return {
                ...block,
                columns: block.columns.map(col => deleteBlockRecursive(col, id))
            };
        }
        return block;
    });
};

export const addBlockRecursive = (blocks: Block[], afterId: string, newBlock: Block): Block[] => {
    // 1. Try to find in current array level
    const idx = blocks.findIndex(b => b.id === afterId);
    
    if (idx !== -1) {
        const newBlocks = [...blocks];
        newBlocks.splice(idx + 1, 0, newBlock);
        return newBlocks;
    }

    // 2. Check if we are trying to add to a specific column via special ID
    if (afterId.includes('_col_')) {
         return blocks.map(block => {
             if (afterId.startsWith(block.id)) {
                 const match = afterId.match(/_col_(\d+)_(empty|end)/);
                 if (match && block.columns) {
                     const colIndex = parseInt(match[1]);
                     const newColumns = [...block.columns];
                     newColumns[colIndex] = [...newColumns[colIndex], newBlock];
                     return { ...block, columns: newColumns };
                 }
             }
             return block;
         });
    }

    // 3. Recurse down
    return blocks.map(block => {
        if (block.columns) {
            return {
                ...block,
                columns: block.columns.map(col => addBlockRecursive(col, afterId, newBlock))
            };
        }
        return block;
    });
};

export const moveBlockInStructure = (blocks: Block[], id: string, direction: 'up' | 'down'): Block[] => {
  const index = blocks.findIndex(b => b.id === id);

  if (index !== -1) {
    if (direction === 'up') {
      if (index > 0) {
        const newBlocks = [...blocks];
        [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
        return newBlocks;
      }
    } else {
      if (index < blocks.length - 1) {
        const newBlocks = [...blocks];
        [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
        return newBlocks;
      }
    }
    return blocks;
  }

  let changed = false;
  const newBlocks = blocks.map(block => {
    if (block.columns) {
      let colsChanged = false;
      const newColumns = block.columns.map(col => {
        const newCol = moveBlockInStructure(col, id, direction);
        if (newCol !== col) {
          colsChanged = true;
          return newCol;
        }
        return col;
      });
      
      if (colsChanged) {
        changed = true;
        return { ...block, columns: newColumns };
      }
    }
    return block;
  });

  return changed ? newBlocks : blocks;
};

export const removeBlockFromTree = (blocks: Block[], id: string): { block: Block | null, newBlocks: Block[] } => {
    let foundBlock: Block | null = null;

    const filterRecursive = (list: Block[]): Block[] => {
        const result: Block[] = [];
        for (const b of list) {
            if (b.id === id) {
                foundBlock = b;
                continue; // Do not add to result (remove)
            }
            const newBlock = { ...b };
            if (newBlock.columns) {
                newBlock.columns = newBlock.columns.map(col => filterRecursive(col));
            }
            result.push(newBlock);
        }
        return result;
    };

    const newBlocks = filterRecursive(blocks);
    return { block: foundBlock, newBlocks };
};

export const insertBlockInTree = (list: Block[], targetId: string, position: 'top' | 'bottom' | 'inside', blockToInsert: Block): Block[] => {
    // Case 1: Drop INSIDE a column (targetId is synthetic: "layoutId_col_Index")
    if (position === 'inside' && targetId.includes('_col_')) {
         const [layoutId, colIdxRaw] = targetId.split('_col_');
         const colIndex = parseInt(colIdxRaw);
         
         return list.map(b => {
             if (b.id === layoutId) {
                 const newCols = [...(b.columns || [])];
                 if(newCols[colIndex]) {
                    newCols[colIndex] = [...newCols[colIndex], blockToInsert]; 
                 }
                 return { ...b, columns: newCols };
             }
             if (b.columns) {
                 return { ...b, columns: b.columns.map(col => insertBlockInTree(col, targetId, position, blockToInsert)) };
             }
             return b;
         });
    }

    // Case 2: Drop relative to another block
    const targetIndex = list.findIndex(b => b.id === targetId);
    if (targetIndex !== -1) {
        const newList = [...list];
        if (position === 'top') newList.splice(targetIndex, 0, blockToInsert);
        else newList.splice(targetIndex + 1, 0, blockToInsert);
        return newList;
    }

    // Case 3: Recursive search
    return list.map(b => {
        if (b.columns) {
            return {
                ...b,
                columns: b.columns.map(col => insertBlockInTree(col, targetId, position, blockToInsert))
            };
        }
        return b;
    });
};
