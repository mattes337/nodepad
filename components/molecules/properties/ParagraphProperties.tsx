import React from 'react';
import { BlockPropertiesProps } from '../../../blocks/types';

export const ParagraphProperties: React.FC<BlockPropertiesProps> = ({ block }) => (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Words</div>
          <div className="text-xl font-semibold text-slate-700">
            {(block.content || '').replace(/<[^>]*>?/gm, '').trim().split(/\s+/).filter((w: string) => w.length > 0).length}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Chars</div>
          <div className="text-xl font-semibold text-slate-700">
            {(block.content || '').replace(/<[^>]*>?/gm, '').length}
          </div>
        </div>
      </div>
    </div>
);