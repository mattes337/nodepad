import React from 'react';
import { BlockPropertiesProps } from '../../../blocks/types';
import { PropertyField } from '../../molecules/PropertyField';

export const LinkProperties: React.FC<BlockPropertiesProps> = ({ block, onUpdateBlock, onUpdateMetadata }) => (
    <div className="space-y-4">
      <PropertyField
        label="URL"
        placeholder="https://example.com"
        value={block.metadata?.url || ''}
        onChange={(e) => onUpdateMetadata(block.id, { url: e.target.value })}
      />
      <PropertyField
        label="Title (Content)"
        placeholder="Link Title"
        value={block.content || ''}
        onChange={(e) => onUpdateBlock(block.id, e.target.value)}
      />
      <PropertyField
        label="Description"
        placeholder="Optional description"
        value={block.metadata?.description || ''}
        onChange={(e) => onUpdateMetadata(block.id, { description: e.target.value })}
      />
    </div>
);