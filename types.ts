

export type BlockType = 'h1' | 'h2' | 'paragraph' | 'image' | 'blockquote' | 'layout' | 'table' | 'ul' | 'ol' | 'check' | 'link';

export interface ListItem {
  content: string;
  checked?: boolean;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  metadata?: {
    url?: string;
    filename?: string;
    tags?: string[];
    caption?: string;
    alt?: string;
    prompt?: string;
    title?: string;
    description?: string;
    columnCount?: number; // 2, 3, 4
    layoutStyle?: string; // 'equal', '1:2', '2:1', '1:3', '3:1'
    checked?: boolean; // for check lists (legacy/block level)
    
    // Image properties
    displayMode?: string;
    overlayOpacity?: number;
    align?: string;
    borderRadius?: string;
    padding?: string;
    height?: string;
    width?: string;
    aspectRatio?: string;
    objectFit?: string;
  };
  columns?: Block[][]; // For nested layouts: Array of columns, each column is an array of Blocks
  tableContent?: string[][]; // For tables: Array of rows, each row is an array of cell strings
  listItems?: ListItem[]; // For lists: Array of list items
  isLockedBy?: string; // User ID who is currently editing
}

export interface User {
  id: string;
  name: string;
  color: string;
  avatarUrl: string;
}

export interface EditorState {
  blocks: Block[];
  title: string;
  activeBlockId: string | null;
  lastSaved: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  relatedBlockId?: string;
}

export interface AIRequestOptions {
  selectedBlock?: Block;
  contextBlocks: Block[];
  prompt: string;
}

// Intermediate format for File I/O and AI Context
export interface NodePadDocument {
  schemaVersion: string;
  metadata: {
    title: string;
    created: string; // ISO Date string
    modified: string; // ISO Date string
    authorId?: string;
    // Extended Metadata
    slug?: string;
    excerpt?: string;
    tags?: string[];
    featuredImage?: string;
    preheader?: string; // For Emails
  };
  blocks: Block[];
}

export interface GalleryImage {
  id: string;
  filename: string;
  url: string;
  thumbUrl?: string;
  tags: string[];
}

export interface AIService {
  generateImage: (prompt: string) => Promise<string>;
  processAIRequest: (
    userPrompt: string,
    allBlocks: Block[],
    selectedBlock: Block | null
  ) => Promise<{
    intent: 'chat' | 'replaceBlock' | 'appendArticle' | 'replaceArticle';
    content: string;
    reply: string;
  }>;
  transformToBlocks: (text: string, additionalInstruction?: string) => Promise<Block[]>;
  analyzeBlock: (block: Block) => Promise<string>;
}

// Variable Tree Types
export enum EditorType {
  HANDLEBARS = 'handlebars',
  SCRIPT_JS = 'script_js'
}

export interface VariableNode {
  key: string;
  path: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null';
  value: any;
  children?: VariableNode[];
}