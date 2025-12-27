import React, { useState, useEffect } from 'react';
import { Copy, ArrowRight, Check, FileCode, ClipboardList } from 'lucide-react';
import { Block } from '../../types';
import { serializeToWordPress, parseWordPressCode } from '../../services/wordpress';
import { Modal } from '../molecules/Modal';
import { Button } from '../atoms/Button';

interface WordPressModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: Block[];
  onImport: (blocks: Block[]) => void;
  metadata?: { title?: string, excerpt?: string };
}

export const WordPressModal: React.FC<WordPressModalProps> = ({ 
  isOpen, 
  onClose, 
  blocks, 
  onImport,
  metadata
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportCode, setExportCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'export') {
      setExportCode(serializeToWordPress(blocks));
    }
  }, [isOpen, activeTab, blocks]);

  const handleCopy = () => {
    navigator.clipboard.writeText(exportCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    try {
      if (!importCode.trim()) return;
      const newBlocks = parseWordPressCode(importCode);
      if (newBlocks.length === 0) {
        setError('No valid blocks found in the provided code.');
        return;
      }
      onImport(newBlocks);
      onClose();
      setImportCode('');
      setError(null);
    } catch (e) {
      setError('Failed to parse WordPress code.');
    }
  };

  const renderFooter = () => (
      <div className="w-full flex justify-end items-center gap-3">
        <Button variant="secondary" onClick={onClose}>
            Close
        </Button>
        {activeTab === 'import' && (
            <button 
                onClick={handleImport}
                disabled={!importCode.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#21759b] text-white rounded-xl hover:bg-[#1a5c7a] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-200 text-sm font-medium"
            >
                <span>Import Blocks</span>
                <ArrowRight className="w-4 h-4 opacity-50" />
            </button>
        )}
            {activeTab === 'export' && (
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#21759b] text-white rounded-xl hover:bg-[#1a5c7a] transition-all shadow-sm shadow-blue-200 text-sm font-medium"
            >
                {copied ? 'Copied to Clipboard' : 'Copy Code'}
            </button>
        )}
    </div>
  );

  return (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
            <>
                <FileCode className="w-5 h-5 text-[#21759b]" />
                WordPress Integration
            </>
        }
        footer={renderFooter()}
    >
        <div className="flex flex-col h-full">
             <p className="text-xs text-slate-500 mt-1 mb-4">Export to Block Editor or Import Gutenberg code</p>
            <div className="flex border-b border-slate-100 mb-4">
                <button 
                    onClick={() => setActiveTab('export')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'export' ? 'text-[#21759b] border-b-2 border-[#21759b] bg-blue-50/30' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Export Code
                </button>
                <button 
                    onClick={() => setActiveTab('import')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'import' ? 'text-[#21759b] border-b-2 border-[#21759b] bg-blue-50/30' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Import Code
                </button>
            </div>

            {activeTab === 'export' ? (
                <div className="space-y-4 h-full flex flex-col">
                    {metadata && (metadata.title || metadata.excerpt) && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm space-y-2">
                             <div className="flex items-center gap-2 text-slate-500 font-medium">
                                 <ClipboardList className="w-4 h-4" /> Post Metadata
                             </div>
                             {metadata.title && (
                                 <div className="flex gap-2">
                                     <span className="text-slate-400 w-16 text-xs uppercase font-bold pt-1">Title</span>
                                     <div className="flex-1 bg-white border border-slate-200 px-2 py-1 rounded text-slate-800 select-all">{metadata.title}</div>
                                 </div>
                             )}
                             {metadata.excerpt && (
                                 <div className="flex gap-2">
                                     <span className="text-slate-400 w-16 text-xs uppercase font-bold pt-1">Excerpt</span>
                                     <div className="flex-1 bg-white border border-slate-200 px-2 py-1 rounded text-slate-800 select-all">{metadata.excerpt}</div>
                                 </div>
                             )}
                        </div>
                    )}

                    <div className="text-sm text-slate-600">
                        Copy this code and paste it into the WordPress Block Editor (select "Code Editor" view).
                    </div>
                    <div className="relative flex-1">
                        <textarea 
                            readOnly
                            value={exportCode}
                            className="w-full h-full p-4 bg-slate-900 text-blue-100 rounded-xl font-mono text-xs leading-relaxed focus:outline-none resize-none"
                        />
                        <button 
                            onClick={handleCopy}
                            className="absolute top-3 right-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium backdrop-blur-md transition-all flex items-center gap-1.5"
                        >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 h-full flex flex-col">
                     <div className="text-sm text-slate-600">
                        Paste standard Gutenberg block HTML comments below.
                    </div>
                    <textarea 
                        value={importCode}
                        onChange={(e) => setImportCode(e.target.value)}
                        placeholder="<!-- wp:paragraph -->..."
                        className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs leading-relaxed focus:ring-2 focus:ring-[#21759b]/20 focus:border-[#21759b] outline-none resize-none"
                    />
                     {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}
                </div>
            )}
        </div>
    </Modal>
  );
};