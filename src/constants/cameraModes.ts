import { getAgentEmoji } from '@/constants/agentAssets';
import type { AgentId } from '@/types/insight';

export type CameraModeId = AgentId | 'auto';

export interface CameraModeItem {
  id: CameraModeId;
  label: string;
  /** @deprecated 请用 AgentIcon；保留字段兼容旧调用 */
  emoji: string;
  prompt: string;
  description: string;
}

export const cameraModes: CameraModeItem[] = [
  {
    id: 'auto',
    label: '自动',
    emoji: getAgentEmoji('auto'),
    prompt: '对准任何画面，让 AI 自动识别；只有非常确定时才交给专项镜头，否则做通用解读。',
    description:
      '自动识别场景。登机牌、药盒、菜单、正餐等特征非常明确时才进入专项；拿不准就走通用解读，避免误判。',
  },
  {
    id: 'stylist',
    label: '穿搭检查师',
    emoji: getAgentEmoji('stylist'),
    prompt: '拍下你的穿搭，获取风格评分和穿搭建议。',
    description: '分析配色、廓形与场合匹配度，给出可执行的穿搭改进建议与风格标签。',
  },
  {
    id: 'food_scan',
    label: '食识拍',
    emoji: getAgentEmoji('food_scan'),
    prompt: '扫描你的餐食，即可查看热量、蛋白质、碳水化合物等信息。',
    description: '识别盘中食材，估算热量与三大营养素，提供饮食建议与过敏原提示。',
  },
  {
    id: 'palm_reader',
    label: '看手相师',
    emoji: getAgentEmoji('palm_reader'),
    prompt: '掌心朝上对准轮廓，让纹路清晰可见。',
    description: '描摹感情线、智慧线、生命线与事业线，可选生日结合星座，给出温柔的自我觉察解读。',
  },
  {
    id: 'food_explorer',
    label: '零食分析',
    emoji: getAgentEmoji('food_explorer'),
    prompt: '对准零食包装袋/盒，了解成分、风味与食用提示。',
    description: '识别零售零食品类与口味，解读配料亮点、过敏原与是否适合当下解馋（正餐请用食识拍）。',
  },
  {
    id: 'menu_translator',
    label: '翻译师',
    emoji: getAgentEmoji('menu_translator'),
    prompt: '对准菜单或外文菜名，获取清晰翻译与点餐提示。',
    description: '识别菜单文字，译成你的语言，并补充风味、过敏原与点餐小贴士。',
  },
  {
    id: 'med_label',
    label: '药品说明',
    emoji: getAgentEmoji('med_label'),
    prompt: '对准药盒或说明书，快速看懂药名、用法与警示。',
    description: '出国药箱助手：翻译包装关键信息，提取剂量与禁忌提示（非医疗诊断）。',
  },
  {
    id: 'sight_route',
    label: '景点路线',
    emoji: getAgentEmoji('sight_route'),
    prompt: '拍景点、导览图或路牌，生成可走的半日/一日路线。',
    description: '规划有序站点、交通与购票提示；与「本地向导」的史话讲解互补。',
  },
  {
    id: 'hotel_guide',
    label: '酒店入住',
    emoji: getAgentEmoji('hotel_guide'),
    prompt: '对准确认单、门卡或入住邮件，理清入住步骤。',
    description: '提取确认号、时间与地址，给出到店可执行步骤与沟通提示。',
  },
  {
    id: 'flight_info',
    label: '航班助手',
    emoji: getAgentEmoji('flight_info'),
    prompt: '对准机票或登机牌，速览航班、登机口与行程提示。',
    description: '结构化航班信息，并提醒登机口可能变更、建议提前到场时间。',
  },
  {
    id: 'local_guide',
    label: '本地向导',
    emoji: getAgentEmoji('local_guide'),
    prompt: '拍下地标或街景，获取地点解读与游玩建议。',
    description: '结合位置信息，讲述地点历史、文化意义，并给出实用探索小贴士。',
  },
  {
    id: 'general_curiosity',
    label: '好奇心',
    emoji: getAgentEmoji('general_curiosity'),
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

/**
 * 镜头轮播排序：收藏在左 · 自动居中 · 其余在右。
 * auto 始终保留；收藏顺序按 favoriteIds。
 */
export function orderCameraModes(
  modes: CameraModeItem[],
  favoriteIds: CameraModeId[],
): CameraModeItem[] {
  const auto = modes.find((mode) => mode.id === 'auto');
  const byId = new Map(modes.map((mode) => [mode.id, mode]));
  const favorites = favoriteIds
    .filter((id) => id !== 'auto')
    .map((id) => byId.get(id))
    .filter((mode): mode is CameraModeItem => Boolean(mode));
  const favSet = new Set(favorites.map((mode) => mode.id));
  const rest = modes.filter((mode) => mode.id !== 'auto' && !favSet.has(mode.id));
  return auto ? [...favorites, auto, ...rest] : [...favorites, ...rest];
}
