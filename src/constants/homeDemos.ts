import { getAgentVisual } from '@/constants/agentAssets';
import { AGENT_LABELS } from '@/constants/config';
import type { AgentId, StructuredInsight } from '@/types/insight';

export type HomeDemoItem = {
  id: string;
  agentId: AgentId;
  title: string;
  subtitle: string;
  category: string;
  /** 真实场景示意封面（不用智能体图标） */
  coverUri: string;
  insight: StructuredInsight;
  followupChips: string[];
};

/** 出国旅游新镜头：主页可点开的本地 Demo（不依赖后端 memory） */
export const travelHomeDemos: HomeDemoItem[] = [
  {
    id: 'demo-med_label',
    agentId: 'med_label',
    title: '布洛芬退烧止痛',
    subtitle: '药盒说明书 · 一眼看懂用法与禁忌',
    category: '药品说明',
    coverUri: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
    followupChips: ['有哪些禁忌人群？', '用法用量再说明一下', '旅行携带需要注意什么？'],
    insight: {
      title: '布洛芬退烧止痛',
      subtitle: '英文 → 中文',
      category: '药品说明 / 旅行药箱',
      confidence: 0.82,
      narrative: '这是一盒常见的布洛芬类止痛退烧药，包装为英文说明。',
      visible_clues: ['Ibuprofen 200mg', 'Pain Reliever', 'Keep out of reach of children'],
      context: {
        cultural: null,
        historical: null,
        practical: '出国随身带原包装，过安检保留说明书更稳妥。',
      },
      style_vocabulary: [],
      suggested_searches: [],
      next_actions: ['核对剂量', '查看禁忌'],
      agent_id: 'med_label',
      disclaimer: '非医疗诊断或用药建议，请遵医嘱与说明书原文。',
      med_label_reading: {
        drug_name: 'Ibuprofen',
        brand: 'DemoCare',
        active_ingredients: ['布洛芬 200mg'],
        usage: '用于缓解轻中度疼痛与发热（包装所示）',
        dosage: '成人每 4–6 小时 1 片，24 小时不超过包装上限',
        warnings: ['胃溃疡者慎用', '勿与其他含布洛芬产品叠服', '儿童用量需遵包装'],
        storage: '室温干燥处保存',
        translated_summary: '非处方止痛退烧药；先核对禁忌与剂量，不确定请问药师。',
        source_language: '英文',
      },
      explore_chips: {
        culinary: ['有哪些禁忌人群？', '用法用量再说明一下', '旅行携带需要注意什么？'],
        nearby: [],
      },
    },
  },
  {
    id: 'demo-sight_route',
    agentId: 'sight_route',
    title: '旧城区半日路线',
    subtitle: '导览图 · 少走回头路的 3.5 小时线',
    category: '景点路线',
    coverUri: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80',
    followupChips: ['附近还有什么值得去？', '下雨天怎么改路线？', '怎么买票最省事？'],
    insight: {
      title: '旧城区半日路线',
      subtitle: '约 3–4 小时 · 步行友好',
      category: '景点路线 / 旅行规划',
      confidence: 0.8,
      narrative: '画面像欧洲旧城区导览图，适合串一条少回头的半日线。',
      visible_clues: ['古城墙标识', '中央广场', '河边步道'],
      context: {
        cultural: '旧城区多为步行区，街巷适合慢慢拍。',
        historical: null,
        practical: '热门点建议上午进，避开游轮团高峰。',
      },
      style_vocabulary: [],
      suggested_searches: [],
      next_actions: ['优化步行路线', '找附近餐厅'],
      agent_id: 'sight_route',
      disclaimer: '开放时间与票务可能变动，请以官方信息为准。',
      sight_route: {
        place_name: '旧城区',
        area: '市中心',
        highlights: [
          { name: '中央广场', tip: '适合拍建筑立面' },
          { name: '河边步道', tip: '日落光线更好' },
          { name: '观景台', tip: '可俯瞰红屋顶' },
        ],
        suggested_route: ['中央广场', '主教堂外立面', '河边步道', '观景台', '回广场咖啡'],
        duration_estimate: '约 3.5 小时（含拍照）',
        transport_tips: ['广场地铁站出站即达', '旧城内建议步行，电瓶车有时段限制'],
        best_time: '上午 9–12 点人少光好',
        ticket_notes: '观景台可能单独购票，现场扫码即可',
      },
      explore_chips: {
        culinary: [],
        nearby: ['附近还有什么值得去？', '下雨天怎么改路线？', '怎么买票最省事？'],
      },
    },
  },
  {
    id: 'demo-hotel_guide',
    agentId: 'hotel_guide',
    title: '市中心酒店入住卡',
    subtitle: '确认单 · 确认号与到店步骤',
    category: '酒店入住',
    coverUri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    followupChips: ['怎么跟前台用英语说明？', '行李能提前寄放吗？', '附近交通怎么走？'],
    insight: {
      title: '市中心酒店入住卡',
      subtitle: '确认号 HX29K · 入住 15:00',
      category: '酒店入住 / 旅行住宿',
      confidence: 0.85,
      narrative: '这是一张酒店确认/入住凭证截图，关键信息比较齐全。',
      visible_clues: ['Hotel Nova', 'Confirmation HX29K', 'Check-in 15:00'],
      context: {
        cultural: null,
        historical: null,
        practical: '到店先报确认号与姓名；行李可问前台寄存。',
      },
      style_vocabulary: [],
      suggested_searches: [],
      next_actions: ['核对入住时间', '导航到酒店'],
      agent_id: 'hotel_guide',
      disclaimer: '以酒店确认邮件/前台信息为准。',
      hotel_guide: {
        hotel_name: 'Hotel Nova',
        confirmation_code: 'HX29K',
        guest_name: 'WANG / LEI',
        check_in: '15:00',
        check_out: '11:00',
        address: '12 River Street',
        room_type: 'Queen Room',
        steps: [
          '到大堂前台出示护照与确认号 HX29K',
          '核对入住晚数与房型 Queen Room',
          '领取房卡，问清早餐与 Wi‑Fi',
        ],
        amenities_notes: ['含早餐', '24h 前台'],
        wifi_or_access: '房卡刷电梯；Wi‑Fi 密码向前提取',
        contact: '+1 555 0100',
      },
      explore_chips: {
        culinary: [],
        nearby: ['怎么跟前台用英语说明？', '行李能提前寄放吗？', '附近交通怎么走？'],
      },
    },
  },
  {
    id: 'demo-flight_info',
    agentId: 'flight_info',
    title: 'CA983 上海→洛杉矶',
    subtitle: '登机牌 · 航班号、登机口与行程提示',
    category: '航班助手',
    coverUri: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
    followupChips: ['登机口怎么走？', '建议提前多久到机场？', '延误了怎么办？'],
    insight: {
      title: 'CA983 上海→洛杉矶',
      subtitle: 'T2 出发 · 建议提前 3 小时',
      category: '航班信息 / 登机牌',
      confidence: 0.88,
      narrative: '登机牌信息清晰：国航 CA983，浦东 T2 出发。',
      visible_clues: ['CA983', 'PVG T2', 'Seat 32A', 'Gate H15'],
      context: {
        cultural: null,
        historical: null,
        practical: '国际航班建议提前 3 小时到场，登机口可能变更。',
      },
      style_vocabulary: [],
      suggested_searches: [],
      next_actions: ['核对登机口', '设置提醒'],
      agent_id: 'flight_info',
      disclaimer: '航班动态以航司/机场官方为准，登机口可能随时变更。',
      flight_info: {
        airline: '中国国际航空',
        flight_number: 'CA983',
        passenger: 'WANG/LEI',
        booking_ref: 'ABCDEF',
        seat: '32A',
        cabin: 'Economy',
        departure: {
          airport: 'PVG',
          time: '13:20',
          terminal: 'T2',
          gate: 'H15',
        },
        arrival: {
          airport: 'LAX',
          time: '10:05',
          terminal: 'TBIT',
          gate: null,
        },
        status_notes: '登机口以机场屏幕为准，可能临时变更',
        timeline_tips: [
          '建议起飞前 3 小时到达机场',
          '值机截止通常在起飞前 60–90 分钟',
          '落地后注意海关与行李转盘信息',
        ],
      },
      explore_chips: {
        culinary: [],
        nearby: ['登机口怎么走？', '建议提前多久到机场？', '延误了怎么办？'],
      },
    },
  },
];

export function getDemoCoverColor(agentId: AgentId): string {
  return getAgentVisual(agentId).circleBg;
}

export function getDemoAgentLabel(agentId: AgentId): string {
  return AGENT_LABELS[agentId] ?? agentId;
}
