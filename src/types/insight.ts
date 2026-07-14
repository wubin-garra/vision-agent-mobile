export type AgentId =
  | 'local_guide'
  | 'art_critic'
  | 'design_critic'
  | 'stylist'
  | 'food_explorer'
  | 'food_scan'
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

export interface NutritionMacro {
  current: number;
  goal: number;
  unit?: string;
  emoji?: string | null;
}

export interface NutritionProfile {
  calories_current: number;
  calories_goal: number;
  carbs: NutritionMacro;
  fat: NutritionMacro;
  protein: NutritionMacro;
}

export interface AllergenItem {
  category: string;
  detail: string;
  emoji?: string | null;
}

export interface NutritionTip {
  title: string;
  body: string;
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
  nutrition?: NutritionProfile | null;
  allergens?: AllergenItem[];
  nutrition_tips?: NutritionTip[];
  diet_summary?: string | null;
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

// ─── 食识拍结构化追问（Chance 风格）────────────────────────────────────────
// 仅 food_scan agent 的 /followup 接口返回 structured_answer；
// 其他 agent 仍使用纯文本 answer。

/** 评估条目：positive=优点（绿圈），warning=隐患（红圈） */
export interface FollowUpAssessmentItem {
  tone: 'positive' | 'warning';
  /** 短标题，如「多源蛋白质」 */
  title: string;
  /** 一句说明，避免过长 */
  body: string;
}

/** 优化建议条目：label 为分类，body 为具体做法 */
export interface FollowUpTip {
  label: string;
  body: string;
}

/** 追问回答的一个主题分段 */
export interface FollowUpSection {
  /** 分段大标题，如「减脂期的优劣势分析」 */
  heading: string;
  /** 分析正文，建议每段 1-2 句 */
  paragraphs: string[];
  /** 适配度评估卡（绿/红圆点列表） */
  assessments: FollowUpAssessmentItem[];
  /** 优化建议区块标题，默认「优化小窍门」 */
  tips_heading?: string | null;
  /** 优化建议引导语 */
  tips_lead?: string | null;
  tips: FollowUpTip[];
}

/** 对比滑条：value 为 0-1，表示在 low/high 之间的位置 */
export interface FollowUpMetricSlider {
  label: string;
  value: number;
  low_label: string;
  high_label: string;
}

/** 指标对比卡，如「饱腹感 VS 热量密度」 */
export interface FollowUpMetricCard {
  title: string;
  sliders: FollowUpMetricSlider[];
  /** 滑条下方的对比总结 */
  note?: string | null;
}

/** 分组追问芯片，如「进阶减脂建议」 */
export interface FollowUpSuggestionGroup {
  title: string;
  questions: string[];
}

/**
 * 食识拍 Chance 风格结构化追问回答。
 * UI 渲染顺序：summary → sections → metric_card → remark → suggestion_groups
 */
export interface StructuredFollowUpAnswer {
  /** 开篇总结，直接回应用户问题 */
  summary: string;
  sections: FollowUpSection[];
  metric_card?: FollowUpMetricCard | null;
  /** 补充备注：数据来源、个体差异等提示 */
  remark?: string | null;
  suggestion_groups: FollowUpSuggestionGroup[];
}

export interface FollowUpResponse {
  memory_id: string;
  /** 纯文本摘要，兼容旧版；食识拍优先用 structured_answer */
  answer: string;
  structured_answer?: StructuredFollowUpAnswer | null;
  suggested_followups: string[];
}

export interface FollowUpItem {
  question: string;
  answer: string;
  structured_answer?: StructuredFollowUpAnswer | null;
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

