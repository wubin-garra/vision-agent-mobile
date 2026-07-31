import { AgentId } from '@/types/insight';

export interface PerspectiveItem {
  id: AgentId;
  label: string;
  emoji: string;
  isNew?: boolean;
}

export const perspectives: PerspectiveItem[] = [
  { id: 'palm_reader', label: '看手相师', emoji: '🤚', isNew: true },
  { id: 'local_guide', label: '本地向导', emoji: '🗺️', isNew: true },
  { id: 'menu_translator', label: '翻译师', emoji: '🌐', isNew: true },
  { id: 'stylist', label: '穿搭检查', emoji: '👔', isNew: true },
  { id: 'food_explorer', label: '美食探索', emoji: '🍜' },
  { id: 'food_scan', label: '食识拍', emoji: '🔎' },
  { id: 'general_curiosity', label: '好奇心', emoji: '✨' },
];

export const featuredPrompts = [
  '捕捉今天的甜点时刻，在这份甜蜜消失前拍下它。',
  '上海街头又冒热气了，今天那份降温的冰淇淋出现了吗？',
  '比起物体本身，也许你更迷恋那一秒钟的闪烁。',
];
