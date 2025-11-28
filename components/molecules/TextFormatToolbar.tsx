import React, { useEffect, useState, useRef } from 'react';
import { Bold, Italic, Underline, Strikethrough, Link, Check, X } from 'lucide-react';

export const TextFormatToolbar: React.FC = () => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const toolbarRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      if (showLinkInput) return;

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPosition(null);
        return;
      }

      // Ensure we are in the editor
      const range = selection.getRangeAt(0);
      let container: Node | null = range.commonAncestorContainer;
      if (container.nodeType === Node.TEXT_NODE && container.parentElement) {
          container = container.parentElement;
      }
      
      const element = container as HTMLElement;
      if (!element.isContentEditable && !element.closest('[contenteditable]')) {
        setPosition(null);
        return;
      }

      const rect = range.getBoundingClientRect();
      
      if (rect.width > 0) {
        // We use fixed positioning relative to viewport
        // rect.top is relative to viewport.
        setPosition({
          top: rect.top - 50,
          left: rect.left + (rect.width / 2)
        });
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
          if (showLinkInput) {
              // Just close without applying if clicked outside
              closeLinkInput();
          }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('selectionchange', handleSelectionChange);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLinkInput]);

  const applyFormat = (command: string) => {
    document.execCommand(command, false);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        savedRange.current = range.cloneRange();
        setShowLinkInput(true);
        
        // Robustly find existing link in selection
        let node: Node | null = range.commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
            node = node.parentElement;
        }
        
        const element = node as HTMLElement;
        const existingAnchor = (element && element.closest) ? element.closest('a') : null;
        
        setLinkUrl(existingAnchor ? existingAnchor.getAttribute('href') || '' : '');
    }
  };

  const confirmLink = () => {
      if (savedRange.current) {
          const selection = window.getSelection();
          if (selection) {
              selection.removeAllRanges();
              selection.addRange(savedRange.current);
          }
          if (linkUrl.trim()) {
              document.execCommand('createLink', false, linkUrl.trim());
          } else {
              document.execCommand('unlink', false);
          }
      }
      closeLinkInput();
  };

  const closeLinkInput = () => {
      setShowLinkInput(false);
      setLinkUrl('');
      savedRange.current = null;
  };

  if (!position) return null;

  return (
    <div 
      ref={toolbarRef}
      className="fixed z-50 bg-slate-900 text-white rounded-lg shadow-lg px-2 py-1.5 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-100"
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px`, 
        transform: 'translateX(-50%)' 
      }}
    >
      {!showLinkInput ? (
        <div className="flex items-center gap-1" onMouseDown={(e) => e.preventDefault()}>
          <button onClick={() => applyFormat('bold')} className="p-1.5 hover:bg-slate-700 rounded transition-colors" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
          <button onClick={() => applyFormat('italic')} className="p-1.5 hover:bg-slate-700 rounded transition-colors" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
          <button onClick={() => applyFormat('underline')} className="p-1.5 hover:bg-slate-700 rounded transition-colors" title="Underline"><Underline className="w-3.5 h-3.5" /></button>
          <button onClick={() => applyFormat('strikeThrough')} className="p-1.5 hover:bg-slate-700 rounded transition-colors" title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></button>
          <div className="w-px h-4 bg-slate-700 mx-1"></div>
          <button onClick={handleLinkClick} className="p-1.5 hover:bg-slate-700 rounded transition-colors" title="Link"><Link className="w-3.5 h-3.5" /></button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
             <input 
                type="text" 
                className="bg-slate-800 border border-slate-600 text-white text-xs rounded px-2 py-1 outline-none focus:border-brand-500 w-48 placeholder-slate-400"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        confirmLink();
                    }
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        closeLinkInput();
                    }
                }}
             />
             <button onClick={confirmLink} className="p-1.5 hover:bg-brand-600 rounded transition-colors text-green-400 hover:text-white" title="Apply Link"><Check className="w-3.5 h-3.5" /></button>
             <button onClick={closeLinkInput} className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white" title="Cancel"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </div>
  );
};
