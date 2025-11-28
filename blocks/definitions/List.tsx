import { BlockDefinition } from '../types';
import { List, ListOrdered, CheckSquare } from 'lucide-react';
import { Block } from '../../types';
import { ListComponent } from '../../components/molecules/blocks/ListComponent';

const serializeList = (block: Block) => {
    const tagName = block.type === 'ol' ? 'ol' : 'ul';
    const listItems = block.listItems || [];
    const itemsHtml = listItems.map(i => `<li>${i.content}</li>`).join('');
    const isOrdered = block.type === 'ol';
    return `<!-- wp:list {"ordered":${isOrdered}} -->\n<${tagName}>${itemsHtml}</${tagName}>\n<!-- /wp:list -->`;
};

const getContext = (block: Block) => (block.listItems || []).map(i => `- ${i.content}`).join('\n');

const parseListHTML = (html: string): Partial<Block> => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const lis = Array.from(doc.querySelectorAll('li'));
        if (lis.length > 0) {
            const listItems = lis.map(li => ({
                content: li.innerHTML,
                checked: false
            }));
            return { content: html, listItems };
        }
    } catch (e) {
        console.error("Error parsing list replacement:", e);
    }
    return { content: html };
};

const createFactory = (type: 'ul' | 'ol' | 'check') => (id: string) => ({
    id,
    type,
    content: '',
    listItems: [{ content: '', checked: false }]
});

export const UnorderedListBlock: BlockDefinition = {
    type: 'ul',
    label: 'Bulleted List',
    icon: List,
    category: 'list',
    create: createFactory('ul'),
    Component: ListComponent,
    serializeToWordPress: serializeList,
    getContextString: getContext,
    parseHTML: parseListHTML
};

export const OrderedListBlock: BlockDefinition = {
    type: 'ol',
    label: 'Numbered List',
    icon: ListOrdered,
    category: 'list',
    create: createFactory('ol'),
    Component: ListComponent,
    serializeToWordPress: serializeList,
    getContextString: getContext,
    parseHTML: parseListHTML
};

export const CheckListBlock: BlockDefinition = {
    type: 'check',
    label: 'Check List',
    icon: CheckSquare,
    category: 'list',
    create: createFactory('check'),
    Component: ListComponent,
    serializeToWordPress: serializeList,
    getContextString: getContext,
    parseHTML: parseListHTML
};