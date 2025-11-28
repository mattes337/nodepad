import React from 'react';
import { Block, BlockType } from '../../types';
import { Settings2 } from 'lucide-react';
import { BLOCK_REGISTRY, getBlockDefinition } from '../../blocks/registry';

interface PropertiesPanelProps {
  selectedBlock: Block | null;
  onUpdateBlock: (id: string, content: string) => void;
  onUpdateMetadata: (id: string, metadata: any) => void;
  onChangeType: (id: string, type: BlockType) => void;
  onOpenImageBrowser?: (id: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedBlock,
  onUpdateBlock,
  onUpdateMetadata,
  onChangeType,
  onOpenImageBrowser
}) => {
  if (!selectedBlock) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
        <Settings2 className="w-12 h-12 mb-4 opacity-20 text-slate-500" />
        <p className="text-sm font-medium text-slate-600">No block selected</p>
        <p className="text-xs mt-1">Click on a block to edit its properties</p>
      </div>
    );
  }

  const renderTypeSelector = () => (
    <div className="mb-6">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Block Type</label>
      <div className="grid grid-cols-4 gap-2">
        {Object.values(BLOCK_REGISTRY).map((def) => (
          <button
            key={def.type}
            onClick={() => onChangeType(selectedBlock.id, def.type)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
              selectedBlock.type === def.type
                ? 'bg-brand-50 border-brand-400 text-brand-600 shadow-sm ring-2 ring-brand-500/10'
                : 'border-slate-200 bg-white/40 text-slate-500 hover:bg-white hover:text-slate-700'
            }`}
            title={def.label}
          >
            <def.icon className="w-4 h-4 mb-1" />
          </button>
        ))}
      </div>
    </div>
  );

  const definition = getBlockDefinition(selectedBlock.type);
  const PanelComponent = definition.PropertiesPanel;

  return (
    <div className="h-full overflow-y-auto bg-transparent p-4 custom-scrollbar">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200/60">
        <Settings2 className="w-4 h-4 text-brand-500" />
        <h3 className="font-semibold text-sm text-slate-700">Properties</h3>
      </div>

      {renderTypeSelector()}

      <div className="mb-6">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">
           {definition.label} Settings
        </label>
        {PanelComponent ? (
            <PanelComponent 
                block={selectedBlock}
                onUpdateBlock={onUpdateBlock}
                onUpdateMetadata={onUpdateMetadata}
                onChangeType={onChangeType}
                onOpenImageBrowser={onOpenImageBrowser}
            />
        ) : (
            <div className="text-xs text-slate-500 italic border border-dashed border-slate-200 rounded p-3 bg-slate-50/50">No specific properties for this block type.</div>
        )}
      </div>
      
      <div className="pt-4 border-t border-slate-200/60">
        <div className="text-[10px] text-slate-400 font-mono">
           Block ID: <span className="text-slate-600">{selectedBlock.id.split('-')[0]}...</span>
        </div>
      </div>
    </div>
  );
};