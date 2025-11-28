import React, { useEffect, useRef } from 'react';

export const AutoFocuser: React.FC = () => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const contentEditable = ref.current?.previousElementSibling as HTMLElement;
        if (contentEditable) {
             contentEditable.focus();
             const range = document.createRange();
             const sel = window.getSelection();
             range.selectNodeContents(contentEditable);
             range.collapse(false);
             sel?.removeAllRanges();
             sel?.addRange(range);
        }
    }, []);
    return <div ref={ref} className="hidden" />;
};