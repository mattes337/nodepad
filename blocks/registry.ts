import { BlockType } from '../types';
import { BlockDefinition } from './types';
import { ParagraphBlock } from './definitions/Paragraph';
import { H1Block, H2Block } from './definitions/Heading';
import { BlockquoteBlock } from './definitions/Blockquote';
import { ImageBlock } from './definitions/Image';
import { TableBlock } from './definitions/Table';
import { LayoutBlock } from './definitions/Layout';
import { UnorderedListBlock, OrderedListBlock, CheckListBlock } from './definitions/List';
import { LinkBlock } from './definitions/Link';

export const BLOCK_REGISTRY: Record<BlockType, BlockDefinition> = {
    paragraph: ParagraphBlock,
    h1: H1Block,
    h2: H2Block,
    blockquote: BlockquoteBlock,
    image: ImageBlock,
    table: TableBlock,
    layout: LayoutBlock,
    ul: UnorderedListBlock,
    ol: OrderedListBlock,
    check: CheckListBlock,
    link: LinkBlock,
};

export const getBlockDefinition = (type: BlockType): BlockDefinition => {
    return BLOCK_REGISTRY[type] || ParagraphBlock;
};

export const createBlock = (type: BlockType, id: string) => {
    return getBlockDefinition(type).create(id);
};