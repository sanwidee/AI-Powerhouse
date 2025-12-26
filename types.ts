
export interface VisualStyle {
  layout_archetype: string;
  typography_system: string;
  color_grammar: string;
  composition_map: string; // 9-patch spatial map
  aesthetic_motifs: string;
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
  base_visual_dna_prompt: string; // The "master prompt" that describes the vibe
}

export interface ContentBrief {
  topic: string;
  elements_to_display: string;
  copy_instructions: string;
  target_audience: string;
}

export interface DesignReference {
  id: string;
  name: string;
  tags: string[];
  imageSource: string;
  templateImage?: string;
  markdownBrief: string; // Now focusing on "How to use this system"
  jsonSpec: DesignPromptJson;
  createdAt: number;
}

export enum AppTool {
  LANDING = 'landing',
  BUILDER = 'builder',
  LIBRARY = 'library',
  GENERATOR = 'generator'
}

export type RemixIntensity = 'strict' | 'light' | 'heavy';
