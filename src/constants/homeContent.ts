import { AgentId } from '@/types/insight';

export interface PerspectiveItem {
  id: AgentId;
  label: string;
  emoji: string;
  isNew?: boolean;
}

export const perspectives: PerspectiveItem[] = [
  { id: 'local_guide', label: '本地向导', emoji: '🗺️', isNew: true },
  { id: 'art_critic', label: '艺术解读', emoji: '🎨', isNew: true },
  { id: 'stylist', label: '穿搭检查', emoji: '👔', isNew: true },
  { id: 'food_explorer', label: '美食探索', emoji: '🍜' },
  { id: 'design_critic', label: '设计灵感', emoji: '🪑' },
  { id: 'text_reader', label: '文字识别', emoji: '📝' },
  { id: 'general_curiosity', label: '好奇心', emoji: '✨' },
];

export const featuredPrompts = [
  '捕捉今天的甜点时刻，在这份甜蜜消失前拍下它。',
  '上海街头又冒热气了，今天那份降温的冰淇淋出现了吗？',
  '比起物体本身，也许你更迷恋那一秒钟的闪烁。',
];
