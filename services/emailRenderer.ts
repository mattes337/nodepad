import { Block } from '../types';

interface EmailMetadata {
    title?: string;
    preheader?: string;
}

// Helper to interpolate Handlebars-style variables
const interpolate = (text: string, context?: any): string => {
    if (!context || !text) return text;
    
    return text.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (match, path) => {
        const keys = path.split('.');
        let value = context;
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return match; // Key not found, return original
            }
        }
        return String(value);
    });
};

export const generateEmailHTML = (blocks: Block[], metadata: EmailMetadata = {}, context?: any): string => {
    // Email-safe inline styles
    const s = {
        body: 'margin: 0; padding: 0; background-color: #f1f5f9; font-family: Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;',
        wrapper: 'width: 100%; background-color: #f1f5f9; padding: 40px 0;',
        container: 'display: block; background-color: #ffffff; width: 600px; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);',
        h1: 'font-size: 26px; font-weight: bold; color: #1e293b; margin: 0 0 16px 0; padding: 0; line-height: 1.3;',
        h2: 'font-size: 20px; font-weight: bold; color: #334155; margin: 24px 0 12px 0; padding: 0; line-height: 1.4;',
        p: 'font-size: 16px; color: #475569; margin: 0 0 16px 0; padding: 0; line-height: 1.6;',
        linkButton: 'display: inline-block; background-color: #0d9488; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 16px; text-align: center;',
        img: 'display: block; width: 100%; max-width: 100%; height: auto; border: 0;',
        tdContent: 'padding: 0 40px;',
        tdImage: 'padding: 0;',
        quote: 'border-left: 4px solid #0d9488; padding-left: 16px; margin: 0 0 16px 0; color: #475569; font-style: italic;',
        footer: 'text-align: center; padding: 32px; background-color: #f1f5f9; color: #94a3b8; font-size: 12px;'
    };

    const preheaderText = interpolate(metadata.preheader || '', context);
    const preheaderHTML = preheaderText ? `
    <!-- Preheader Text -->
    <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
        ${preheaderText}
    </div>
    <!-- End Preheader -->
    ` : '';

    const titleText = interpolate(metadata.title || 'Email', context);

    let rows = '';

    blocks.forEach(block => {
        // Skip layout blocks for email stability in this simple renderer
        if (block.type === 'layout') return; 

        // Interpolate content
        const content = interpolate(block.content, context);
        let inner = '';
        let tdStyle = s.tdContent;
        let trStyle = '';

        switch(block.type) {
            case 'h1':
                inner = `<h1 style="${s.h1}">${content}</h1>`;
                trStyle = 'padding-top: 40px;';
                break;
            case 'h2':
                inner = `<h2 style="${s.h2}">${content}</h2>`;
                break;
            case 'paragraph':
                inner = `<p style="${s.p}">${content}</p>`;
                break;
            case 'blockquote':
                 inner = `<div style="${s.quote}"><p style="${s.p} margin: 0;">${content}</p></div>`;
                 break;
            case 'image':
                if (block.metadata?.url) {
                    tdStyle = s.tdImage;
                    const url = interpolate(block.metadata.url, context);
                    const alt = interpolate(block.metadata.alt || '', context);
                    inner = `<img src="${url}" alt="${alt}" style="${s.img}" width="600" />`;
                    if (block.metadata.caption) {
                         const caption = interpolate(block.metadata.caption, context);
                         rows += `<tr><td style="${s.tdContent} padding-top: 8px; padding-bottom: 16px; text-align: center; font-size: 13px; color: #94a3b8; font-style: italic;">${caption}</td></tr>`;
                    }
                }
                break;
            case 'link':
                const url = interpolate(block.metadata?.url || '#', context);
                const descText = block.metadata?.description ? interpolate(block.metadata.description, context) : '';
                
                inner = `
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td align="center" style="padding: 24px 0 32px 0;">
                                <a href="${url}" target="_blank" style="${s.linkButton}">
                                    ${content || 'Click Here'}
                                </a>
                                ${descText ? `<p style="${s.p} font-size: 13px; margin-top: 12px; color: #94a3b8;">${descText}</p>` : ''}
                            </td>
                        </tr>
                    </table>
                `;
                break;
            case 'ul':
            case 'ol':
                const listItems = block.listItems?.map(i => {
                    const itemContent = interpolate(i.content, context);
                    return `<li style="margin-bottom: 8px;">${itemContent}</li>`;
                }).join('') || '';
                const tag = block.type === 'ol' ? 'ol' : 'ul';
                inner = `<${tag} style="${s.p} padding-left: 20px; margin: 0 0 16px 0;">${listItems}</${tag}>`;
                break;
            default:
                if (content) {
                     inner = `<p style="${s.p}">${content}</p>`;
                }
                break;
        }

        if (inner) {
            rows += `<tr><td style="${tdStyle} ${trStyle}">${inner}</td></tr>`;
        }
    });

    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>${titleText}</title>
</head>
<body style="${s.body}">
    ${preheaderHTML}
    <center>
        <div style="${s.wrapper}">
            <!--[if mso]>
            <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
            <tr>
            <td align="center" valign="top" width="600">
            <![endif]-->
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="${s.container}" bgcolor="#ffffff">
                ${rows}
                <tr>
                    <td style="${s.footer}">
                        <p style="margin: 0;">Sent via NodePad Email Editor</p>
                    </td>
                </tr>
            </table>
            <!--[if mso]>
            </td>
            </tr>
            </table>
            <![endif]-->
        </div>
    </center>
</body>
</html>`;
};
