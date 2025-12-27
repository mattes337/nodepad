import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Block, BlockType, User, NodePadDocument, GalleryImage, AIService } from '../types';
import { createBlock, getBlockDefinition } from '../blocks/registry';
import { generateEmailHTML } from '../services/emailRenderer';
import { Button } from './atoms/Button';
import { Code, Download, Eye, Edit3, Settings, Sparkles, Upload, Save } from 'lucide-react';

// Templates
import { MainLayout } from './templates/MainLayout';

// Organisms
import { Header } from './organisms/Header';
import { SidebarLeft } from './organisms/SidebarLeft';
import { SidebarRight } from './organisms/SidebarRight';
import { EditorCanvas } from './organisms/EditorCanvas';
import { ImportModal } from './organisms/ImportModal';
import { ImageBrowserModal } from './organisms/ImageBrowserModal';
import { DocumentSettingsModal } from './organisms/DocumentSettingsModal';
import { Modal } from './molecules/Modal';
import { Avatar } from './atoms/Avatar';

// Logic Helpers
import { 
  findBlockRecursive, 
  updateBlockRecursive, 
  deleteBlockRecursive, 
  addBlockRecursive, 
  moveBlockInStructure, 
  removeBlockFromTree, 
  insertBlockInTree 
} from '../utils/blockUtils';

export interface EmailEditorProps {
    initialBlocks?: Block[];
    user?: User;
    activeUsers?: User[];
    galleryImages?: GalleryImage[];
    aiService?: AIService;
    onSave?: (doc: NodePadDocument) => void;
    onLoadClick?: () => void;
}

export interface EmailEditorRef {
    setBlocks: (blocks: Block[]) => void;
    getBlocks: () => Block[];
}

const DEFAULT_USER: User = { id: 'u1', name: 'You', color: '#3b82f6', avatarUrl: 'https://picsum.photos/32/32' };

const INITIAL_BLOCKS: Block[] = [
    { id: '1', type: 'h1', content: 'Hi {{ recipient.firstName }},' },
    { id: '2', type: 'paragraph', content: 'Here are the updates for this week.' },
];

const DEFAULT_EMAIL_CONTEXT = {
  recipient: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    role: "Subscriber",
    preferences: {
       weeklyDigest: true,
       promotions: false
    }
  },
  company: {
    name: "Acme Corp",
    website: "https://acme.com",
    address: "123 Innovation Dr, San Francisco, CA"
  },
  campaign: {
    id: "camp_12345",
    name: "Winter Newsletter"
  },
  currentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
};

export const EmailEditor = forwardRef<EmailEditorRef, EmailEditorProps>(({
    initialBlocks,
    user = DEFAULT_USER,
    activeUsers = [DEFAULT_USER],
    galleryImages = [],
    aiService,
    onSave,
    onLoadClick
}, ref) => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks || INITIAL_BLOCKS);
  const [emailContext, setEmailContext] = useState<Record<string, any>>(DEFAULT_EMAIL_CONTEXT);
  
  // Metadata State
  const [docMetadata, setDocMetadata] = useState<NodePadDocument['metadata']>({
      title: 'Weekly Newsletter',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      authorId: user.id
  });

  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [draggedType, setDraggedType] = useState<BlockType | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImageBrowserOpen, setIsImageBrowserOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [targetImageBlockId, setTargetImageBlockId] = useState<string | null>(null);
  
  const [rightSidebarTab, setRightSidebarTab] = useState<'properties' | 'ai' | 'variables'>('properties');
  
  const activeBlock = activeBlockId ? findBlockRecursive(blocks, activeBlockId) : null;

  useImperativeHandle(ref, () => ({
    setBlocks: (newBlocks: Block[]) => setBlocks(newBlocks),
    getBlocks: () => blocks
  }));

  useEffect(() => {
      if (initialBlocks) setBlocks(initialBlocks);
  }, [initialBlocks]);

  const updateBlock = (id: string, content: string, extra?: Partial<Block>) => {
    setBlocks(prev => updateBlockRecursive(prev, id, b => ({ ...b, content, ...extra })));
  };

  const updateBlockMetadata = (id: string, metadata: any) => {
    setBlocks(prev => updateBlockRecursive(prev, id, b => ({ ...b, metadata: { ...b.metadata, ...metadata } })));
  };

  const changeBlockType = (id: string, type: BlockType) => {
    setBlocks(prev => updateBlockRecursive(prev, id, b => {
        const newDef = getBlockDefinition(type);
        const tempBlock = createBlock(type, b.id);
        return { 
            ...tempBlock, 
            id: b.id,
            content: b.content, 
        };
    }));
  };

  const addBlock = (afterId: string, type: BlockType) => {
    const newBlock = createBlock(type, uuidv4());
    setBlocks(prev => {
        if (afterId === '__END__' || prev.length === 0) {
            return [...prev, newBlock];
        }
        return addBlockRecursive(prev, afterId, newBlock);
    });
    requestAnimationFrame(() => setActiveBlockId(newBlock.id));
  };

  const deleteBlock = (id: string) => {
    setBlocks(prev => deleteBlockRecursive(prev, id));
    if (activeBlockId === id) setActiveBlockId(null);
  };

  const handleFocus = (id: string) => {
    setActiveBlockId(id);
  };

  const openAIForBlock = (id: string) => {
    setActiveBlockId(id);
    setRightSidebarTab('ai');
  };

  const handleOpenImageBrowser = (id: string) => {
      setTargetImageBlockId(id);
      setIsImageBrowserOpen(true);
  };

  const handleSelectImage = (data: { url: string; filename: string, tags: string[] }) => {
      if (targetImageBlockId) {
          updateBlockMetadata(targetImageBlockId, { url: data.url, filename: data.filename, tags: data.tags});
      }
      setIsImageBrowserOpen(false);
      setTargetImageBlockId(null);
  };

  // Drag and drop same as Article Editor
  const handleDragStart = (id: string) => {
    setDraggedBlockId(id);
    setDraggedType(null);
  };

  const handleDragStartType = (type: BlockType) => {
      setDraggedType(type);
      setDraggedBlockId(null);
  }

  const handleDragEnd = () => {
    setDraggedBlockId(null);
    setDraggedType(null);
  };

  const handleDrop = (targetId: string) => {
    const isCanvasBottom = targetId === '__CANVAS_BOTTOM__';

    if (draggedBlockId) {
        if (isCanvasBottom) {
             const { block: movedBlock, newBlocks: tempBlocks } = removeBlockFromTree(blocks, draggedBlockId);
             if (movedBlock) {
                 setBlocks([...tempBlocks, movedBlock]);
             }
        } else if (draggedBlockId !== targetId) {
            const { block: movedBlock, newBlocks: tempBlocks } = removeBlockFromTree(blocks, draggedBlockId);
            if (movedBlock) {
                const finalBlocks = insertBlockInTree(tempBlocks, targetId, 'top', movedBlock);
                setBlocks(finalBlocks);
            }
        }
    }
    
    if (draggedType) {
        const newBlock = createBlock(draggedType, uuidv4());
        if (isCanvasBottom) {
             setBlocks(prev => [...prev, newBlock]);
        } else {
             const finalBlocks = insertBlockInTree(blocks, targetId, 'top', newBlock);
             setBlocks(finalBlocks);
        }
        requestAnimationFrame(() => setActiveBlockId(newBlock.id));
    }

    setDraggedBlockId(null);
    setDraggedType(null);
  };

  const handleNavigatorMove = (draggedId: string, targetId: string, position: 'top' | 'bottom' | 'inside') => {
      if (draggedId === targetId) return;
      const { block: movedBlock, newBlocks: tempBlocks } = removeBlockFromTree(blocks, draggedId);
      if (movedBlock) {
          const finalBlocks = insertBlockInTree(tempBlocks, targetId, position, movedBlock);
          setBlocks(finalBlocks);
      }
  };

  const moveBlock = (direction: 'up' | 'down') => {
      if(!activeBlockId) return;
      setBlocks(prev => moveBlockInStructure(prev, activeBlockId, direction));
  }
  
  const handleSave = () => {
    const doc: NodePadDocument = {
        schemaVersion: '1.0',
        metadata: {
            ...docMetadata,
            modified: new Date().toISOString(),
        },
        blocks: blocks
    };
    if (onSave) onSave(doc);
  }

  const handleDownloadHtml = () => {
      const html = generateEmailHTML(blocks, { title: docMetadata.title, preheader: docMetadata.preheader }, emailContext);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'email-template.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  return (
      <MainLayout 
        modals={
            <>
                <ImportModal 
                    isOpen={isImportModalOpen} 
                    onClose={() => setIsImportModalOpen(false)}
                    onImport={setBlocks}
                    aiService={aiService}
                    variableContext={emailContext}
                />
                <ImageBrowserModal
                    isOpen={isImageBrowserOpen}
                    onClose={() => setIsImageBrowserOpen(false)}
                    onSelectImage={handleSelectImage}
                    galleryImages={galleryImages}
                    aiService={aiService!}
                />
                <DocumentSettingsModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    metadata={docMetadata}
                    onChange={(meta) => setDocMetadata(prev => ({ ...prev, ...meta }))}
                    mode="email"
                    context={emailContext}
                    onContextChange={setEmailContext}
                />
                <Modal 
                    isOpen={isExportOpen} 
                    onClose={() => setIsExportOpen(false)}
                    title="Export HTML Email"
                    icon={Code}
                    footer={
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => setIsExportOpen(false)}>Close</Button>
                            <Button variant="primary" icon={Download} onClick={handleDownloadHtml}>Download HTML</Button>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500">
                            This HTML includes interpolated variables based on the mock context.
                        </p>
                        <textarea 
                            className="w-full h-64 font-mono text-xs p-4 bg-slate-900 text-blue-100 rounded-xl"
                            readOnly
                            value={generateEmailHTML(blocks, { title: docMetadata.title, preheader: docMetadata.preheader }, emailContext)}
                        />
                    </div>
                </Modal>
            </>
        }
        header={
            <Header 
                activeUsers={activeUsers}
                isPreview={isPreview}
                onTogglePreview={() => setIsPreview(!isPreview)}
                onImportAI={() => setIsImportModalOpen(true)}
                onImportWP={() => {}}
                onLoad={() => onLoadClick && onLoadClick()}
                onSave={handleSave}
                onSettings={() => setIsSettingsOpen(true)}
                hasAI={!!aiService}
            />
        }
        leftSidebar={
            !isPreview && (
                <SidebarLeft 
                    blocks={blocks}
                    activeBlockId={activeBlockId}
                    draggedBlockId={draggedBlockId}
                    onSelectBlock={(id) => {
                        setActiveBlockId(id);
                        document.getElementById(`block-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    onMoveBlock={handleNavigatorMove}
                    onDragStartType={handleDragStartType}
                    onDragEnd={handleDragEnd}
                />
            )
        }
        center={
            isPreview ? (
                 <div className="w-full h-full bg-slate-100 flex justify-center py-8 overflow-y-auto">
                    <iframe 
                        srcDoc={generateEmailHTML(blocks, { title: docMetadata.title, preheader: docMetadata.preheader }, emailContext)} 
                        className="w-[600px] h-full bg-white shadow-lg rounded-md" 
                        title="Email Preview"
                        sandbox="allow-same-origin"
                    />
                </div>
            ) : (
                <EditorCanvas 
                    blocks={blocks}
                    activeBlockId={activeBlockId}
                    draggedBlockId={draggedBlockId}
                    onUpdateBlock={updateBlock}
                    onFocus={handleFocus}
                    onDelete={deleteBlock}
                    onAddBlockAfter={addBlock}
                    onChangeType={changeBlockType}
                    onOpenAI={openAIForBlock}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDrop={handleDrop}
                    moveBlock={moveBlock}
                    onOpenImageBrowser={handleOpenImageBrowser}
                />
            )
        }
        rightSidebar={
            !isPreview && (
                <SidebarRight 
                    activeTab={rightSidebarTab}
                    setActiveTab={setRightSidebarTab}
                    selectedBlock={activeBlock}
                    allBlocks={blocks}
                    onUpdateBlock={updateBlock}
                    onUpdateBlockMetadata={updateBlockMetadata}
                    onChangeType={changeBlockType}
                    onAppendBlocks={(b) => setBlocks(prev => [...prev, ...b])}
                    onReplaceBlocks={setBlocks}
                    onClearContext={() => setActiveBlockId(null)}
                    onOpenImageBrowser={handleOpenImageBrowser}
                    aiService={aiService}
                    variableContext={emailContext}
                />
            )
        }
      />
  );
});