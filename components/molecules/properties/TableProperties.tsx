import React from 'react';
import { BlockPropertiesProps } from '../../../blocks/types';
import { PropertyField } from '../../molecules/PropertyField';

export const TableProperties: React.FC<BlockPropertiesProps> = ({ block, onUpdateMetadata }) => (
    <div className="space-y-4">
        <PropertyField
          label="Table Caption"
          placeholder="Table Caption..."
          value={block.metadata?.caption || ''}
          onChange={(e) => onUpdateMetadata(block.id, { caption: e.target.value })}
        />
    </div>
);