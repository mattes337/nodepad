import { BlockDefinition } from '../types';
import { Image as ImageIcon } from 'lucide-react';
import { ImageComponent } from '../../components/molecules/blocks/ImageComponent';
import { ImageProperties } from '../../components/molecules/properties/ImageProperties';

export const ImageBlock: BlockDefinition = {
    type: 'image',
    label: 'Image',
    icon: ImageIcon,
    category: 'media',
    create: (id) => ({ 
        id, 
        type: 'image', 
        content: '',
        metadata: { 
            url: '', 
            alt: '', 
            caption: '',
            // Visual Defaults
            displayMode: 'standard', // 'standard' | 'background'
            aspectRatio: 'auto',
            objectFit: 'cover',
            width: '100%',
            align: 'center',
            borderRadius: 'md',
            padding: 'none',
            height: 'medium', // for background mode
            overlayOpacity: 40
        } 
    }),
    Component: ImageComponent,
    PropertiesPanel: ImageProperties,
    serializeToWordPress: (block) => {
        const url = block.metadata?.url;
        if (!url) return '';
        
        if (block.metadata?.displayMode === 'background') {
            const opacity = block.metadata?.overlayOpacity ?? 40;
            const coverAttrs = {
                url: url,
                dimRatio: opacity,
                overlayColor: 'black',
                align: 'center'
            };

            return `<!-- wp:cover ${JSON.stringify(coverAttrs)} -->
<div class="wp-block-cover"><span aria-hidden="true" class="wp-block-cover__background has-black-background-color has-background-dim-${opacity} has-background-dim"></span><img class="wp-block-cover__image-background" src="${url}" data-object-fit="cover"/><div class="wp-block-cover__inner-container"><!-- wp:paragraph {"align":"center","placeholder":"Write title..."} -->
<p class="has-text-align-center">${block.content}</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:cover -->`;
        }

        const caption = block.metadata?.caption ? `<figcaption>${block.metadata.caption}</figcaption>` : '';
        const alt = block.metadata?.alt || '';
        const alignClass = block.metadata?.align ? `align${block.metadata.align}` : '';
        const roundedClass = block.metadata?.borderRadius === 'full' ? 'is-style-rounded' : '';
        
        const attrs: any = {
            align: block.metadata?.align || undefined,
            id: Date.now(),
            sizeSlug: 'large',
            linkDestination: 'none',
            url: url
        };
        
        // Use JSON.stringify for attributes to ensure valid JSON in comments
        return `<!-- wp:image ${JSON.stringify(attrs)} -->\n<figure class="wp-block-image size-large ${alignClass} ${roundedClass}"><img src="${url}" alt="${alt}"/>${caption}</figure>\n<!-- /wp:image -->`;
    },
    getContextString: (block) => `Image: [${block.metadata?.alt || 'No description'}] URL: ${block.metadata?.url || 'None'} Mode: ${block.metadata?.displayMode || 'Standard'}`,
};