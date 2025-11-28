import { BlockDefinition } from '../types';
import { AlignLeft } from 'lucide-react';
import { ParagraphComponent } from '../../components/molecules/blocks/ParagraphComponent';
import { ParagraphProperties } from '../../components/molecules/properties/ParagraphProperties';

export const ParagraphBlock: BlockDefinition = {
    type: 'paragraph',
    label: 'Text',
    icon: AlignLeft,
    category: 'text',
    create: (id) => ({ id, type: 'paragraph', content: '' }),
    Component: ParagraphComponent,
    PropertiesPanel: ParagraphProperties,
    serializeToWordPress: (block) => `<!-- wp:paragraph -->\n<p>${block.content}</p>\n<!-- /wp:paragraph -->`,
    getContextString: (block) => (block.content || '').replace(/<[^>]*>/g, ' '),
};