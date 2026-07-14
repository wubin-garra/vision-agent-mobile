import type { AgentId } from '@/types/insight';

export type CameraModeId = AgentId | 'auto';

export interface CameraModeItem {
  id: CameraModeId;
  label: string;
  emoji: string;
  prompt: string;
  description: string;
}

export const cameraModes: CameraModeItem[] = [
  {
    id: 'auto',
    label: '自动',
    emoji: '✨',
    prompt: '对准任何画面，让 AI 自动选择最合适的解读视角。',
    description: '自动模式会根据画面内容智能路由到本地向导、美食、艺术、穿搭等专家，无需手动切换。',
  },
  {
    id: 'stylist',
    label: '穿搭检查师',
    emoji: '👗',
    prompt: '拍下你的穿搭，获取风格评分和穿搭建议。',
    description: '分析配色、廓形与场合匹配度，给出可执行的穿搭改进建议与风格标签。',
  },
  {
    id: 'food_scan',
    label: '食识拍',
    emoji: '🔎',
    prompt: '扫描你的餐食，即可查看热量、蛋白质、碳水化合物等信息。',
    description: '识别盘中食材，估算热量与三大营养素，提供饮食建议与过敏原提示。',
  },
  {
    id: 'food_explorer',
    label: '美食探索',
    emoji: '🍜',
    prompt: '对准美食，发现风味故事与周边推荐。',
    description: '解构菜品风味、文化背景与用餐场景，并推荐附近值得一试的餐厅或同类美食。',
  },
  {
    id: 'local_guide',
    label: '本地向导',
    emoji: '🗺️',
    prompt: '拍下地标或街景，获取地点解读与游玩建议。',
    description: '结合位置信息，讲述地点历史、文化意义，并给出实用的探索路线与小贴士。',
  },
  {
    id: 'art_critic',
    label: '艺术解读',
    emoji: '🎨',
    prompt: '对准艺术品或展览，获取专业解读。',
    description: '从构图、色彩、流派与创作背景出发，用易懂的语言带你读懂艺术。',
  },
  {
    id: 'design_critic',
    label: '设计灵感',
    emoji: '🪑',
    prompt: '拍下空间或物件，获取设计分析与灵感。',
    description: '解读材质、比例、风格语言，并提炼可复用的设计灵感与搭配思路。',
  },
  {
    id: 'text_reader',
    label: '文字识别',
    emoji: '📝',
    prompt: '对准文字内容，快速提取与解读。',
    description: '识别菜单、标牌、书籍段落等文字，并给出摘要、翻译或关键信息提取。',
  },
  {
    id: 'general_curiosity',
    label: '好奇心',
    emoji: '🔍',
    prompt: '拍下任何有趣的东西，满足你的好奇心。',
    description: '开放式探索模式，从多个角度解读画面，发现你没想到的有趣细节。',
  },
];

export function findCameraMode(id: CameraModeId): CameraModeItem {
  return cameraModes.find((mode) => mode.id === id) ?? cameraModes[0]!;
}

export function cameraModeToAgent(id: CameraModeId): AgentId | null {
  return id === 'auto' ? null : id;
}

export function agentToCameraMode(agent: AgentId | null): CameraModeId {
  return agent ?? 'auto';
}
