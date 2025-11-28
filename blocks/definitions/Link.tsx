import { BlockDefinition } from '../types';
import { Link as LinkIcon } from 'lucide-react';
import { LinkComponent } from '../../components/molecules/blocks/LinkComponent';
import { LinkProperties } from '../../components/molecules/properties/LinkProperties';

export const LinkBlock: BlockDefinition = {
    type: 'link',
    label: 'Link',
    icon: LinkIcon,
    category: 'text',
    create: (id) => ({ id, type: 'link', content: '' }),
    Component: LinkComponent,
    PropertiesPanel: LinkProperties,
    serializeToWordPress: (block) => {
        const url = block.metadata?.url || '#';
        const title = block.content || url;
        const desc = block.metadata?.description ? ` - ${block.metadata.description}` : '';
        return `<!-- wp:paragraph -->\n<p><a href="${url}">${title}</a>${desc}</p>\n<!-- /wp:paragraph -->`;
    },
    getContextString: (block) => `Link: ${block.content} (${block.metadata?.url})`,
};