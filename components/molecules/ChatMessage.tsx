import React from 'react';
import { Bot } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[90%] rounded-2xl px-3 py-2 text-xs sm:text-sm leading-relaxed shadow-sm backdrop-blur-sm border ${
            isUser 
            ? 'bg-brand-600/90 border-brand-500 text-white rounded-br-none shadow-brand-500/20' 
            : 'bg-white/80 border-slate-200 text-slate-700 rounded-bl-none'
        }`}>
            {!isUser && <Bot className="w-3 h-3 mb-1 text-brand-500 opacity-90"/>}
            <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
    </div>
  );
};