import React, { useRef, useState } from 'react';
import { NodePad, NodePadRef } from './components/NodePad';
import { NodePadView } from './components/NodePadView';
import { NodePadDocument, User, GalleryImage, AIService, Block } from './types';
import { generateImage, processAIRequest, transformToBlocks, analyzeBlock } from './services/gemini';

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'You', color: '#3b82f6', avatarUrl: 'https://picsum.photos/32/32' },
  { id: 'u2', name: 'Sarah', color: '#10b981', avatarUrl: 'https://picsum.photos/32/32?random=1' },
  { id: 'u3', name: 'Mike', color: '#f59e0b', avatarUrl: 'https://picsum.photos/32/32?random=2' },
];

const GALLERY_IMAGES: GalleryImage[] = [
  { id: 'g1', filename: 'forest.jpg', url: 'https://picsum.photos/id/10/800/600', tags: ['nature', 'forest', 'trees', 'landscape'] },
  { id: 'g2', filename: 'workspace.jpg', url: 'https://picsum.photos/id/20/800/600', tags: ['work', 'desk', 'laptop', 'office', 'tech'] },
  { id: 'g3', filename: 'coffee-cup.jpg', url: 'https://picsum.photos/id/30/800/600', tags: ['coffee', 'mug', 'drink', 'morning'] },
  { id: 'g4', filename: 'cute-cat.jpg', url: 'https://picsum.photos/id/40/800/600', tags: ['cat', 'animal', 'pet', 'cute'] },
  { id: 'g5', filename: 'city-building.jpg', url: 'https://picsum.photos/id/50/800/600', tags: ['city', 'architecture', 'urban', 'building'] },
  { id: 'g6', filename: 'modern-office.jpg', url: 'https://picsum.photos/id/60/800/600', tags: ['office', 'computer', 'business', 'workspace'] },
  { id: 'g7', filename: 'blue-sky.jpg', url: 'https://picsum.photos/id/70/800/600', tags: ['sky', 'clouds', 'blue', 'nature'] },
  { id: 'g8', filename: 'mountain-hike.jpg', url: 'https://picsum.photos/id/80/800/600', tags: ['mountain', 'hiking', 'outdoor', 'travel'] },
];

const INITIAL_BLOCKS: Block[] = [
  { id: '1', type: 'h1', content: 'The Future of Generative AI' },
  { id: '2', type: 'paragraph', content: 'Artificial intelligence has evolved rapidly in recent years.' },
  { 
      id: '3-layout', 
      type: 'layout', 
      content: '', 
      metadata: { columnCount: 2 },
      columns: [
          [
              { id: '3-1', type: 'paragraph', content: '<b>Column 1</b><br/>This is a nested block inside a 2-column layout.' }
          ],
          [
              { id: '3-2', type: 'image', content: '', metadata: { url: 'https://picsum.photos/400/200', alt: 'Demo' } }
          ]
      ]
  },
  { id: '4', type: 'paragraph', content: 'With tools like Gemini, we can now augment human creativity in unprecedented ways.' },
];

const App: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nodePadRef = useRef<NodePadRef>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'viewer'>('editor');
  const [currentBlocks, setCurrentBlocks] = useState<Block[]>(INITIAL_BLOCKS);

  const aiService: AIService = {
    generateImage,
    processAIRequest,
    transformToBlocks,
    analyzeBlock
  };

  const handleSave = (doc: NodePadDocument) => {
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.metadata.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const content = e.target?.result as string;
              const parsed = JSON.parse(content) as NodePadDocument;
              
              if (parsed && Array.isArray(parsed.blocks)) {
                  nodePadRef.current?.setBlocks(parsed.blocks);
                  if (fileInputRef.current) fileInputRef.current.value = '';
              } else {
                  alert('Invalid file format: Missing blocks array.');
              }
          } catch (err) {
              console.error('Error parsing file:', err);
              alert('Failed to parse file. Please ensure it is a valid JSON NodePad file.');
          }
      };
      reader.readAsText(file);
  };

  const handleViewChange = (mode: 'editor' | 'viewer') => {
      if (mode === 'viewer' && nodePadRef.current) {
          // Capture current state from editor before switching
          setCurrentBlocks(nodePadRef.current.getBlocks());
      }
      setViewMode(mode);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
        {/* Top Navigation Bar */}
        <div className="flex justify-center items-center gap-4 p-2 bg-white border-b border-slate-200 shrink-0 shadow-sm z-50">
            <button
                onClick={() => handleViewChange('editor')}
                className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${
                    viewMode === 'editor' 
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
            >
                Editor
            </button>
            <button
                onClick={() => handleViewChange('viewer')}
                className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${
                    viewMode === 'viewer' 
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
            >
                Viewer
            </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
            {/* Editor View - Kept mounted to preserve internal state/undo history */}
            <div className={`h-full w-full ${viewMode === 'editor' ? 'block' : 'hidden'}`}>
                <NodePad
                    ref={nodePadRef}
                    initialBlocks={INITIAL_BLOCKS}
                    user={MOCK_USERS[0]}
                    activeUsers={MOCK_USERS}
                    galleryImages={GALLERY_IMAGES}
                    aiService={aiService}
                    onSave={handleSave}
                    onLoadClick={handleLoadClick}
                />
            </div>

            {/* Viewer View */}
            {viewMode === 'viewer' && (
                <div className="h-full w-full overflow-y-auto bg-white animate-in fade-in duration-300">
                    <NodePadView 
                        blocks={currentBlocks}
                        user={MOCK_USERS[0]}
                    />
                </div>
            )}
        </div>

        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".json" 
            onChange={handleFileChange}
        />
    </div>
  );
};

export default App;