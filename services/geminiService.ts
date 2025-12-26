
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { DesignPromptJson, ContentBrief } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const BUILDER_PROMPT = `
You are a Design Systems Engineer. Analyze the image to extract its "Structural Blueprint". 
IGNORE the specific topic/content. FOCUS on the layout architecture and aesthetic rules.

Output:
1. A Markdown "System Documentation": How the grid works, why fonts were chosen, and how the negative space is utilized.
2. A JSON Structural Spec.

JSON Schema:
{
  "template_name": "string",
  "structural_rules": {
    "layout_archetype": "e.g., Split-Screen, Rule of Thirds, Minimalist Center",
    "typography_system": "Specific pairings and hierarchy rules",
    "color_grammar": "Palette logic and contrast ratios",
    "composition_map": "Map elements to a 9-patch grid (Top-Left, Center, etc.)",
    "aesthetic_motifs": "Textures, lighting, shadows, rendering style"
  },
  "layout_constraints": {
    "forbidden_elements": ["List of things that would break this style"],
    "mandatory_anchors": ["Elements that MUST stay fixed"],
    "white_space_logic": "How to handle empty areas"
  },
  "placeholder_map": {
    "headline_style": "Description of font/placement",
    "body_style": "Description of font/placement",
    "cta_style": "Description of button/link style"
  },
  "base_visual_dna_prompt": "A master prompt describing ONLY the visual style and layout, using [HEADLINE], [SUBJECT], and [BODY] as variables."
}

Return ONLY Markdown first, then "---JSON_START---", then the JSON.
`;

export const analyzeDesign = async (imageB64: string, userNotes?: string): Promise<{ markdown: string, json: DesignPromptJson }> => {
  const ai = getAI();
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: imageB64.split(',')[1] || imageB64
    }
  };
  const textPart = { text: `${BUILDER_PROMPT}\n\nContext Notes: ${userNotes || 'None'}` };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [imagePart, textPart] },
  });

  const raw = response.text || '';
  const [markdown, jsonStr] = raw.split('---JSON_START---');
  
  try {
    const cleanedJsonStr = jsonStr.trim().replace(/^```json/, '').replace(/```$/, '').trim();
    return {
      markdown: markdown.trim(),
      json: JSON.parse(cleanedJsonStr) as DesignPromptJson
    };
  } catch (e) {
    throw new Error("Failed to parse Structural DNA.");
  }
};

export const generateTemplateImage = async (jsonSpec: DesignPromptJson): Promise<string> => {
  const ai = getAI();
  
  const templatePrompt = `You are a professional mockup generator. 
TASK: Generate a clean Design Template based on this blueprint: ${jsonSpec.base_visual_dna_prompt}

REPLACEMENT RULES:
- Replace [HEADLINE] with "MAIN TITLE"
- Replace [SUBJECT] with a generic gray mannequin or abstract silhouette in the specified style
- Replace [BODY] with "LOREM IPSUM"
- Keep layout, alignment, and anchors EXACTLY as described in: ${jsonSpec.structural_rules.composition_map}
- MAINTAIN the texture, lighting, and color mood of the blueprint.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: templatePrompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Template generation failed.");
};

export const generatePostFromReference = async (
  reference: DesignPromptJson, 
  brief: ContentBrief,
  intensity: 'strict' | 'light' | 'heavy'
): Promise<string> => {
  const ai = getAI();
  const prompt = `
    You are a Content Production Unit. 
    MISSION: Apply NEW CONTENT to an EXISTING DESIGN SYSTEM.

    DESIGN SYSTEM (FIXED): ${JSON.stringify(reference)}
    
    NEW CONTENT BRIEF (VARIABLE):
    - Topic: ${brief.topic}
    - Display Requirements: ${brief.elements_to_display}
    - Copy Tone: ${brief.copy_instructions}
    - Audience: ${brief.target_audience}

    STRICTNESS LEVEL: ${intensity}

    OUTPUT:
    1. A FINISHED VISUAL PROMPT: Merge the Design System DNA with the New Content Brief. 
       - Ensure the [SUBJECT] describes the new elements to display.
       - Keep the layout and anchors from the original.
    2. 3 PRODUCTION-READY HEADLINES based on the tone.
    3. FULL CAPTION + 3 CTA options.
    4. COLOR PALETTE codes for the new elements.

    Format as a clean Markdown report.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  return response.text || '';
};
