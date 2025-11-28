import { BlockDefinition } from '../types';
import { Quote } from 'lucide-react';
import { QuoteComponent } from '../../components/molecules/blocks/QuoteComponent';

export const BlockquoteBlock: BlockDefinition = {
    type: 'blockquote',
    label: 'Quote',
    icon: Quote,
    category: 'text',
    create: (id) => ({ id, type: 'blockquote', content: '' }),
    Component: QuoteComponent,
    serializeToWordPress: (block) => `<!-- wp:quote -->\n<blockquote class="wp-block-quote">${block.content}</blockquote>\n<!-- /wp:quote -->`,
    getContextString: (block) => `Quote: ${(block.content || '').replace(/<[^>]*>/g, ' ')}`,
};