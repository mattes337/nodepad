import React from 'react';
import { Block, BlockType, AIService, EditorType } from '../../types';
import { PropertiesPanel } from './PropertiesPanel';
import { AIPanel } from './AIPanel';
import { VariableTree } from '../molecules/VariableTree';
import { Settings2, Bot, Braces } from 'lucide-react';

interface SidebarRightProps {
  activeTab: 'properties' | 'ai' | 'variables';
  setActiveTab: (tab: 'properties' | 'ai' | 'variables') => void;
  selectedBlock: Block | null;
  allBlocks: Block[];
  onUpdateBlock: (id: string, content: string, extra?: Partial<Block>) => void;
  onUpdateBlockMetadata: (id: string, metadata: any) => void;
  onChangeType: (id: string, type: BlockType) => void;
  onAppendBlocks: (blocks: Block[]) => void;
  onReplaceBlocks: (blocks: Block[]) => void;
  onClearContext: () => void;
  onOpenImageBrowser?: (id: string) => void;
  aiService?: AIService;
  variableContext?: Record<string, any>;
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
  aiService,
  variableContext
}) => {
  return (
    <aside className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col z-40 shrink-0">
       <div className="flex border-b border-slate-200 bg-white">
          <button 
            onClick={() => setActiveTab('properties')}
            className={`flex-1 min-w-0 py-3 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                activeTab === 'properties' 
                ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/30' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-b-2 border-transparent'
            }`}
          >
              <Settings2 className="w-3.5 h-3.5 shrink-0" /> 
              <span className="truncate">Properties</span>
          </button>
          
          {variableContext && (
             <button 
                onClick={() => setActiveTab('variables')}
                className={`flex-1 min-w-0 py-3 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'variables' 
                    ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/30' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-b-2 border-transparent'
                }`}
             >
                  <Braces className="w-3.5 h-3.5 shrink-0" /> 
                  <span className="truncate">Variables</span>
             </button>
          )}

          {aiService && (
            <button 
                onClick={() => setActiveTab('ai')}
                className={`flex-1 min-w-0 py-3 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'ai' 
                    ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/30' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-b-2 border-transparent'
                }`}
            >
                <Bot className="w-3.5 h-3.5 shrink-0" /> 
                <span className="truncate">AI</span>
            </button>
          )}
       </div>

       <div className="flex-1 overflow-hidden relative">
           {activeTab === 'properties' && (
               <PropertiesPanel 
                    selectedBlock={selectedBlock}
                    onUpdateBlock={onUpdateBlock}
                    onUpdateMetadata={onUpdateBlockMetadata}
                    onChangeType={onChangeType}
                    onOpenImageBrowser={onOpenImageBrowser}
               />
           )}
           {activeTab === 'variables' && variableContext && (
               <div className="h-full flex flex-col">
                   <div className="p-4 border-b border-slate-200/60 flex items-center gap-2">
                       <Braces className="w-4 h-4 text-brand-500" />
                       <h3 className="font-semibold text-sm text-slate-700">Dynamic Variables</h3>
                   </div>
                   <div className="flex-1 overflow-y-auto custom-scrollbar">
                       <p className="text-xs text-slate-500 p-4 pb-0">Drag and drop variables into your content.</p>
                       <VariableTree data={variableContext} editorType={EditorType.HANDLEBARS} />
                   </div>
               </div>
           )}
           {activeTab === 'ai' && aiService && (
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