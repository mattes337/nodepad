import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { BlockComponentProps } from '../../../blocks/types';
import { ContentEditable } from '../../atoms/ContentEditable';

export const ImageComponent: React.FC<BlockComponentProps> = ({ 
    block, onFocus, onUpdate, autoFocus, onOpenImageBrowser, readOnly
}) => {
    const {
        url, alt, caption, prompt,
        displayMode = 'standard',
        aspectRatio = 'auto',
        objectFit = 'cover',
        width = '100%',
        align = 'center',
        borderRadius = 'md',
        padding = 'none',
        height = 'medium',
        overlayOpacity = 40
    } = block.metadata || {};

    const handleDoubleClick = () => {
        if (readOnly) return;
        if (onOpenImageBrowser) {
            onOpenImageBrowser(block.id);
        }
    };

    const getPaddingClass = (p: string) => {
        switch(p) {
            case 'sm': return 'p-4';
            case 'md': return 'p-8';
            case 'lg': return 'p-12';
            default: return 'p-0';
        }
    };

    const getBorderRadiusClass = (r: string) => {
        switch(r) {
            case 'none': return 'rounded-none';
            case 'sm': return 'rounded-sm';
            case 'md': return 'rounded-lg';
            case 'lg': return 'rounded-xl';
            case 'full': return 'rounded-2xl'; 
            default: return 'rounded-lg';
        }
    };

    const getHeightClass = (h: string) => {
        switch(h) {
            case 'small': return 'min-h-[200px]';
            case 'medium': return 'min-h-[400px]';
            case 'large': return 'min-h-[600px]';
            case 'screen': return 'min-h-[80vh]';
            default: return 'min-h-[400px]';
        }
    };

    const getAlignClass = (a: string) => {
        switch(a) {
            case 'left': return 'justify-start';
            case 'right': return 'justify-end';
            default: return 'justify-center';
        }
    };

    if (!url) {
        if (readOnly) return null;
        return (
            <div 
                className="relative group rounded-lg overflow-hidden border border-dashed border-slate-300 hover:border-brand-400 transition-colors bg-slate-50/50 p-2 min-h-[200px] flex flex-col items-center justify-center cursor-default"
                onClick={() => onFocus(block.id)}
                onDoubleClick={handleDoubleClick}
            >
                <div className="text-center text-slate-400 p-8 group-hover:text-slate-500 transition-colors">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium">Empty Image Block</p>
                    <p className="text-xs mt-1">Double-click to open browser or use AI Assistant.</p>
                </div>
            </div>
        );
    }

    // Background Mode
    if (displayMode === 'background') {
        return (
            <div 
                className={`relative w-full overflow-hidden group transition-all ${getPaddingClass(padding)} ${getBorderRadiusClass(borderRadius)}`} 
                onClick={() => !readOnly && onFocus(block.id)}
                onDoubleClick={handleDoubleClick}
            >
                 <div
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: `url(${url})` }}
                 />
                 <div 
                    className="absolute inset-0 bg-black z-0 transition-opacity" 
                    style={{ opacity: (overlayOpacity || 0) / 100 }} 
                 />
                 
                 <div className={`relative z-10 w-full ${getHeightClass(height)} flex flex-col justify-center items-center text-center p-8`}>
                     <ContentEditable
                         tagName="h2"
                         html={block.content}
                         autoFocus={autoFocus}
                         readOnly={readOnly}
                         onChange={(val) => onUpdate(block.id, val)}
                         onFocus={() => onFocus(block.id)}
                         placeholder="Write a title..."
                         className="text-3xl md:text-4xl font-bold text-white outline-none max-w-3xl drop-shadow-lg editor-serif leading-tight"
                     />
                 </div>
            </div>
        );
    }

    // Standard Mode
    return (
        <div className={`w-full flex ${getAlignClass(align)} ${getPaddingClass(padding)} transition-all`} onClick={() => !readOnly && onFocus(block.id)} onDoubleClick={handleDoubleClick}>
            <div 
                className={`relative group flex flex-col ${width === '100%' ? 'w-full' : ''} transition-all`} 
                style={{ width: width !== '100%' ? width : undefined }}
            >
                 <img 
                    src={url} 
                    alt={alt || "Image"} 
                    className={`w-full h-auto shadow-lg shadow-black/5 transition-all ${getBorderRadiusClass(borderRadius)}`}
                    style={{
                        aspectRatio: aspectRatio === 'auto' ? 'auto' : aspectRatio.replace(':','/'),
                        objectFit: objectFit as any
                    }}
                />
                
                {caption && (
                    <p className="text-center mt-2 text-sm text-slate-500 italic w-full px-4">
                        {caption}
                    </p>
                )}
            </div>
        </div>
    );
};