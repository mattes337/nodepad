import React, { useState, useImperativeHandle, forwardRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Block, BlockType, User, NodePadDocument, GalleryImage, AIService } from '../types';
import { createBlock, getBlockDefinition } from '../blocks/registry';

// Templates
import { MainLayout } from './templates/MainLayout';

// Organisms
import { Header } from './organisms/Header';
import { SidebarLeft } from './organisms/SidebarLeft';
import { SidebarRight } from './organisms/SidebarRight';
import { EditorCanvas } from './organisms/EditorCanvas';
import { ImportModal } from './organisms/ImportModal';
import { WordPressModal } from './organisms/WordPressModal';
import { ImageBrowserModal } from './organisms/ImageBrowserModal';
import { DocumentSettingsModal } from './organisms/DocumentSettingsModal';
import { ArticleEditorView } from './ArticleEditorView';

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

export interface ArticleEditorProps {
    initialBlocks?: Block[];
    user?: User;
    activeUsers?: User[];
    galleryImages?: GalleryImage[];
    aiService: AIService;
    onSave?: (doc: NodePadDocument) => void;
    onLoadClick?: () => void;
}

export interface ArticleEditorRef {
    setBlocks: (blocks: Block[]) => void;
    getBlocks: () => Block[];
}

const DEFAULT_USER: User = { id: 'u1', name: 'You', color: '#3b82f6', avatarUrl: 'https://picsum.photos/32/32' };

const INITIAL_BLOCKS: Block[] = [
    { id: '1', type: 'h1', content: 'Welcome to Article Editor' },
    { id: '2', type: 'paragraph', content: 'Start typing your article or use the AI assistant.' },
];

export const ArticleEditor = forwardRef<ArticleEditorRef, ArticleEditorProps>(({
    initialBlocks,
    user = DEFAULT_USER,
    activeUsers = [DEFAULT_USER],
    galleryImages = [],
    aiService,
    onSave,
    onLoadClick
}, ref) => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks || INITIAL_BLOCKS);
  
  // Metadata State
  const [docMetadata, setDocMetadata] = useState<NodePadDocument['metadata']>({
      title: 'Untitled Article',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      authorId: user.id
  });

  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [draggedType, setDraggedType] = useState<BlockType | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isWordPressModalOpen, setIsWordPressModalOpen] = useState(false);
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
      if (initialBlocks) {
          setBlocks(initialBlocks);
          // Try to infer title from first H1 if available and title is default
          const h1 = initialBlocks.find(b => b.type === 'h1');
          if (h1 && docMetadata.title === 'Untitled Article') {
              setDocMetadata(prev => ({ ...prev, title: h1.content.replace(/<[^>]*>?/gm, '') }));
          }
      }
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
        const oldDef = getBlockDefinition(b.type);
        const tempBlock = createBlock(type, b.id);
        
        let newContent = b.content;
        let newListItems = b.listItems;
        
        const isNewTypeAList = newDef.category === 'list';
        const wasList = oldDef.category === 'list';

        if (isNewTypeAList && !wasList) {
            newListItems = [{ content: b.content, checked: false }];
        } 
        else if (!isNewTypeAList && wasList) {
            newContent = b.listItems ? b.listItems.map(i => i.content).join('<br>') : b.content;
            newListItems = undefined;
        }
        if (oldDef.category === 'media' && newDef.category !== 'media') {
             newContent = '';
             if (isNewTypeAList) newListItems = [{ content: '', checked: false }];
        }

        return { 
            ...tempBlock, 
            id: b.id,
            content: newContent, 
            listItems: newListItems,
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

  const appendBlocks = (newBlocks: Block[]) => {
      setBlocks(prev => [...prev, ...newBlocks]);
      if(newBlocks.length > 0) {
          requestAnimationFrame(() => setActiveBlockId(newBlocks[newBlocks.length - 1].id));
      }
  };
  
  const replaceBlocks = (newBlocks: Block[]) => {
      setBlocks(newBlocks);
      if(newBlocks.length > 0) {
          requestAnimationFrame(() => setActiveBlockId(newBlocks[0].id));
      }
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

  const handleSave = () => {
    const doc: NodePadDocument = {
        schemaVersion: '1.0',
        metadata: {
            ...docMetadata,
            modified: new Date().toISOString(),
        },
        blocks: blocks
    };
    
    if (onSave) {
        onSave(doc);
    }
  };

  const handlePrint = useCallback(() => {
    // Attempt to focus the current window
    window.focus();
    // Wrap in a timeout to ensure browser handles it as a clean user-triggered event
    setTimeout(() => {
        try {
            window.print();
        } catch (e) {
            console.warn("Automated printing might be blocked by environment sandbox. You can still use browser print (Cmd+P / Ctrl+P).", e);
        }
    }, 200);
  }, []);

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
      
      let checkTargetId = targetId;
      if (targetId.includes('_col_')) {
          checkTargetId = targetId.split('_col_')[0];
          if (checkTargetId === draggedId) return;
      }

      const draggedBlock = findBlockRecursive(blocks, draggedId);
      
      if (draggedBlock && draggedBlock.columns) {
           for (const col of draggedBlock.columns) {
               if (findBlockRecursive(col, checkTargetId)) {
                   return; 
               }
           }
      }

      if (targetId.startsWith(draggedId) && targetId !== draggedId && !targetId.includes('_col_')) return; 

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

  const handleAIImport = (importedBlocks: Block[]) => {
      setBlocks(importedBlocks);
  };

  const handleWordPressImport = (importedBlocks: Block[]) => {
      setBlocks(importedBlocks);
  };

  return (
      <MainLayout 
        modals={
            <>
                <ImportModal 
                    isOpen={isImportModalOpen} 
                    onClose={() => setIsImportModalOpen(false)}
                    onImport={handleAIImport}
                    aiService={aiService}
                />
                <WordPressModal 
                    isOpen={isWordPressModalOpen}
                    onClose={() => setIsWordPressModalOpen(false)}
                    blocks={blocks}
                    onImport={handleWordPressImport}
                    metadata={{ title: docMetadata.title, excerpt: docMetadata.excerpt }}
                />
                <ImageBrowserModal
                    isOpen={isImageBrowserOpen}
                    onClose={() => setIsImageBrowserOpen(false)}
                    onSelectImage={handleSelectImage}
                    galleryImages={galleryImages}
                    aiService={aiService}
                />
                <DocumentSettingsModal 
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    metadata={docMetadata}
                    onChange={(meta) => setDocMetadata(prev => ({ ...prev, ...meta }))}
                    mode="article"
                />
            </>
        }
        header={
            <Header 
                activeUsers={activeUsers}
                isPreview={isPreview}
                onTogglePreview={() => setIsPreview(!isPreview)}
                onImportAI={() => setIsImportModalOpen(true)}
                onImportWP={() => setIsWordPressModalOpen(true)}
                onLoad={() => onLoadClick && onLoadClick()}
                onSave={handleSave}
                onPrint={handlePrint}
                onSettings={() => setIsSettingsOpen(true)}
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
                <ArticleEditorView blocks={blocks} user={user} />
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
                    onAppendBlocks={appendBlocks}
                    onReplaceBlocks={replaceBlocks}
                    onClearContext={() => setActiveBlockId(null)}
                    onOpenImageBrowser={handleOpenImageBrowser}
                    aiService={aiService}
                />
            )
        }
      />
  );
});
