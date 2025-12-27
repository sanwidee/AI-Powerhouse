
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { DesignPromptJson, ContentBrief, BrandDNA, AspectRatio } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const extractJsonFromText = (text: string): string => {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.substring(firstBrace, lastBrace + 1);
  }
  return text.trim();
};

export const analyzeDesign = async (imageB64: string, userNotes?: string): Promise<{ markdown: string, json: DesignPromptJson }> => {
  const ai = getAI();
  const imagePart = {
    inlineData: { mimeType: 'image/jpeg', data: imageB64.split(',')[1] || imageB64 }
  };
  
  const textPart = { text: `You are a World-Class Creative Director and Design Systems Engineer. 
  Task: Deconstruct the provided social media post into its modular "Design DNA".
  
  User Focus Notes: ${userNotes || 'Standard analysis'}.

  1. IDENTIFY THE ARCHETYPE: Is it a "Headline Listicle", "Minimalist Quote", "Product Showcase", "Infographic Guide", or "Character-Led Story"?
  2. ANALYZE COMPOSITION: Note where the text blocks are anchored, where the focal point (image/illustration) is placed, and the background texture/pattern.
  3. EXTRACT TYPOGRAPHY: Identify font weights (bold/thin), casing (uppercase/mixed), and spacing logic.

  Output Format:
  1. Detailed Markdown Report describing the "Why" of the design.
  2. The string "---JSON_START---".
  3. A JSON object with this exact structure:
  {
    "template_name": "A catchy name for this layout style",
    "structural_rules": {
      "layout_archetype": "Specific category like 'Educational Listicle'",
      "typography_system": "Detailed description of font pairing and weights",
      "color_grammar": "Palette description with hex codes if visible",
      "composition_map": "Map of element positioning (e.g., Top-Left Text, Bottom-Right Graphic)",
      "aesthetic_motifs": "Visual details like 'Grainy texture, 3D elements, paper tear effect'"
    },
    "layout_constraints": {
      "forbidden_elements": ["List of things that would break this style"],
      "mandatory_anchors": ["Key elements that must stay in place"],
      "white_space_logic": "How much breathing room is used"
    },
    "placeholder_map": {
      "headline_style": "Visual style for titles",
      "body_style": "Visual style for subtext",
      "cta_style": "Visual style for buttons/links"
    },
    "base_visual_dna_prompt": "A highly descriptive prompt for an image generator to recreate the LAYOUT and STYLE of this image but without the specific text. Describe the composition, textures, lighting, and placement of elements clearly."
  }
  
  IMPORTANT: Do not use generic words like 'Standard' or 'Unknown'. Be descriptive.` };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [imagePart, textPart] },
  });

  const raw = response.text || '';
  if (!raw.includes('---JSON_START---')) {
    throw new Error("The AI failed to generate a structural blueprint. Please try a clearer image.");
  }

  const parts = raw.split('---JSON_START---');
  const markdown = parts[0] || '';
  const jsonPartRaw = parts[1] || '';
  
  try {
    const cleanedJsonStr = extractJsonFromText(jsonPartRaw);
    const jsonData = JSON.parse(cleanedJsonStr) as DesignPromptJson;
    
    if (!jsonData.structural_rules) {
      jsonData.structural_rules = {
        layout_archetype: "Modern Graphic",
        typography_system: "Bold Sans-Serif",
        color_grammar: "High-Contrast Vibrant",
        composition_map: "Centered Headline, Bottom Illustration",
        aesthetic_motifs: "Clean edges, soft shadows"
      };
    }
    
    if (!jsonData.base_visual_dna_prompt || jsonData.base_visual_dna_prompt.includes('UNDEFINED')) {
      jsonData.base_visual_dna_prompt = "A modern professional social media post layout with a clean background, a large bold headline at the top, and a relevant graphic illustration in the center. Studio lighting, high quality graphic design style.";
    }
    
    return { markdown: markdown.trim(), json: jsonData };
  } catch (e) {
    throw new Error("DNA Sequence Error: The system failed to parse the structural logic.");
  }
};

export const analyzeBrand = async (imageB64: string): Promise<BrandDNA> => {
  const ai = getAI();
  const prompt = `Analyze this brand asset. Extract Brand DNA. 
  Return ONLY a JSON object: { "brand_name": "string", "primary_colors": ["hex codes"], "color_logic": "string", "brand_vibe": "string", "typography_notes": "string", "forbidden_styles": [] }`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { mimeType: 'image/jpeg', data: imageB64.split(',')[1] || imageB64 } }, { text: prompt }] },
    config: { responseMimeType: "application/json" }
  });

  const text = response.text || '';
  if (!text.trim()) throw new Error("No response from Brand Lab.");
  
  try {
    return JSON.parse(extractJsonFromText(text));
  } catch (e) {
    throw new Error("Brand Lab returned invalid JSON format.");
  }
};

export const generateTemplateImage = async (jsonSpec: DesignPromptJson, ratio: AspectRatio): Promise<string> => {
  const ai = getAI();
  const templatePrompt = `Create a high-fidelity design mockup based on these rules: ${jsonSpec.base_visual_dna_prompt}. 
  The layout is a ${jsonSpec.structural_rules.layout_archetype}. 
  Element placement: ${jsonSpec.structural_rules.composition_map}. 
  Visual style: ${jsonSpec.structural_rules.aesthetic_motifs}. 
  Typography vibe: ${jsonSpec.structural_rules.typography_system}.
  Include placeholder text that says 'YOUR CONTENT HERE'. 
  Aspect Ratio: ${ratio}. Clean, professional social media graphic.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: templatePrompt }] },
    config: { imageConfig: { aspectRatio: ratio } },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("Image generation failed.");

  for (const part of parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Validation render failed.");
};

export const generatePostFromReference = async (
  reference: DesignPromptJson, 
  brief: ContentBrief,
  intensity: string,
  brandOverride?: BrandDNA
): Promise<{ report: string, finalVisualPrompt: string }> => {
  const ai = getAI();
  const brandContext = brandOverride 
    ? `BRAND RULES: ${JSON.stringify(brandOverride)}` 
    : "Use original design colors.";
  
  const carouselCtx = brief.slide_number ? `This is slide ${brief.slide_number} of a ${brief.total_slides} slide carousel. Adapt layout accordingly.` : "";

  const prompt = `Create a new post remix. 
  SOURCE DNA: ${JSON.stringify(reference)}
  NEW BRIEF: ${JSON.stringify(brief)}
  ${carouselCtx}
  ${brandContext}
  INTENSITY: ${intensity}

  Return a production report then ---PROMPT_START--- then a single-line visual prompt that includes the layout logic of the source DNA but with the new content from the brief.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  const raw = response.text || '';
  if (!raw.includes('---PROMPT_START---')) return { report: raw, finalVisualPrompt: '' };

  const [report, finalPrompt] = raw.split('---PROMPT_START---');
  return { report: report.trim(), finalVisualPrompt: finalPrompt?.trim() || '' };
};

export const generateRemixImage = async (visualPrompt: string, ratio: AspectRatio): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: `${visualPrompt}. Aspect Ratio: ${ratio}. Professional graphic design.` }] },
    config: { imageConfig: { aspectRatio: ratio } },
  });
  
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("Remix generation failed.");

  for (const part of parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Remix failed to render.");
};

export const refinePostImage = async (
  currentImageB64: string, 
  instruction: string, 
  ratio: AspectRatio,
  refImageB64?: string,
  isAnnotation: boolean = false
): Promise<string> => {
  const ai = getAI();
  
  const parts: any[] = [
    { inlineData: { mimeType: 'image/png', data: currentImageB64.split(',')[1] || currentImageB64 } }
  ];

  if (refImageB64) {
    parts.push({ inlineData: { mimeType: 'image/png', data: refImageB64.split(',')[1] || refImageB64 } });
  }

  const rolePrompt = isAnnotation 
    ? "Interpret the following as a structural layout correction or annotation. Adjust the composition precisely." 
    : "Interpret the following as a stylistic or content-driven retouch.";

  parts.push({ 
    text: `${rolePrompt} Instruction: ${instruction}. ${refImageB64 ? 'Incorporate elements from the second image provided.' : ''} Maintain core layout and design system. Ratio: ${ratio}.` 
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts },
    config: { imageConfig: { aspectRatio: ratio } }
  });

  const resultParts = response.candidates?.[0]?.content?.parts;
  if (!resultParts) throw new Error("Refinement failed.");

  for (const part of resultParts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Refinement failed to render.");
};
