import React from 'react';
import { BlockComponentProps } from '../../../blocks/types';
import { ContentEditable } from '../../atoms/ContentEditable';
import { Link as LinkIcon, ExternalLink } from 'lucide-react';

export const LinkComponent: React.FC<BlockComponentProps> = ({ 
    block, activeBlockId, onUpdate, onFocus, autoFocus, readOnly
}) => {
    if (readOnly) {
        const url = block.metadata?.url || '#';
        const title = block.content || url;
        const desc = block.metadata?.description;
        
        return (
            <div className="group relative border border-slate-200 rounded-lg p-4 bg-white hover:border-brand-300 transition-all shadow-sm my-2">
                 <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-decoration-none">
                    <div className="p-2 bg-brand-50 rounded-md shrink-0 border border-brand-100 text-brand-600">
                        <LinkIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                         <h3 className="font-semibold text-slate-800 mb-1 hover:text-brand-600 transition-colors">{title}</h3>
                         {desc && <p className="text-sm text-slate-500 mb-1">{desc}</p>}
                         <div className="text-xs text-slate-400 flex items-center gap-1 truncate">
                            {url}
                            <ExternalLink className="w-3 h-3" />
                        </div>
                    </div>
                 </a>
            </div>
        );
    }

    return (
        <div className="group relative border border-slate-200 rounded-lg p-4 bg-white/50 hover:bg-white hover:border-brand-300 transition-all shadow-sm" onClick={() => onFocus(block.id)}>
        {!block.metadata?.url ? (
            <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Paste a URL and press Enter..." 
                    className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onUpdate(block.id, block.content, { metadata: { ...block.metadata, url: e.currentTarget.value } });
                        }
                    }}
                    autoFocus={autoFocus}
                />
            </div>
        ) : (
            <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-50 rounded-md shrink-0 border border-brand-100">
                    <LinkIcon className="w-5 h-5 text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <ContentEditable 
                        tagName="div"
                        html={block.content} // Title
                        className="font-semibold text-slate-800 mb-1 outline-none"
                        placeholder="Link Title"
                        onChange={(val) => onUpdate(block.id, val)}
                        onFocus={() => onFocus(block.id)}
                    />
                    <ContentEditable 
                        tagName="div"
                        html={block.metadata.description || ''}
                        className="text-sm text-slate-500 mb-1 outline-none"
                        placeholder="Description (optional)"
                        onChange={(val) => onUpdate(block.id, block.content, { metadata: { ...block.metadata, description: val } })}
                        onFocus={() => onFocus(block.id)}
                    />
                    <div className="flex items-center gap-2">
                        <a href={block.metadata.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-500 hover:text-brand-600 hover:underline flex items-center gap-1 truncate" onClick={e => e.stopPropagation()}>
                            {block.metadata.url}
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};