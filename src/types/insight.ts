export type AgentId =
  | 'local_guide'
  | 'art_critic'
  | 'design_critic'
  | 'stylist'
  | 'food_explorer'
  | 'text_reader'
  | 'general_curiosity';

export interface InsightContext {
  cultural?: string | null;
  historical?: string | null;
  practical?: string | null;
}

export interface FlavorNote {
  label: string;
  value: string;
  emoji?: string | null;
}

export interface NearbyPick {
  name: string;
  blurb?: string;
}

export interface ExploreChips {
  culinary: string[];
  nearby: string[];
}

export interface ShareCard {
  headline?: string;
  quote?: string;
  cta?: string;
}

export interface StructuredInsight {
  title: string;
  category: string;
  confidence: number;
  visible_clues: string[];
  context: InsightContext;
  style_vocabulary: string[];
  suggested_searches: string[];
  next_actions: string[];
  agent_id: AgentId;
  disclaimer: string;
  subtitle?: string | null;
  narrative?: string | null;
  flavor_notes?: FlavorNote[];
  nearby_picks?: NearbyPick[];
  explore_chips?: ExploreChips;
  share_card?: ShareCard | null;
}

export interface AnalyzeResponse {
  memory_id: string;
  agent_id: AgentId;
  followup_chips: string[];
  insight: StructuredInsight;
  image_url: string;
  thumbnail_url: string;
}

export interface MemoryItem {
  id: string;
  title: string;
  category: string;
  agent_id: AgentId;
  image_url: string;
  thumbnail_url: string;
  insight: StructuredInsight;
  created_at: string;
  locale: string;
}

export interface FollowUpResponse {
  memory_id: string;
  answer: string;
  suggested_followups: string[];
}

export interface FollowUpItem {
  question: string;
  answer: string;
  at?: string;
}

export interface MemoryDetailResponse {
  memory: MemoryItem;
  followups: FollowUpItem[];
}

export interface AgentInfo {
  id: AgentId;
  name: string;
  icon: string;
}

