import React, { useState } from 'react';
import { FileText, Sparkles, ArrowRight } from 'lucide-react';
import { Block, AIService } from '../../types';
import { Modal } from '../molecules/Modal';
import { Button } from '../atoms/Button';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (blocks: Block[]) => void;
  aiService?: AIService;
  variableContext?: Record<string, any>;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport, aiService, variableContext }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setText(ev.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleProcess = async () => {
    if (!text.trim() || !aiService) return;
    setIsLoading(true);
    setError(null);

    try {
      let instruction = '';
      if (variableContext) {
          const keys: string[] = [];
          const extractKeys = (obj: any, prefix = '') => {
              Object.keys(obj).forEach(k => {
                  if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
                      extractKeys(obj[k], prefix ? `${prefix}.${k}` : k);
                  } else {
                      keys.push(prefix ? `${prefix}.${k}` : k);
                  }
              });
          };
          extractKeys(variableContext);
          
          instruction = `
          You are an expert email marketing assistant.
          The user is asking you to generate a newsletter or email content.
          
          AVAILABLE VARIABLES (Handlebars format):
          ${keys.map(k => `- {{ ${k} }}`).join('\n')}
          
          INSTRUCTION:
          - Use these variables where appropriate in the content (e.g. "Hi {{ recipient.firstName }}").
          - Output standard Block JSON structure.
          `;
      }

      const blocks = await aiService.transformToBlocks(text, instruction);
      if (blocks && blocks.length > 0) {
        onImport(blocks);
        onClose();
        setText('');
      } else {
        setError("The AI could not identify any valid blocks in the text.");
      }
    } catch (err) {
      setError("Failed to process text. Please ensure your API key is valid and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderFooter = () => (
    <div className="w-full flex justify-between items-center">
        <div className="text-xs text-slate-400">
            {text.length > 0 ? `${text.length} characters` : 'Ready to import'}
        </div>
        <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
                Cancel
            </Button>
            {aiService && (
                <Button 
                    variant="primary"
                    onClick={handleProcess}
                    disabled={isLoading || !text.trim()}
                    isLoading={isLoading}
                >
                    {!isLoading && <Sparkles className="w-4 h-4" />}
                    <span>Generate Document</span>
                    {!isLoading && <ArrowRight className="w-4 h-4 opacity-50" />}
                </Button>
            )}
        </div>
    </div>
  );

  return (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
            <>
                <Sparkles className="w-5 h-5 text-brand-600" />
                {variableContext ? 'Generate Email with AI' : 'Import with AI'}
            </>
        }
        footer={renderFooter()}
    >
        <div className="flex flex-col h-full">
             <p className="text-xs text-slate-500 mb-4">Convert any text or file into an editable document</p>
            <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                    <label className="group flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-brand-50 hover:border-brand-200 transition-all text-sm font-medium text-slate-700 bg-white shadow-sm">
                        <div className="bg-slate-100 group-hover:bg-brand-100 p-1.5 rounded-md transition-colors">
                             <FileText className="w-4 h-4 text-slate-600 group-hover:text-brand-600" />
                        </div>
                        <span>Upload Text File</span>
                        <input type="file" className="hidden" accept=".txt,.md,.json,.csv" onChange={handleFileChange} />
                    </label>
                    <span className="text-xs text-slate-400">Supports .txt, .md, .json, .csv</span>
                </div>
            </div>

            <div className="relative">
                <textarea 
                    className="w-full h-72 p-5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none resize-none font-mono text-sm leading-relaxed text-slate-700 placeholder-slate-400"
                    placeholder={variableContext 
                        ? "Describe the email you want to generate. e.g. 'Write a weekly newsletter welcoming {{ recipient.firstName }} and mentioning our company {{ company.name }}...'" 
                        : "# Paste your article, notes, or markdown here...\n\nThe AI will automatically detect:\n- Headings\n- Lists\n- Tables\n- Quotes"}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                {!text && (
                    <div className="absolute top-5 right-5 pointer-events-none">
                         <span className="text-[10px] font-semibold bg-slate-200 text-slate-500 px-2 py-1 rounded">Empty</span>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    {error}
                </div>
            )}
        </div>
    </Modal>
  );
}