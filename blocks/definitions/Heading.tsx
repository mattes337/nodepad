import React from 'react';
import { BlockDefinition, BlockComponentProps } from '../types';
import { Heading1, Heading2 } from 'lucide-react';
import { BaseHeadingComponent } from '../../components/molecules/blocks/BaseHeadingComponent';

const createHeadingComponent = (level: 1 | 2) => {
    return (props: BlockComponentProps) => <BaseHeadingComponent {...props} level={level} />;
};

export const H1Block: BlockDefinition = {
    type: 'h1',
    label: 'Heading 1',
    icon: Heading1,
    category: 'text',
    create: (id) => ({ id, type: 'h1', content: '' }),
    Component: createHeadingComponent(1),
    serializeToWordPress: (block) => `<!-- wp:heading {"level":1} -->\n<h1 class="wp-block-heading">${block.content}</h1>\n<!-- /wp:heading -->`,
    getContextString: (block) => `H1: ${(block.content || '').replace(/<[^>]*>/g, ' ')}`,
};

export const H2Block: BlockDefinition = {
    type: 'h2',
    label: 'Heading 2',
    icon: Heading2,
    category: 'text',
    create: (id) => ({ id, type: 'h2', content: '' }),
    Component: createHeadingComponent(2),
    serializeToWordPress: (block) => `<!-- wp:heading -->\n<h2 class="wp-block-heading">${block.content}</h2>\n<!-- /wp:heading -->`,
    getContextString: (block) => `H2: ${(block.content || '').replace(/<[^>]*>/g, ' ')}`,
};