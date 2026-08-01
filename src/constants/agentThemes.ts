import type { AgentId } from '@/types/insight';
import { colors } from '@/theme';

/**
 * 智能体主题 —— 唯一调色入口。
 *
 * 后期改色：只动下方 `AGENT_BRANDS` 里的 bg / accent / headerLink。
 * 文字、chip、气泡、输入框等衍生色由 darkTheme / lightTheme 自动生成。
 */

/** 品牌种子：每个 Agent 最少只需配置这几项 */
export type AgentBrand = {
  /** 页面背景 */
  bg: string;
  /** 主强调色 */
  accent: string;
  /** 顶栏链接色；不填则用 accent */
  headerLink?: string;
  /** 「与 xxx 一起看见」 */
  togetherLabel: string;
  /** true = 浅色阅读页 */
  light?: boolean;
};

/** 完整主题（组件消费） */
export type AgentTheme = {
  light: boolean;
  bg: string;
  dockBg: string;
  text: string;
  textMuted: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  accent: string;
  accentSoft: string;
  cardGradient: [string, string];
  narrativeBar: string;
  togetherLabel: string;
  primaryBtn: string;
  primaryBtnText: string;
  headerLink: string;
  chipBg: string;
  chipText: string;
  bubbleBg: string;
  bubbleBorder: string;
  bubbleText: string;
  inputShell: string;
  inputText: string;
  inputPlaceholder: string;
  sendBtn: string;
  sendBtnText: string;
};

/** hex + 两位透明度后缀（如 #E8A04B + 2E） */
function withAlpha(hex: string, alphaHex: string): string {
  const base = hex.replace('#', '').slice(0, 6);
  return `#${base}${alphaHex}`;
}

function buildDarkTheme(brand: AgentBrand): AgentTheme {
  const { bg, accent, togetherLabel } = brand;
  const headerLink = brand.headerLink ?? accent;
  return {
    light: false,
    bg,
    dockBg: bg,
    text: '#F5F5FA',
    textMuted: 'rgba(245,245,250,0.62)',
    surface: 'rgba(255,255,255,0.06)',
    surfaceElevated: 'rgba(255,255,255,0.09)',
    border: 'rgba(255,255,255,0.12)',
    accent,
    accentSoft: withAlpha(accent, '29'),
    cardGradient: [withAlpha(accent, '2E'), 'rgba(0,0,0,0)'],
    narrativeBar: accent,
    togetherLabel,
    primaryBtn: accent,
    primaryBtnText: '#111111',
    headerLink,
    chipBg: withAlpha(accent, '2E'),
    chipText: accent,
    bubbleBg: withAlpha(accent, '24'),
    bubbleBorder: withAlpha(accent, '55'),
    bubbleText: '#F5F5FA',
    inputShell: 'rgba(255,255,255,0.08)',
    inputText: '#F5F5FA',
    inputPlaceholder: 'rgba(245,245,250,0.45)',
    sendBtn: accent,
    sendBtnText: '#111111',
  };
}

function buildLightTheme(brand: AgentBrand): AgentTheme {
  const { bg, accent, togetherLabel } = brand;
  const headerLink = brand.headerLink ?? accent;
  return {
    light: true,
    bg,
    dockBg: bg,
    text: '#111111',
    textMuted: '#6B6B73',
    surface: '#FFFFFF',
    surfaceElevated: 'rgba(0,0,0,0.04)',
    border: 'rgba(0,0,0,0.08)',
    accent,
    accentSoft: withAlpha(accent, '24'),
    cardGradient: [withAlpha(accent, '14'), 'rgba(255,255,255,0)'],
    narrativeBar: accent,
    togetherLabel,
    primaryBtn: accent,
    primaryBtnText: '#FFFFFF',
    headerLink,
    chipBg: withAlpha(accent, '1F'),
    chipText: accent,
    bubbleBg: withAlpha(accent, '18'),
    bubbleBorder: withAlpha(accent, '40'),
    bubbleText: '#111111',
    inputShell: '#FFFFFF',
    inputText: '#111111',
    inputPlaceholder: '#8E8E93',
    sendBtn: accent,
    sendBtnText: '#FFFFFF',
  };
}

/**
 * ★ 改主题颜色只改这里 ★
 * light: true 走浅色配方，否则深色配方。
 */
export const AGENT_BRANDS: Record<AgentId, AgentBrand> = {
  food_scan: {
    light: true,
    bg: '#FFF8F3',
    accent: '#E86B4A',
    headerLink: '#C45638',
    togetherLabel: '与食识拍一起看见 ›',
  },
  palm_reader: {
    light: true,
    bg: '#F4F1F6',
    accent: '#8B6B9E',
    headerLink: '#6E547E',
    togetherLabel: '与手相师一起看见 ›',
  },
  food_explorer: {
    bg: '#12100E',
    accent: '#E8A04B',
    togetherLabel: '与零食分析一起看见 ›',
  },
  menu_translator: {
    bg: '#0A1214',
    accent: '#3DB8A8',
    togetherLabel: '与翻译师一起看见 ›',
  },
  stylist: {
    bg: '#120E12',
    accent: '#E87BA3',
    togetherLabel: '与穿搭检查师一起看见 ›',
  },
  local_guide: {
    bg: '#0C1210',
    accent: '#5BC48A',
    togetherLabel: '与本地向导一起看见 ›',
  },
  general_curiosity: {
    bg: colors.bg,
    accent: colors.accent,
    togetherLabel: '与好奇心一起看见 ›',
  },
  art_critic: {
    bg: '#100E14',
    accent: '#A78BFA',
    togetherLabel: '与艺术解读一起看见 ›',
  },
  design_critic: {
    bg: '#101210',
    accent: '#94A3B8',
    togetherLabel: '与设计灵感一起看见 ›',
  },
  text_reader: {
    bg: '#0E1116',
    accent: '#60A5FA',
    togetherLabel: '与文字解读一起看见 ›',
  },
};

const DEFAULT_BRAND: AgentBrand = {
  bg: colors.bg,
  accent: colors.accent,
  togetherLabel: '一起看见 ›',
};

/** 由品牌种子展开完整主题（含 chip / 气泡 / 输入框等） */
export function buildAgentTheme(brand: AgentBrand): AgentTheme {
  return brand.light ? buildLightTheme(brand) : buildDarkTheme(brand);
}

/** 按 AgentId 取完整主题 —— 组件侧统一用这个 */
export function getAgentTheme(agentId: AgentId): AgentTheme {
  return buildAgentTheme(AGENT_BRANDS[agentId] ?? DEFAULT_BRAND);
}

/** 预计算表（便于调试 / 文档展示） */
export const AGENT_THEMES: Record<AgentId, AgentTheme> = Object.fromEntries(
  (Object.keys(AGENT_BRANDS) as AgentId[]).map((id) => [
    id,
    buildAgentTheme(AGENT_BRANDS[id]!),
  ]),
) as Record<AgentId, AgentTheme>;
