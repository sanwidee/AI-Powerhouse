
export type AspectRatio = '1:1' | '9:16' | '16:9' | '4:3' | '3:4';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export interface VisualStyle {
  layout_archetype: string;
  typography_system: string;
  color_grammar: string;
  composition_map: string;
  aesthetic_motifs: string;
}

export interface BrandDNA {
  brand_name: string;
  primary_colors: string[];
  color_logic: string;
  brand_vibe: string;
  typography_notes: string;
  forbidden_styles: string[];
}

export interface DesignPromptJson {
  template_name: string;
  structural_rules: VisualStyle;
  layout_constraints: {
    forbidden_elements: string[];
    mandatory_anchors: string[];
    white_space_logic: string;
  };
  placeholder_map: {
    headline_style: string;
    body_style: string;
    cta_style: string;
  };
  base_visual_dna_prompt: string;
}

export interface ContentBrief {
  topic: string;
  elements_to_display: string;
  copy_instructions: string;
  target_audience: string;
  aspectRatio: AspectRatio;
  slide_number?: number;
  total_slides?: number;
}

export interface RetouchHistory {
  id: string;
  timestamp: number;
  instruction: string;
  image: string;
  type: 'text' | 'visual_reference' | 'annotation';
}

export interface GeneratedPost {
  id: string;
  name: string;
  imageSource: string;
  history: RetouchHistory[];
  blueprintId: string;
  brandId?: string;
  aspectRatio: AspectRatio;
  createdAt: number;
}

export interface DesignReference {
  id: string;
  name: string;
  tags: string[];
  imageSource: string;
  templateImage?: string;
  markdownBrief: string;
  jsonSpec: DesignPromptJson;
  aspectRatio: AspectRatio;
  createdAt: number;
}

export interface BrandReference {
  id: string;
  name: string;
  imageSource: string;
  dna: BrandDNA;
  createdAt: number;
}

export enum AppTool {
  LANDING = 'landing',
  BUILDER = 'builder',
  LIBRARY = 'library',
  GENERATOR = 'generator',
  BRAND_LAB = 'brand_lab',
  SETTINGS = 'settings'
}

export type RemixIntensity = 'strict' | 'light' | 'heavy';

export interface UsageLog {
  id: string;
  timestamp: number;
  feature: 'Design Builder DNA' | 'Design Builder Visual' | 'Brand Lab' | 'Post Generator' | 'Production Studio';
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
  costIDR: number;
}
