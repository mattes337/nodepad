import { BlockDefinition } from '../types';
import { LayoutGrid } from 'lucide-react';
import { LayoutComponent } from '../../components/molecules/blocks/LayoutComponent';
import { LayoutProperties } from '../../components/molecules/properties/LayoutProperties';

export const LayoutBlock: BlockDefinition = {
    type: 'layout',
    label: 'Layout',
    icon: LayoutGrid,
    category: 'layout',
    create: (id) => ({ 
        id, 
        type: 'layout', 
        content: '', 
        columns: [[], []],
        metadata: { columnCount: 2 } 
    }),
    Component: LayoutComponent,
    PropertiesPanel: LayoutProperties,
    // Recursion handling for export needs to be done by the serializer calling this function
    serializeToWordPress: (block) => '', 
    getContextString: () => 'Layout Container',
};