import React, { useRef, useEffect } from 'react';

interface ContentEditableProps {
  html: string;
  tagName: string;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  onChange: (html: string) => void;
  onFocus?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
}

export const ContentEditable: React.FC<ContentEditableProps> = ({ 
  html, 
  tagName, 
  className, 
  placeholder, 
  autoFocus, 
  readOnly,
  onChange, 
  onFocus, 
  onKeyDown,
  onBlur
}) => {
  const contentEditableRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (contentEditableRef.current && contentEditableRef.current.innerHTML !== html) {
        if (document.activeElement !== contentEditableRef.current) {
             contentEditableRef.current.innerHTML = html;
        }
    }
  }, [html]);

  useEffect(() => {
      if (autoFocus && !readOnly && contentEditableRef.current) {
          contentEditableRef.current.focus();
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(contentEditableRef.current);
          range.collapse(false);
          sel?.removeAllRanges();
          sel?.addRange(range);
      }
  }, [autoFocus, readOnly]);

  return React.createElement(tagName, {
    className: `${className} ${!readOnly ? 'empty:before:content-[attr(placeholder)] empty:before:text-slate-300' : ''}`,
    ref: contentEditableRef,
    contentEditable: !readOnly,
    suppressContentEditableWarning: true,
    placeholder: !readOnly ? placeholder : undefined,
    onInput: (e: React.FormEvent<HTMLElement>) => !readOnly && onChange(e.currentTarget.innerHTML),
    onFocus: onFocus,
    onKeyDown: (e: React.KeyboardEvent) => !readOnly && onKeyDown && onKeyDown(e),
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
        if (!readOnly) {
            onChange(e.currentTarget.innerHTML);
            onBlur?.(e);
        }
    },
    onClick: (e: React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        if (link) {
             // If readOnly, allow default link behavior (navigation)
             if (readOnly) return;
             
             // If editing, select the text inside
             if (contentEditableRef.current?.contains(link)) {
                 const selection = window.getSelection();
                 const range = document.createRange();
                 range.selectNodeContents(link);
                 selection?.removeAllRanges();
                 selection?.addRange(range);
            }
        }
    }
  });
};