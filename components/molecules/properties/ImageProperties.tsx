import React from 'react';
import { BlockPropertiesProps } from '../../../blocks/types';
import { PropertyField } from '../../molecules/PropertyField';
import { Button } from '../../atoms/Button';
import { 
    Monitor, Image as ImageIcon, Maximize, Minimize, 
    AlignLeft, AlignCenter, AlignRight,
    Square, RectangleHorizontal, FolderOpen
} from 'lucide-react';

// Helper for button groups
const ButtonGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="mb-4">
        <label className="text-xs font-medium text-slate-500 mb-2 block">{label}</label>
        <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
            {children}
        </div>
    </div>
);

const ToggleButton: React.FC<{ active: boolean; onClick: () => void; title: string; icon?: React.ElementType; label?: string }> = ({ active, onClick, title, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium flex items-center justify-center gap-1 transition-all ${
            active 
            ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200' 
            : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'
        }`}
        title={title}
    >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label && <span>{label}</span>}
    </button>
);

export const ImageProperties: React.FC<BlockPropertiesProps> = ({ block, onUpdateMetadata, onOpenImageBrowser }) => {
    const meta = block.metadata || {};

    const update = (key: string, value: any) => {
        onUpdateMetadata(block.id, { [key]: value });
    };

    const getFilename = () => {
        if (meta.filename) return meta.filename;
        const url = meta.url;
        if (!url) return 'No image selected';
        if (url.startsWith('data:')) return 'Base64 Image';
        
        // If it looks like a picsum id url (ending in numbers), treat as "Gallery Image" if no explicit filename
        if (/picsum\.photos.*?\d+$/.test(url)) {
             return 'Gallery Image';
        }

        try {
            const parts = url.split('/');
            const name = parts[parts.length - 1];
            // If name is just numbers, it's likely an ID not a filename
            if (/^\d+$/.test(name)) return 'Image';
            
            return name.length > 25 ? name.substring(0, 22) + '...' : name;
        } catch (e) {
            return 'Image';
        }
    };

    return (
    <div className="space-y-6">

      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
          <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded bg-slate-200 shrink-0 overflow-hidden border border-slate-300 relative">
                  {meta.url ? (
                      <img src={meta.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-5 h-5" />
                      </div>
                  )}
              </div>
              
              {meta.filename
              ? (<div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-700 truncate" title={meta.filename || meta.url}>{getFilename()}</div>
              <div className="text-[10px] text-slate-400">{meta.tags?.join(', ')||'No Tags'}</div>
              </div>) 
              : (<div className="min-w-0 flex-1">
              <div className="text-[10px] text-slate-400">Select Image</div>
              </div>)}
              
          </div>
          <Button variant="secondary" size="sm" className="w-full" icon={FolderOpen} onClick={() => onOpenImageBrowser?.(block.id)}>
              Browse Gallery
          </Button>
      </div>
      
      {/* Display Mode */}
      <ButtonGroup label="Display Mode">
         <ToggleButton 
            active={meta.displayMode !== 'background'} 
            onClick={() => update('displayMode', 'standard')} 
            title="Standard Image"
            icon={ImageIcon}
            label="Standard"
         />
         <ToggleButton 
            active={meta.displayMode === 'background'} 
            onClick={() => update('displayMode', 'background')} 
            title="Background Image with Text Overlay"
            icon={Monitor}
            label="Background"
         />
      </ButtonGroup>

      {meta.displayMode === 'background' ? (
          <>
            {/* Background Settings */}
            <div>
                <label className="text-xs font-medium text-slate-500 mb-2 block">Height</label>
                <select 
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-none focus:border-brand-500 bg-white"
                    value={meta.height || 'medium'}
                    onChange={(e) => update('height', e.target.value)}
                >
                    <option value="small">Small (200px)</option>
                    <option value="medium">Medium (400px)</option>
                    <option value="large">Large (600px)</option>
                    <option value="screen">Full Screen</option>
                </select>
            </div>

            <div>
                <div className="flex justify-between mb-2">
                    <label className="text-xs font-medium text-slate-500">Overlay Opacity</label>
                    <span className="text-xs text-slate-400">{meta.overlayOpacity || 40}%</span>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max="90" 
                    step="10"
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                    value={meta.overlayOpacity ?? 40}
                    onChange={(e) => update('overlayOpacity', parseInt(e.target.value))}
                />
            </div>
          </>
      ) : (
          <>
            {/* Standard Settings */}
            <ButtonGroup label="Width">
                {['25%', '50%', '75%', '100%'].map(w => (
                    <ToggleButton 
                        key={w}
                        active={meta.width === w}
                        onClick={() => update('width', w)}
                        title={`Width ${w}`}
                        label={w.replace('%', '')}
                    />
                ))}
            </ButtonGroup>

            {meta.width !== '100%' && (
                <ButtonGroup label="Alignment">
                    <ToggleButton active={meta.align === 'left'} onClick={() => update('align', 'left')} title="Left" icon={AlignLeft} />
                    <ToggleButton active={meta.align === 'center'} onClick={() => update('align', 'center')} title="Center" icon={AlignCenter} />
                    <ToggleButton active={meta.align === 'right'} onClick={() => update('align', 'right')} title="Right" icon={AlignRight} />
                </ButtonGroup>
            )}

            <div>
                <label className="text-xs font-medium text-slate-500 mb-2 block">Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'auto', label: 'Auto', icon: Maximize },
                        { id: '16:9', label: '16:9', icon: RectangleHorizontal },
                        { id: '4:3', label: '4:3', icon: RectangleHorizontal },
                        { id: '1:1', label: '1:1', icon: Square },
                        { id: '3:2', label: '3:2', icon: RectangleHorizontal },
                        { id: '21:9', label: '21:9', icon: Minimize },
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => update('aspectRatio', opt.id)}
                            className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${
                                (meta.aspectRatio || 'auto') === opt.id 
                                ? 'bg-brand-50 border-brand-500 text-brand-700' 
                                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <opt.icon className="w-3.5 h-3.5 mb-1" />
                            <span className="text-[10px]">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>
          </>
      )}

      {/* Shared Settings */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        <div>
            <label className="text-xs font-medium text-slate-500 mb-2 block">Corner Radius</label>
            <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                {['none', 'sm', 'md', 'lg', 'full'].map(r => (
                    <ToggleButton 
                        key={r}
                        active={(meta.borderRadius || 'md') === r}
                        onClick={() => update('borderRadius', r)}
                        title={r}
                        label={r === 'none' ? '0' : r.toUpperCase()}
                    />
                ))}
            </div>
        </div>

        <div>
            <label className="text-xs font-medium text-slate-500 mb-2 block">Padding</label>
            <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                {['none', 'sm', 'md', 'lg'].map(p => (
                    <ToggleButton 
                        key={p}
                        active={(meta.padding || 'none') === p}
                        onClick={() => update('padding', p)}
                        title={p}
                        label={p === 'none' ? '0' : p.toUpperCase()}
                    />
                ))}
            </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 space-y-4">
        <PropertyField
            label="Image URL"
            placeholder="https://..."
            value={meta.url || ''}
            onChange={(e) => update('url', e.target.value)}
        />
        <PropertyField
            label="Alt Text"
            placeholder="Description for accessibility"
            value={meta.alt || ''}
            onChange={(e) => update('alt', e.target.value)}
        />
        {meta.displayMode !== 'background' && (
            <PropertyField
                label="Caption"
                placeholder="Image caption"
                value={meta.caption || ''}
                onChange={(e) => update('caption', e.target.value)}
            />
        )}
      </div>
    </div>
    );
};