import React from 'react';
import { Block, BlockType } from '../types';

export interface BlockComponentProps {
    block: Block;
    activeBlockId: string | null;
    isDragging: boolean;
    readOnly?: boolean;
    onUpdate: (id: string, content: string, extra?: Partial<Block>) => void;
    onFocus: (id: string) => void;
    onDelete: (id: string) => void;
    onAddBlockAfter: (id: string, type: BlockType) => void;
    onChangeType: (id: string, type: BlockType) => void;
    onOpenAI: (id: string) => void;
    onDragStart: (id: string) => void;
    onDragEnd: () => void;
    onDrop: (id: string) => void;
    // Specific helpers passed by renderer
    autoFocus?: boolean;
    // Function to render nested blocks (avoids circular dependency imports)
    renderChild?: (block: Block) => React.ReactNode;
    onOpenImageBrowser?: (id: string) => void;
}

export interface BlockPropertiesProps {
    block: Block;
    onUpdateBlock: (id: string, content: string) => void;
    onUpdateMetadata: (id: string, metadata: any) => void;
    onChangeType: (id: string, type: BlockType) => void;
    onOpenImageBrowser?: (id: string) => void;
}

export interface BlockDefinition {
    type: BlockType;
    label: string;
    icon: React.ElementType;
    category: 'text' | 'list' | 'media' | 'layout' | 'data';
    
    // Factory method to create a new instance of this block
    create: (id: string) => Block;

    // The component rendered in the editor canvas
    Component: React.FC<BlockComponentProps>;

    // The component rendered in the side panel
    PropertiesPanel?: React.FC<BlockPropertiesProps>;

    // Logic for exporting to WordPress
    serializeToWordPress: (block: Block) => string;

    // Logic for AI Context
    getContextString: (block: Block) => string;

    // Optional: Parse HTML string into block data (for AI replacement or paste)
    parseHTML?: (html: string) => Partial<Block>;
}