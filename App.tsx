import React, { useRef, useState } from 'react';
import { ArticleEditor, ArticleEditorRef } from './components/ArticleEditor';
import { EmailEditor, EmailEditorRef } from './components/EmailEditor';
import { NodePadDocument, User, GalleryImage, AIService, Block } from './types';
import { generateImage, processAIRequest, transformToBlocks, analyzeBlock } from './services/gemini';
import { FileText, Mail } from 'lucide-react';

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

const INITIAL_ARTICLE_BLOCKS: Block[] = [
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

const INITIAL_EMAIL_BLOCKS: Block[] = [
    { id: 'e1', type: 'image', content: '', metadata: { url: 'https://picsum.photos/600/200', alt: 'Banner' } },
    { id: 'e2', type: 'h1', content: 'Weekly Update' },
    { id: 'e3', type: 'paragraph', content: 'Hello Team,<br>Here are the updates for this week.' },
    { id: 'e4', type: 'link', content: 'View Full Report', metadata: { url: 'https://example.com' } }
];

const App: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const articleRef = useRef<ArticleEditorRef>(null);
  const emailRef = useRef<EmailEditorRef>(null);
  
  const [editorMode, setEditorMode] = useState<'article' | 'email'>('article');

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
                  if (editorMode === 'article') {
                      articleRef.current?.setBlocks(parsed.blocks);
                  } else {
                      emailRef.current?.setBlocks(parsed.blocks);
                  }
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

  return (
    <div className="h-screen flex flex-col bg-slate-50">
        {/* Top Navigation Bar - Mode Switcher */}
        <div className="flex justify-center items-center gap-4 p-2 bg-slate-900 border-b border-slate-800 shrink-0 shadow-md z-50">
            <button
                onClick={() => setEditorMode('article')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    editorMode === 'article' 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20 ring-1 ring-white/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
                <FileText className="w-4 h-4" />
                Article Editor
            </button>
            <button
                onClick={() => setEditorMode('email')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    editorMode === 'email' 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20 ring-1 ring-white/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
                <Mail className="w-4 h-4" />
                Email Editor
            </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
            {editorMode === 'article' ? (
                <ArticleEditor
                    ref={articleRef}
                    initialBlocks={INITIAL_ARTICLE_BLOCKS}
                    user={MOCK_USERS[0]}
                    activeUsers={MOCK_USERS}
                    galleryImages={GALLERY_IMAGES}
                    aiService={aiService}
                    onSave={handleSave}
                    onLoadClick={handleLoadClick}
                />
            ) : (
                <EmailEditor
                    ref={emailRef}
                    initialBlocks={INITIAL_EMAIL_BLOCKS}
                    user={MOCK_USERS[0]}
                    activeUsers={MOCK_USERS}
                    galleryImages={GALLERY_IMAGES}
                    aiService={aiService}
                    onSave={handleSave}
                    onLoadClick={handleLoadClick}
                />
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