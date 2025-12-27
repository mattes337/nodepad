import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { Modal } from '../molecules/Modal';
import { Button } from '../atoms/Button';
import { PropertyField } from '../molecules/PropertyField';

interface DocumentMetadata {
    title: string;
    slug?: string;
    excerpt?: string;
    tags?: string[];
    featuredImage?: string;
    preheader?: string;
}

interface DocumentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: DocumentMetadata;
  onChange: (meta: DocumentMetadata) => void;
  mode: 'article' | 'email';
  context?: Record<string, any>;
  onContextChange?: (ctx: Record<string, any>) => void;
}

export const DocumentSettingsModal: React.FC<DocumentSettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  metadata, 
  onChange,
  mode,
  context,
  onContextChange
}) => {
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
      if (isOpen && context) {
          setJsonText(JSON.stringify(context, null, 2));
          setJsonError(null);
      }
  }, [isOpen, context]);

  const handleChange = (field: keyof DocumentMetadata, value: any) => {
      onChange({ ...metadata, [field]: value });
  };

  const handleTagsChange = (value: string) => {
      const tags = value.split(',').map(t => t.trim()).filter(Boolean);
      onChange({ ...metadata, tags });
  };

  const handleJsonChange = (val: string) => {
      setJsonText(val);
      try {
          const parsed = JSON.parse(val);
          setJsonError(null);
          if (onContextChange) {
              onContextChange(parsed);
          }
      } catch (e) {
          setJsonError((e as Error).message);
      }
  };

  const renderFooter = () => (
    <div className="w-full flex justify-end items-center gap-3">
        <Button variant="secondary" onClick={onClose}>
            Close
        </Button>
    </div>
  );

  return (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
            <>
                <Settings className="w-5 h-5 text-slate-500" />
                {mode === 'article' ? 'Article Settings' : 'Email Settings'}
            </>
        }
        footer={renderFooter()}
    >
        <div className="space-y-6">
            <PropertyField
                label={mode === 'article' ? "Article Title" : "Subject Line"}
                value={metadata.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder={mode === 'article' ? "My Great Article" : "Weekly Newsletter"}
            />

            {mode === 'article' && (
                <>
                    <PropertyField
                        label="Slug / Permalink"
                        value={metadata.slug || ''}
                        onChange={(e) => handleChange('slug', e.target.value)}
                        placeholder="my-great-article"
                    />
                    
                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1.5 block">Excerpt</label>
                        <textarea
                            className="w-full text-sm px-3 py-2 rounded-lg bg-white/70 border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm h-24 resize-none"
                            value={metadata.excerpt || ''}
                            onChange={(e) => handleChange('excerpt', e.target.value)}
                            placeholder="A short summary of the article..."
                        />
                    </div>

                    <PropertyField
                        label="Featured Image URL"
                        value={metadata.featuredImage || ''}
                        onChange={(e) => handleChange('featuredImage', e.target.value)}
                        placeholder="https://..."
                    />

                    <PropertyField
                        label="Tags (comma separated)"
                        value={metadata.tags?.join(', ') || ''}
                        onChange={(e) => handleTagsChange(e.target.value)}
                        placeholder="tech, news, update"
                    />
                </>
            )}

            {mode === 'email' && (
                <>
                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1.5 block">Preheader Text</label>
                        <textarea
                            className="w-full text-sm px-3 py-2 rounded-lg bg-white/70 border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm h-20 resize-none"
                            value={metadata.preheader || ''}
                            onChange={(e) => handleChange('preheader', e.target.value)}
                            placeholder="Text shown in email client preview area..."
                        />
                        <p className="text-[10px] text-slate-400 mt-1">This text is hidden in the email body but visible in the inbox list.</p>
                    </div>

                    {onContextChange && (
                        <div className="pt-4 border-t border-slate-200">
                             <div className="flex justify-between items-center mb-1.5">
                                 <label className="text-xs font-medium text-slate-500 block">Context Variables (JSON)</label>
                                 {jsonError ? (
                                     <span className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                                         <AlertCircle className="w-3 h-3"/> Invalid JSON
                                     </span>
                                 ) : (
                                     <span className="text-[10px] text-emerald-600 font-medium">Valid JSON</span>
                                 )}
                             </div>
                             <textarea
                                className={`w-full text-xs font-mono px-3 py-2 rounded-lg bg-slate-900 border text-blue-100 outline-none transition-all shadow-sm h-48 resize-none ${jsonError ? 'border-red-500 focus:border-red-500' : 'border-slate-800 focus:border-brand-500'}`}
                                value={jsonText}
                                onChange={(e) => handleJsonChange(e.target.value)}
                                spellCheck={false}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Edit the Mock Data used for variable interpolation and AI generation.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    </Modal>
  );
};