import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Image as ImageIcon, X, Send, RefreshCw, Plus } from 'lucide-react';
import { Button } from '../atoms/Button';
import { ChatMessage } from '../molecules/ChatMessage';
import { ChatMessage as ChatMessageType, GalleryImage, AIService } from '../../types';

interface ImageBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (data: { url: string; filename: string, tags: string[] }) => void;
  galleryImages: GalleryImage[];
  aiService: AIService;
}

export const ImageBrowserModal: React.FC<ImageBrowserModalProps> = ({ 
    isOpen, 
    onClose, 
    onSelectImage,
    galleryImages,
    aiService
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'ai'>('gallery');
  const [searchQuery, setSearchQuery] = useState('');
  
  // AI State
  const [messages, setMessages] = useState<ChatMessageType[]>([
    { id: 'welcome', role: 'model', text: 'Describe the image you want to create.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (activeTab === 'ai') {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
  }, [messages, activeTab]);

  const filteredImages = galleryImages.filter(img => 
    searchQuery === '' || img.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSendAI = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessageType = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
        const imageUrl = await aiService.generateImage(input);
        
        const responseMsg: ChatMessageType = {
             id: Date.now().toString() + '_r',
             role: 'model',
             text: `I've generated an image for "${input}".`,
             timestamp: new Date()
        };
        
        setMessages(prev => [...prev, responseMsg]);
        
        setMessages(prev => [...prev, {
            id: Date.now().toString() + '_img',
            role: 'model',
            text: `IMG_RESULT:${imageUrl}`,
            timestamp: new Date()
        }]);

    } catch (error) {
        setMessages(prev => [...prev, { id: Date.now().toString() + '_err', role: 'model', text: "Sorry, I couldn't generate that image.", timestamp: new Date() }]);
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 ${!isOpen && 'hidden'}`}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col h-[80vh] overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex gap-4">
                <button 
                    onClick={() => setActiveTab('gallery')}
                    className={`flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'gallery' ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                >
                    <ImageIcon className="w-4 h-4" /> Gallery
                </button>
                <button 
                    onClick={() => setActiveTab('ai')}
                    className={`flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'ai' ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                >
                    <Sparkles className="w-4 h-4" /> AI Designer
                </button>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-slate-50 relative">
            {activeTab === 'gallery' && (
                <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-slate-200 bg-white">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search by tags (e.g. nature, tech)..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        {filteredImages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                                <p className="text-sm">No images found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredImages.map(img => {
                                    const isTransparent = img.tags.includes('transparent');
                                    return (
                                    <div 
                                        key={img.id} 
                                        className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-slate-200 hover:border-brand-500 hover:shadow-lg transition-all bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:8px_8px] bg-white"
                                        onClick={() => onSelectImage({ url: img.url, filename: img.filename, tags: img.tags })}
                                    >
                                        <img 
                                            src={img.thumbUrl || img.url} 
                                            alt={img.tags.join(', ')} 
                                            className={`w-full h-full ${isTransparent ? 'object-contain p-4' : 'object-cover'}`} 
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white font-medium text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Select</span>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end">
                                            <p className="text-white text-xs font-medium truncate mb-1 drop-shadow-md">{img.filename}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {img.tags.slice(0, 2).map(t => (
                                                    <span key={t} className="text-[10px] text-white/90 bg-white/20 px-1.5 py-0.5 rounded backdrop-blur-sm">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'ai' && (
                <div className="h-full flex flex-col bg-white">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                         {messages.map((msg) => {
                            if (msg.text.startsWith('IMG_RESULT:')) {
                                const url = msg.text.replace('IMG_RESULT:', '');
                                return (
                                    <div key={msg.id} className="flex justify-start animate-in fade-in slide-in-from-bottom-4">
                                        <div className="max-w-sm rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-slate-50">
                                            <img src={url} alt="AI Generated" className="w-full h-auto" />
                                            <div className="p-3 bg-white border-t border-slate-100 flex justify-end">
                                                <Button size="sm" onClick={() => onSelectImage({ url, filename: 'AI Generated Image', tags: ['ai-generated'] })} icon={Plus}>
                                                    Use Image
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return <ChatMessage key={msg.id} message={msg} />;
                        })}
                        {isProcessing && (
                             <div className="flex justify-start animate-pulse">
                                 <div className="bg-slate-100 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-3">
                                    <RefreshCw className="w-4 h-4 animate-spin text-brand-500" />
                                    <span className="text-xs text-slate-500 font-medium">Designing image...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 border-t border-slate-100 bg-slate-50">
                        <div className="relative max-w-3xl mx-auto">
                            <input 
                                type="text" 
                                placeholder="Describe what you want to see..."
                                className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none shadow-sm"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendAI()}
                            />
                            <button 
                                onClick={handleSendAI}
                                disabled={!input.trim() || isProcessing}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};