import { v4 as uuidv4 } from 'uuid';
import { Block } from '../types';
import { getBlockDefinition } from '../blocks/registry';

// --- Helper: Serialize individual block ---

const serializeBlock = (block: Block): string => {
  if (block.type === 'layout') {
      // Special handling for layout recursion because definition doesn't have easy access to `serializeBlock` (circular dependency)
      const columns = block.columns || [];
      const style = block.metadata?.layoutStyle || 'equal';
      const count = block.metadata?.columnCount || 2;
      
      const colHtml = columns.map((colBlocks, index) => {
        const innerContent = colBlocks.map(b => serializeBlock(b)).join('\n\n');
        let width = '';
        
        // Only apply explicit widths for 2-column custom layouts
        if (count === 2 && style !== 'equal') {
            if (style === '1:2') width = index === 0 ? '33.33%' : '66.66%';
            if (style === '2:1') width = index === 0 ? '66.66%' : '33.33%';
            if (style === '1:3') width = index === 0 ? '25%' : '75%';
            if (style === '3:1') width = index === 0 ? '75%' : '25%';
        }
        
        const widthAttr = width ? `{"width":"${width}"}` : '';
        const styleAttr = width ? ` style="flex-basis:${width}"` : '';
        
        return `<!-- wp:column ${widthAttr} -->\n<div class="wp-block-column"${styleAttr}>\n${innerContent}\n</div>\n<!-- /wp:column -->`;
      }).join('\n\n');
      
      return `<!-- wp:columns -->\n<div class="wp-block-columns">\n${colHtml}\n</div>\n<!-- /wp:columns -->`;
  }

  const definition = getBlockDefinition(block.type);
  return definition.serializeToWordPress(block);
};

export const serializeToWordPress = (blocks: Block[]): string => {
  return blocks.map(serializeBlock).join('\n\n');
};

// --- Helper: Parse Gutenberg Code ---

const parseAttributes = (commentText: string): any => {
  const openBrace = commentText.indexOf('{');
  if (openBrace !== -1) {
      try {
          const jsonPart = commentText.substring(openBrace).trim();
          return JSON.parse(jsonPart);
      } catch (e) {
          return {};
      }
  }
  return {};
};

const getBlockType = (commentText: string): string | null => {
  const match = commentText.match(/^wp:([a-z0-9/-]+)/);
  return match ? match[1] : null;
};

const isClosingTag = (commentText: string): boolean => {
  return commentText.startsWith('/wp:');
};

export const parseWordPressCode = (code: string): Block[] => {
  const commentRegex = /<!--\s*([\s\S]*?)\s*-->/g;
  
  const tokens = [];
  let lastIndex = 0;
  let match;

  while ((match = commentRegex.exec(code)) !== null) {
    const textBefore = code.slice(lastIndex, match.index);
    if (textBefore.trim()) {
      tokens.push({ type: 'html', content: textBefore });
    }
    
    tokens.push({ type: 'tag', content: match[1] });
    lastIndex = commentRegex.lastIndex;
  }
  const trailing = code.slice(lastIndex);
  if (trailing.trim()) {
    tokens.push({ type: 'html', content: trailing });
  }

  const root: Block[] = [];
  
  interface ParserBlock extends Block {
      tempChildren?: Block[];
      isColumnWrapper?: boolean;
  }
  
  const stack: { type: string; block: ParserBlock }[] = [];

  for (const token of tokens) {
    if (token.type === 'tag') {
      if (isClosingTag(token.content)) {
        if (stack.length > 0) {
          const finished = stack.pop();
          
          if (stack.length === 0) {
            if (finished?.block && !finished.block.isColumnWrapper) {
                root.push(finished.block);
            }
          } else {
            const parent = stack[stack.length - 1];
            
            if (parent.type === 'columns') {
               if (finished && finished.block.isColumnWrapper) {
                   if (!parent.block.columns) parent.block.columns = [];
                   parent.block.columns.push(finished.block.tempChildren || []);
               }
            } else if (parent.type === 'column' || parent.type === 'column_wrapper') {
               if (finished?.block) {
                   if (!parent.block.tempChildren) parent.block.tempChildren = [];
                   parent.block.tempChildren.push(finished.block);
               }
            } else if (parent.type === 'cover_image') {
               // For cover blocks, we treat child content (usually a paragraph) as the title/content of the image block
               if (finished?.block && finished.block.content) {
                   parent.block.content = finished.block.content;
               }
            }
          }
        }
      } else {
        const wpType = getBlockType(token.content);
        if (!wpType) continue;

        const attrs = parseAttributes(token.content);
        const id = uuidv4();
        
        let newBlock: ParserBlock = { id, type: 'paragraph', content: '' };
        let nodeType = wpType;

        if (wpType === 'paragraph' || wpType === 'core/paragraph') {
          newBlock.type = 'paragraph';
        } else if (wpType === 'heading' || wpType === 'core/heading') {
          newBlock.type = attrs.level === 1 ? 'h1' : 'h2';
        } else if (wpType === 'image' || wpType === 'core/image') {
          newBlock.type = 'image';
          newBlock.metadata = {
             url: attrs.url || '',
             caption: attrs.caption || '',
             alt: attrs.alt || ''
          };
        } else if (wpType === 'cover' || wpType === 'core/cover') {
            newBlock.type = 'image';
            newBlock.metadata = {
                url: attrs.url || '',
                displayMode: 'background',
                overlayOpacity: attrs.dimRatio !== undefined ? attrs.dimRatio : 50,
                height: 'medium'
            };
            nodeType = 'cover_image';
        } else if (wpType === 'list' || wpType === 'core/list') {
          newBlock.type = attrs.ordered ? 'ol' : 'ul';
          newBlock.listItems = [];
        } else if (wpType === 'quote' || wpType === 'core/quote') {
          newBlock.type = 'blockquote';
        } else if (wpType === 'table' || wpType === 'core/table') {
          newBlock.type = 'table';
          newBlock.tableContent = []; 
        } else if (wpType === 'columns' || wpType === 'core/columns') {
           newBlock.type = 'layout';
           newBlock.columns = []; 
           nodeType = 'columns';
        } else if (wpType === 'column' || wpType === 'core/column') {
            newBlock = { id, type: 'layout', content: '', isColumnWrapper: true, tempChildren: [] }; 
            nodeType = 'column_wrapper';
        }

        stack.push({ type: nodeType, block: newBlock });
      }
    } else if (token.type === 'html') {
      if (stack.length > 0) {
        const current = stack[stack.length - 1];
        const html = token.content;
        
        if (current.block.isColumnWrapper) continue;

        if (['paragraph', 'h1', 'h2', 'blockquote'].includes(current.block.type)) {
           const doc = new DOMParser().parseFromString(html, 'text/html');
           current.block.content = doc.body.innerHTML.trim() || html.trim();
        } else if (['ul', 'ol'].includes(current.block.type)) {
           const doc = new DOMParser().parseFromString(html, 'text/html');
           const lis = doc.querySelectorAll('li');
           if (!current.block.listItems) current.block.listItems = [];
           lis.forEach(li => {
               if(current.block.listItems) current.block.listItems.push({ content: li.innerHTML, checked: false });
           });
        } else if (current.block.type === 'table') {
           const doc = new DOMParser().parseFromString(html, 'text/html');
           const rows = Array.from(doc.querySelectorAll('tr'));
           const tableData = rows.map(tr => {
               return Array.from(tr.querySelectorAll('td, th')).map(td => td.innerHTML);
           });
           if (tableData.length > 0) current.block.tableContent = tableData;
        } else if (['image', 'core/image', 'cover_image'].includes(current.type)) {
           // Robustly attempt to find image info in HTML if attributes were missing
           const doc = new DOMParser().parseFromString(html, 'text/html');
           const img = doc.querySelector('img');
           if (img) {
               const src = img.getAttribute('src') || img.src;
               const alt = img.getAttribute('alt') || '';
               const caption = doc.querySelector('figcaption')?.innerText || '';

               // Merge with existing metadata found in attributes
               current.block.metadata = {
                   ...current.block.metadata,
                   url: current.block.metadata?.url || src || '',
                   alt: current.block.metadata?.alt || alt,
                   caption: current.block.metadata?.caption || caption
               };
           }
        }
      }
    }
  }

  return root;
};