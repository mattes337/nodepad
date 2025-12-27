import { GoogleGenAI, GenerateContentResponse, Type, Schema } from "@google/genai";
import { Block, BlockType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { getBlockDefinition, BLOCK_REGISTRY } from '../blocks/registry';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCompletion = async (
  prompt: string,
  context?: string,
  systemInstruction: string = "You are a helpful AI writing assistant."
): Promise<string> => {
  const client = getClient();
  try {
    const finalPrompt = context 
      ? `Context:\n${context}\n\nTask: ${prompt}`
      : prompt;

    const response: GenerateContentResponse = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: finalPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Text Error:", error);
    return "Sorry, I encountered an error processing your request.";
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  const client = getClient();
  try {
    const response = await client.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        outputMimeType: 'image/jpeg',
      },
    });

    const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64Image) {
      return `data:image/jpeg;base64,${base64Image}`;
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Gemini Image Error:", error);
    throw error;
  }
};

// Helper to extract meaningful content for context using registry
const getBlockContentForContext = (b: Block): string => {
    const def = getBlockDefinition(b.type);
    return def.getContextString(b);
};

export const processAIRequest = async (
    userPrompt: string,
    allBlocks: Block[],
    selectedBlock: Block | null
  ): Promise<{ 
    intent: 'chat' | 'replaceBlock' | 'appendArticle' | 'replaceArticle'; 
    content: string; 
    reply: string 
  }> => {
    console.log("--- [Gemini:processAIRequest] START ---");
    const client = getClient();
    
    // Include Block IDs in context
    const docContext = allBlocks
        .map(b => `[ID: ${b.id}] (${b.type}): ${getBlockContentForContext(b)}`)
        .join('\n');
        
    const truncatedContext = docContext.length > 8000 ? docContext.substring(0, 8000) + "..." : docContext;

    const selectedBlockInfo = selectedBlock 
        ? `SELECTED BLOCK (Target for specific edits):\nID: ${selectedBlock.id}\nType: ${selectedBlock.type}\nContent: "${getBlockContentForContext(selectedBlock)}"`
        : "NO BLOCK SELECTED.";

    const prompt = `
    User Request: "${userPrompt}"
    
    ${selectedBlockInfo}
    
    Document Context (Snippet):
    "${truncatedContext}"
    
    You are an expert AI writing assistant for a block-based document editor.
    Determine the user's INTENT based on the strict rules below.

    INTENT RULES:
    1. 'replaceBlock': 
       - Condition: A block MUST be currently selected (see SELECTED BLOCK).
       - Condition: The user is asking to modification, edit, rewrite, or fix that SPECIFIC selected block.
       - Content Format: HTML string (e.g. "<b>Title</b>" or "<table>...</table>"). NO Markdown.
    
    2. 'appendArticle': 
       - Condition: The user asks to ADD, CREATE, WRITE, or GENERATE NEW content.
       - Condition: The user asks to "continue" writing.
       - Content Format: Markdown string. (Use markdown tables for data, NOT HTML).
    
    3. 'replaceArticle': 
       - Condition: The user asks to rewrite the ENTIRE document.
       - Condition: The request implies a major structural change or doesn't fit the other categories.
       - Content Format: Markdown string.
    
    4. 'chat': 
       - Condition: The user is asking a question or chatting, not asking to modify the document.
       - Content Format: Empty string.

    RESPONSE GUIDELINES:
    - Return a JSON object.
    - "intent": One of the 4 intents above.
    - "content": The generated content.
    - "reply": A short conversational confirmation in PRESENT CONTINUOUS tense (e.g., "Updating block...", "Adding table...").
    `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        intent: { type: Type.STRING, enum: ['chat', 'replaceBlock', 'appendArticle', 'replaceArticle'] },
                        content: { type: Type.STRING },
                        reply: { type: Type.STRING }
                    },
                    required: ['intent', 'content', 'reply']
                }
            }
        });

        const rawText = response.text;
        const result = JSON.parse(rawText || '{}');
        
        return {
            intent: result.intent || 'chat',
            content: result.content || '',
            reply: result.reply || "I am processing your request..."
        };

    } catch (error) {
        console.error("[Gemini:processAIRequest] Error:", error);
        return { intent: 'chat', content: '', reply: "I encountered an error." };
    }
  };

export const analyzeBlock = async (block: Block): Promise<string> => {
    if (!block.content) return "This block is empty.";
    const client = getClient();
    const prompt = `Analyze the following text block and provide 3 brief suggestions to improve it (style, clarity, grammar). Keep it concise.\n\nText: "${block.content}"`;
    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "No analysis available.";
    } catch (e) {
        return "Could not analyze block.";
    }
}

export const transformToBlocks = async (text: string, additionalInstruction: string = ''): Promise<Block[]> => {
    const client = getClient();
    const blockTypes = Object.keys(BLOCK_REGISTRY);

    const prompt = `
    Convert the provided text into a structured JSON array of Block objects.
    
    ${additionalInstruction}

    CRITICAL RULES:
    1. **Tables**: usage of HTML <table> tags in 'content' is STRICTLY PROHIBITED. You MUST use the 'table' block type and populate the 'tableContent' 2D array. If the input contains HTML tables, parse them into this structure.
    2. **Links**: If a line is primarily a link (with optional title/desc), use the 'link' type.
    3. **Content**: For 'paragraph', 'h1', etc., use HTML for 'content' (bold, italic), but NO structural HTML (no div, table, list tags inside content).
    4. **Lists**: Use 'ul' or 'ol' types with 'listItems'.
    
    Text to convert:
    ${text}
    `;

    const blockSchema: Schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                type: { 
                    type: Type.STRING, 
                    enum: blockTypes
                },
                content: { type: Type.STRING, description: "HTML content for text. Title for link blocks." },
                listItems: { 
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { 
                            content: { type: Type.STRING }, 
                            checked: { type: Type.BOOLEAN } 
                        }
                    }
                },
                tableContent: {
                    type: Type.ARRAY,
                    items: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING } 
                    },
                    description: "Rows of cells. First row is header."
                },
                metadata: {
                    type: Type.OBJECT,
                    properties: {
                        url: { type: Type.STRING },
                        caption: { type: Type.STRING },
                        alt: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        columnCount: { type: Type.INTEGER },
                        layoutStyle: { type: Type.STRING }
                    }
                }
            },
            required: ['type']
        }
    };

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { 
                responseMimeType: 'application/json',
                responseSchema: blockSchema 
            }
        });
        
        const blocks = JSON.parse(response.text || '[]');
        
        return blocks.map((b: any) => {
            // Ensure ID
            const blockId = uuidv4();
            
            // Basic sanitization
            const newBlock: Block = {
                id: blockId,
                type: b.type,
                content: b.content || '',
                listItems: b.listItems,
                tableContent: b.tableContent,
                metadata: b.metadata
            };
            
            // Defaults for table
            if (newBlock.type === 'table' && (!newBlock.tableContent || newBlock.tableContent.length === 0)) {
                newBlock.tableContent = [['Header 1', 'Header 2'], ['Cell 1', 'Cell 2']];
            }
            
            return newBlock;
        });

    } catch (error) {
        console.error("Gemini Import Error:", error);
        return [];
    }
};