import type { ImageSourcePropType } from 'react-native';

import type { AgentId } from '@/types/insight';

/**
 * Agent 视觉资产 —— 唯一图标/emoji 入口。
 *
 * 使用场景：相机「选择镜头」圆形按钮、首页视角、详情头像。
 * - circleBg：Chance 式圆底色（画进 PNG，或 emoji 回退时的容器底）
 * - 物体本身用自然色，不要用洞察页主题色整物染色
 *
 * 替换精美图标步骤：
 * 1. 按 docs/agent-icon-prompts.md 生成 PNG（512×512，含彩色圆底）
 * 2. 放到 assets/agents/{fileName}
 * 3. 在下方 AGENT_ICON_SOURCES 里取消对应 require 注释
 */

/** 含相机「自动」模式 */
export type AgentAssetId = AgentId | 'auto';

export type AgentVisual = {
  id: AgentAssetId;
  /** 中文名（提示词 / 文档用） */
  label: string;
  /** 无图片时的回退 */
  emoji: string;
  /** 落盘文件名（相对 assets/agents/） */
  fileName: string;
  /**
   * Chance 式圆形底色（柔和马卡龙）。
   * 只铺在圆盘上；物体仍用自然色，勿把物体染成此色。
   */
  circleBg: string;
  /**
   * 物体自然配色说明（给 GPT / 设计）。
   * 不是洞察页 accent。
   */
  palette: string;
  /** 一句话视觉意象 */
  motif: string;
};

/**
 * ★ 改 emoji / 圆底 / 意象只改这里 ★
 * 图片 source 在 AGENT_ICON_SOURCES。
 */
export const AGENT_VISUALS: Record<AgentAssetId, AgentVisual> = {
  auto: {
    id: 'auto',
    label: '自动',
    emoji: '✨',
    fileName: 'auto.png',
    circleBg: '#E8EEF5',
    palette: '银白、浅灰、淡天蓝高光',
    motif: '智能星芒 / 棱镜分流，代表自动路由',
  },
  food_scan: {
    id: 'food_scan',
    label: '食识拍',
    emoji: '🔎',
    fileName: 'food_scan.png',
    circleBg: '#FFE8DE',
    palette: '瓷白餐盘、暖木色、金属放大镜；菜色自然',
    motif: '餐盘 + 小放大镜，食欲与识别感',
  },
  palm_reader: {
    id: 'palm_reader',
    label: '看手相师',
    emoji: '🤚',
    fileName: 'palm_reader.png',
    circleBg: '#EDE6F2',
    palette: '自然肤色（暖米色 / 浅棕），掌纹淡金或浅灰线；手不要染成紫色',
    motif: '张开的掌心与细腻掌纹，温柔神秘',
  },
  food_explorer: {
    id: 'food_explorer',
    label: '零食分析',
    emoji: '🍿',
    fileName: 'food_explorer.png',
    circleBg: '#FFF0D6',
    palette: '国外袋装零食（薯片/糖果袋箔面），红黄蓝条纹与银箔高光；无真品牌字',
    motif: '立着的海外零售零食袋，俏皮解馋',
  },
  menu_translator: {
    id: 'menu_translator',
    label: '翻译师',
    emoji: '🌐',
    fileName: 'menu_translator.png',
    circleBg: '#D9F3EF',
    palette: '米白菜单纸、深墨字块剪影、角落一点青绿点缀',
    motif: '菜单折页与双语气泡（抽象形，无真字）',
  },
  med_label: {
    id: 'med_label',
    label: '药品说明',
    emoji: '💊',
    fileName: 'med_label.png',
    circleBg: '#FDE8EA',
    palette: '药瓶/药盒自然白与标签色，十字或药片剪影',
    motif: '旅行药箱药瓶，可读标签感',
  },
  sight_route: {
    id: 'sight_route',
    label: '景点路线',
    emoji: '🧭',
    fileName: 'sight_route.png',
    circleBg: '#DCECFF',
    palette: '折叠导览图、路线虚线、蓝色定位点',
    motif: '景点导览图与路线箭头',
  },
  hotel_guide: {
    id: 'hotel_guide',
    label: '酒店入住',
    emoji: '🏨',
    fileName: 'hotel_guide.png',
    circleBg: '#F5E6D8',
    palette: '房卡与钥匙剪影、暖米色酒店门厅感',
    motif: '酒店房卡 / 入住凭证',
  },
  flight_info: {
    id: 'flight_info',
    label: '航班助手',
    emoji: '✈️',
    fileName: 'flight_info.png',
    circleBg: '#E4ECFF',
    palette: '登机牌条码区抽象块、小飞机剪影、蓝灰票面',
    motif: '登机牌与航班信息',
  },
  stylist: {
    id: 'stylist',
    label: '穿搭检查师',
    emoji: '👗',
    fileName: 'stylist.png',
    circleBg: '#FCE4EC',
    palette: '金属衣架银灰、衣物藏青 / 米白 / 浅驼',
    motif: '衣架 + 衬衫或连衣裙剪影',
  },
  local_guide: {
    id: 'local_guide',
    label: '本地向导',
    emoji: '🗺️',
    fileName: 'local_guide.png',
    circleBg: '#DFF5E8',
    palette: '纸质地图米黄绿、红色定位针、淡蓝水域',
    motif: '折叠地图与定位针',
  },
  general_curiosity: {
    id: 'general_curiosity',
    label: '好奇心',
    emoji: '🔍',
    fileName: 'general_curiosity.png',
    circleBg: '#E6E0FF',
    palette: '金属镜框银灰、镜片淡金折射；星点暖黄',
    motif: '放大镜里的小宇宙 / 好奇星光',
  },
  art_critic: {
    id: 'art_critic',
    label: '艺术解读',
    emoji: '🎨',
    fileName: 'art_critic.png',
    circleBg: '#EDE4FF',
    palette: '木色画框、画布米白、笔触多色但克制',
    motif: '画框与调色盘笔触',
  },
  design_critic: {
    id: 'design_critic',
    label: '设计灵感',
    emoji: '✏️',
    fileName: 'design_critic.png',
    circleBg: '#E8ECF0',
    palette: '尺子木色 / 银灰、几何体白与浅灰',
    motif: '尺子与几何形体',
  },
  text_reader: {
    id: 'text_reader',
    label: '文字解读',
    emoji: '📄',
    fileName: 'text_reader.png',
    circleBg: '#DCEBFF',
    palette: '白纸、浅灰字行剪影、淡蓝高亮条',
    motif: '书页与高亮文字块（无真字）',
  },
};

/**
 * 生成好的 PNG 放进 assets/agents/ 后，在此取消注释即可启用。
 * Metro 要求静态 require，不可动态路径。
 */
export const AGENT_ICON_SOURCES: Partial<Record<AgentAssetId, ImageSourcePropType>> = {
  auto: require('../../assets/agents/auto.png'),
  food_scan: require('../../assets/agents/food_scan.png'),
  palm_reader: require('../../assets/agents/palm_reader.png'),
  food_explorer: require('../../assets/agents/food_explorer.png'),
  menu_translator: require('../../assets/agents/menu_translator.png'),
  stylist: require('../../assets/agents/stylist.png'),
  local_guide: require('../../assets/agents/local_guide.png'),
  general_curiosity: require('../../assets/agents/general_curiosity.png'),
  // med_label: require('../../assets/agents/med_label.png'),
  // sight_route: require('../../assets/agents/sight_route.png'),
  // hotel_guide: require('../../assets/agents/hotel_guide.png'),
  // flight_info: require('../../assets/agents/flight_info.png'),
  // art_critic: require('../../assets/agents/art_critic.png'),
  // design_critic: require('../../assets/agents/design_critic.png'),
  // text_reader: require('../../assets/agents/text_reader.png'),
};

export function getAgentVisual(id: AgentAssetId): AgentVisual {
  return AGENT_VISUALS[id] ?? AGENT_VISUALS.general_curiosity;
}

export function getAgentEmoji(id: AgentAssetId): string {
  return getAgentVisual(id).emoji;
}

export function getAgentCircleBg(id: AgentAssetId): string {
  return getAgentVisual(id).circleBg;
}

export function getAgentIconSource(id: AgentAssetId): ImageSourcePropType | undefined {
  return AGENT_ICON_SOURCES[id];
}

export function hasAgentIcon(id: AgentAssetId): boolean {
  return AGENT_ICON_SOURCES[id] != null;
}
