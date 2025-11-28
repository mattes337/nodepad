import React from 'react';
import { Block, BlockType, AIService } from '../../types';
import { PropertiesPanel } from './PropertiesPanel';
import { AIPanel } from './AIPanel';
import { Settings2, Bot } from 'lucide-react';

interface SidebarRightProps {
  activeTab: 'properties' | 'ai';
  setActiveTab: (tab: 'properties' | 'ai') => void;
  selectedBlock: Block | null;
  allBlocks: Block[];
  onUpdateBlock: (id: string, content: string, extra?: Partial<Block>) => void;
  onUpdateBlockMetadata: (id: string, metadata: any) => void;
  onChangeType: (id: string, type: BlockType) => void;
  onAppendBlocks: (blocks: Block[]) => void;
  onReplaceBlocks: (blocks: Block[]) => void;
  onClearContext: () => void;
  onOpenImageBrowser?: (id: string) => void;
  aiService: AIService;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({
  activeTab,
  setActiveTab,
  selectedBlock,
  allBlocks,
  onUpdateBlock,
  onUpdateBlockMetadata,
  onChangeType,
  onAppendBlocks,
  onReplaceBlocks,
  onClearContext,
  onOpenImageBrowser,
  aiService
}) => {
  return (
    <aside className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col z-40 shrink-0">
       <div className="flex border-b border-slate-200 bg-white">
          <button 
            onClick={() => setActiveTab('properties')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${
                activeTab === 'properties' 
                ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/30' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-b-2 border-transparent'
            }`}
          >
              <Settings2 className="w-4 h-4" /> Properties
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${
                activeTab === 'ai' 
                ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/30' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-b-2 border-transparent'
            }`}
          >
              <Bot className="w-4 h-4" /> AI Assistant
          </button>
       </div>

       <div className="flex-1 overflow-hidden relative">
           {activeTab === 'properties' ? (
               <PropertiesPanel 
                    selectedBlock={selectedBlock}
                    onUpdateBlock={onUpdateBlock}
                    onUpdateMetadata={onUpdateBlockMetadata}
                    onChangeType={onChangeType}
                    onOpenImageBrowser={onOpenImageBrowser}
               />
           ) : (
               <AIPanel 
                    selectedBlock={selectedBlock} 
                    allBlocks={allBlocks}
                    onUpdateBlock={onUpdateBlock}
                    onUpdateBlockMetadata={onUpdateBlockMetadata}
                    onAppendBlocks={onAppendBlocks}
                    onReplaceBlocks={onReplaceBlocks}
                    onClearContext={onClearContext}
                    aiService={aiService}
               />
           )}
       </div>
    </aside>
  );
};
