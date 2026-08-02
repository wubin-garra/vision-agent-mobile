import { getAgentEmoji } from '@/constants/agentAssets';
import { AgentId } from '@/types/insight';

export interface PerspectiveItem {
  id: AgentId;
  label: string;
  /** @deprecated 请用 AgentIcon；保留字段兼容旧调用 */
  emoji: string;
  isNew?: boolean;
}

/** 首页「换个视角」：出国旅游能力优先展示 */
export const perspectives: PerspectiveItem[] = [
  { id: 'menu_translator', label: '翻译师', emoji: getAgentEmoji('menu_translator'), isNew: true },
  { id: 'food_explorer', label: '零食分析', emoji: getAgentEmoji('food_explorer') },
  { id: 'med_label', label: '药品说明', emoji: getAgentEmoji('med_label'), isNew: true },
  { id: 'sight_route', label: '景点路线', emoji: getAgentEmoji('sight_route'), isNew: true },
  { id: 'hotel_guide', label: '酒店入住', emoji: getAgentEmoji('hotel_guide'), isNew: true },
  { id: 'flight_info', label: '航班助手', emoji: getAgentEmoji('flight_info'), isNew: true },
  { id: 'local_guide', label: '本地向导', emoji: getAgentEmoji('local_guide') },
  { id: 'palm_reader', label: '看手相师', emoji: getAgentEmoji('palm_reader') },
  { id: 'stylist', label: '穿搭检查', emoji: getAgentEmoji('stylist') },
  { id: 'food_scan', label: '食识拍', emoji: getAgentEmoji('food_scan') },
  { id: 'general_curiosity', label: '好奇心', emoji: getAgentEmoji('general_curiosity') },
];

export const featuredPrompts = [
  '捕捉今天的甜点时刻，在这份甜蜜消失前拍下它。',
  '出国药盒看不懂？对准包装，一眼看懂用法与禁忌。',
  '登机牌拍一下，航班号、登机口和行程提示马上齐。',
];
