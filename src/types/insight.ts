export type AgentId =
  | 'local_guide'
  | 'art_critic'
  | 'design_critic'
  | 'stylist'
  | 'food_explorer'
  | 'food_scan'
  | 'palm_reader'
  | 'text_reader'
  | 'menu_translator'
  | 'med_label'
  | 'sight_route'
  | 'hotel_guide'
  | 'flight_info'
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

export type PalmLineId = 'heart' | 'head' | 'life' | 'career';

export interface PalmPoint {
  x: number;
  y: number;
}

export interface PalmLine {
  id: PalmLineId;
  name: string;
  color: string;
  highlight: string;
  description: string;
  path?: PalmPoint[];
}

export interface PersonalitySlider {
  low_label: string;
  high_label: string;
  value: number;
}

export interface PalmSummaryTrait {
  label: string;
  value: string;
}

export interface PalmReading {
  birthday?: string | null;
  zodiac?: string | null;
  insight_quote?: string | null;
  summary_traits?: PalmSummaryTrait[];
  palm_lines?: PalmLine[];
  personality_spectrum?: PersonalitySlider[];
  compatibility_teaser?: string | null;
}

/** 翻译师：单道菜/条目的原文译文对照 */
export interface MenuDish {
  original: string;
  translation: string;
  price?: string | null;
  /** 辣度、份量、主料等一句说明 */
  notes?: string | null;
  /** 如「海鲜」「推荐」「素食友好」 */
  tags?: string[];
}

/** 翻译师结构化结果（insight.menu_translation） */
export interface MenuTranslation {
  source_language?: string;
  target_language?: string;
  dishes?: MenuDish[];
  ordering_tips?: string[];
  /** 忌口总览一句 */
  dietary_summary?: string | null;
}

/** 零食分析结构化结果（insight.snack_analysis）；agent_id 仍为 food_explorer */
export interface SnackAnalysis {
  brand?: string | null;
  product_name?: string | null;
  snack_type?: string;
  taste_tags?: string[];
  ingredients_highlight?: string[];
  caution_notes?: string[];
  /** 如「约 140 kcal/30g（估算）」 */
  calories_estimate?: string | null;
  serving_tip?: string | null;
}

/** 药品说明（med_label） */
export interface MedLabelReading {
  drug_name?: string | null;
  brand?: string | null;
  active_ingredients?: string[];
  usage?: string | null;
  dosage?: string | null;
  warnings?: string[];
  storage?: string | null;
  translated_summary?: string | null;
  source_language?: string | null;
}

export interface SightHighlight {
  name: string;
  tip?: string;
}

/** 景点路线（sight_route） */
export interface SightRoutePlan {
  place_name?: string | null;
  area?: string | null;
  highlights?: SightHighlight[];
  suggested_route?: string[];
  duration_estimate?: string | null;
  transport_tips?: string[];
  best_time?: string | null;
  ticket_notes?: string | null;
}

/** 酒店入住（hotel_guide） */
export interface HotelGuide {
  hotel_name?: string | null;
  confirmation_code?: string | null;
  guest_name?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  address?: string | null;
  room_type?: string | null;
  steps?: string[];
  amenities_notes?: string[];
  wifi_or_access?: string | null;
  contact?: string | null;
}

export interface FlightLeg {
  airport?: string | null;
  time?: string | null;
  terminal?: string | null;
  gate?: string | null;
}

/** 航班 / 登机牌（flight_info） */
export interface FlightInfo {
  airline?: string | null;
  flight_number?: string | null;
  passenger?: string | null;
  booking_ref?: string | null;
  seat?: string | null;
  cabin?: string | null;
  departure?: FlightLeg | null;
  arrival?: FlightLeg | null;
  status_notes?: string | null;
  timeline_tips?: string[];
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
  palm_reading?: PalmReading | null;
  /** 翻译师专用；有 dishes 时走 MenuTranslatorInsightSections */
  menu_translation?: MenuTranslation | null;
  /** 零食分析专用；有值时走 SnackInsightSections */
  snack_analysis?: SnackAnalysis | null;
  med_label_reading?: MedLabelReading | null;
  sight_route?: SightRoutePlan | null;
  hotel_guide?: HotelGuide | null;
  flight_info?: FlightInfo | null;
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

