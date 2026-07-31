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
    description: '自动模式会根据画面内容智能路由到本地向导、美食、穿搭、翻译等专家，无需手动切换。',
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
    id: 'palm_reader',
    label: '看手相师',
    emoji: '🤚',
    prompt: '掌心朝上对准轮廓，让纹路清晰可见。',
    description: '描摹感情线、智慧线、生命线与事业线，可选生日结合星座，给出温柔的自我觉察解读。',
  },
  {
    id: 'food_explorer',
    label: '零食分析',
    emoji: '🍿',
    prompt: '对准零食包装或小食，了解成分、风味与食用提示。',
    description: '识别零食品类与口味，解读配料亮点、过敏原与是否适合当下解馋。',
  },
  {
    id: 'local_guide',
    label: '本地向导',
    emoji: '🗺️',
    prompt: '拍下地标或街景，获取地点解读与游玩建议。',
    description: '结合位置信息，讲述地点历史、文化意义，并给出实用的探索路线与小贴士。',
  },
  {
    id: 'menu_translator',
    label: '翻译师',
    emoji: '🌐',
    prompt: '对准菜单或外文菜名，获取清晰翻译与点餐提示。',
    description: '识别菜单文字，译成你的语言，并补充风味、过敏原与点餐小贴士。',
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
