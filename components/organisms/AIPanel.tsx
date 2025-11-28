import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Image as ImageIcon, RefreshCw, Wand2, X } from 'lucide-react';
import { Block, ChatMessage as ChatMessageType, AIService } from '../../types';
import { getBlockDefinition } from '../../blocks/registry';
import { ChatMessage } from '../molecules/ChatMessage';

interface AIPanelProps {
  selectedBlock: Block | null;
  allBlocks: Block[];
  onUpdateBlock: (id: string, content: string, extra?: Partial<Block>) => void;
  onUpdateBlockMetadata: (id: string, metadata: any) => void;
  onAppendBlocks: (blocks: Block[]) => void;
  onReplaceBlocks: (blocks: Block[]) => void;
  onClearContext: () => void;
  aiService: AIService;
}

export const AIPanel: React.FC<AIPanelProps> = ({
  selectedBlock,
  allBlocks,
  onUpdateBlock,
  onUpdateBlockMetadata,
  onAppendBlocks,
  onReplaceBlocks,
  onClearContext,
  aiService
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
        id: 'welcome',
        role: 'model',
        text: "Hi! I'm your NodePad assistant. I can help you write, edit, or generate images.",
        timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
      relatedBlockId: selectedBlock?.id
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      const isImageRequest = input.toLowerCase().match(/\b(image|picture|draw|photo)\b/i);

      if (isImageRequest && selectedBlock?.type === 'image') {
         const imageUrl = await aiService.generateImage(input);
         onUpdateBlockMetadata(selectedBlock.id, { url: imageUrl, prompt: input, alt: input });
         
         setMessages(prev => [...prev, {
             id: Date.now().toString(),
             role: 'model',
             text: "I am generating a new image for the selected block...",
             timestamp: new Date()
         }]);

      } else {
         const { intent, content, reply } = await aiService.processAIRequest(input, allBlocks, selectedBlock);
         
         setMessages(prev => [...prev, {
             id: Date.now().toString(),
             role: 'model',
             text: reply,
             timestamp: new Date()
         }]);

         if (intent === 'replaceBlock' && selectedBlock) {
             if (content) {
                 const definition = getBlockDefinition(selectedBlock.type);
                 if (definition.parseHTML) {
                     const updates = definition.parseHTML(content);
                     onUpdateBlock(selectedBlock.id, updates.content || content, updates);
                 } else {
                     onUpdateBlock(selectedBlock.id, content);
                 }
             }
         } else if (intent === 'appendArticle' || intent === 'replaceArticle') {
             if (content) {
                 const newBlocks = await aiService.transformToBlocks(content);
                 if (newBlocks && newBlocks.length > 0) {
                     if (intent === 'replaceArticle') {
                         onReplaceBlocks(newBlocks);
                     } else {
                         onAppendBlocks(newBlocks);
                     }
                     
                     setMessages(prev => [...prev, {
                         id: Date.now().toString(),
                         role: 'model',
                         text: intent === 'replaceArticle' 
                             ? `I have rewritten the document with ${newBlocks.length} new blocks.`
                             : `I have added ${newBlocks.length} new blocks.`,
                         timestamp: new Date()
                     }]);
                 } else {
                      setMessages(prev => [...prev, {
                         id: Date.now().toString(),
                         role: 'model',
                         text: "I generated the content but failed to convert it into document blocks. Please try a simpler request.",
                         timestamp: new Date()
                     }]);
                 }
             }
         }
      }

    } catch (error) {
        console.error("[AIPanel] Processing Error:", error);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: "I encountered an error processing that request.",
            timestamp: new Date()
        }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      <div className="flex items-center justify-between p-4 border-b border-slate-200/60">
        <div className="flex items-center gap-2 text-brand-600">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold text-sm">AI Assistant</h3>
        </div>
      </div>

      {selectedBlock && (
          <div className="px-4 py-2 bg-brand-50 border-b border-brand-100 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-1 text-xs text-brand-700">
                  <span className="font-medium shrink-0 opacity-70">Context:</span>
                  <span className="font-mono text-brand-600">{selectedBlock.type}</span>
                  {selectedBlock.type === 'image' ? <ImageIcon className="w-3 h-3 ml-1"/> : <Wand2 className="w-3 h-3 ml-1"/>}
              </div>
              <button 
                onClick={onClearContext} 
                className="p-1 hover:bg-brand-100 rounded-full text-brand-400 hover:text-brand-700 transition-colors"
              >
                  <X className="w-3 h-3" />
              </button>
          </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
        ))}
        {isProcessing && (
            <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-3 py-2 shadow-sm flex items-center gap-2">
                    <RefreshCw className="w-3 h-3 animate-spin text-brand-500" />
                    <span className="text-[10px] text-slate-400">Thinking...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-slate-200/60 bg-white/50 backdrop-blur-md">
          <div className="relative group">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder={selectedBlock ? "Ask to edit selected block..." : "Ask to write, add, or change..."}
                className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-3 pr-10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none text-slate-700 placeholder-slate-400 transition-all shadow-inner"
                rows={2}
            />
            <button 
                onClick={handleSend}
                disabled={isProcessing || !input.trim()}
                className="absolute right-2 bottom-2 p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-500 shadow-sm shadow-brand-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all disabled:shadow-none"
            >
                <Send className="w-3 h-3" />
            </button>
          </div>
      </div>
    </div>
  );
};
