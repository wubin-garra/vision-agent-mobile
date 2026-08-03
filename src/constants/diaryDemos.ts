import { Image } from 'react-native';

import type { MemoryItem, StructuredInsight } from '@/types/insight';

const boardingPassUri = Image.resolveAssetSource(
  require('../../assets/demos/boarding_pass.png'),
).uri;
const mangoChocolateUri = Image.resolveAssetSource(
  require('../../assets/demos/mango_chocolate.png'),
).uri;
const teppanyakiUri = Image.resolveAssetSource(
  require('../../assets/demos/teppanyaki_flambe.png'),
).uri;
const sashimiUri = Image.resolveAssetSource(
  require('../../assets/demos/sashimi_platter.png'),
).uri;

export const DIARY_DEMO_ID_PREFIX = 'demo-diary-';

export function isDiaryDemoId(id: string): boolean {
  return id.startsWith(DIARY_DEMO_ID_PREFIX);
}

function makeMemory(input: {
  id: string;
  title: string;
  category: string;
  agent_id: MemoryItem['agent_id'];
  imageUri: string;
  created_at: string;
  insight: StructuredInsight;
}): MemoryItem {
  return {
    id: input.id,
    title: input.title,
    category: input.category,
    agent_id: input.agent_id,
    image_url: input.imageUri,
    thumbnail_url: input.imageUri,
    created_at: input.created_at,
    locale: 'zh-CN',
    insight: input.insight,
  };
}

/** 日记 / 值得细看：本地初始 Demo（不依赖后端，不改动首页旅游示例） */
export const diaryMemoryDemos: MemoryItem[] = [
  makeMemory({
    id: 'demo-diary-boarding_pass',
    title: '国泰中转：宿务 → 香港 → 上海',
    category: '航班信息 / 登机牌',
    agent_id: 'flight_info',
    imageUri: boardingPassUri,
    created_at: '2025-07-30T10:45:00.000Z',
    insight: {
      title: '国泰中转：宿务 → 香港 → 上海',
      subtitle: 'CX948 + CX328 · 经济舱 66H',
      category: '航班信息 / 登机牌',
      confidence: 0.9,
      narrative:
        '两张国泰登机牌拼出同一天的中转行程：先从宿务（CEB）飞香港（HKG），再转飞上海（SHA）。两段座位都是 66H，登机组别 4。',
      visible_clues: [
        'WU/YIROU MISS',
        'CX948 CEB→HKG 12:00 Gate 22AB',
        'CX328 HKG→SHA 18:25 Terminal 1',
        'Seat 66H · ECONOMY · Group 4',
      ],
      context: {
        cultural: '国泰太平洋（Cathay Pacific）是 oneworld 联盟成员，香港枢纽中转非常常见。',
        historical: null,
        practical:
          '第一段 11:30 开始登机；第二段建议在香港预留充足转机时间，并留意登机口以机场屏幕为准。',
      },
      style_vocabulary: ['中转', '登机牌', 'oneworld'],
      suggested_searches: ['Cathay Pacific CEB HKG', '香港机场转机指引'],
      next_actions: ['核对第二段登机口', '设置登机提醒'],
      agent_id: 'flight_info',
      disclaimer: '航班动态以航司/机场官方为准，登机口可能随时变更。',
      flight_info: {
        airline: '国泰航空 Cathay Pacific',
        flight_number: 'CX948 / CX328',
        passenger: 'WU/YIROU',
        booking_ref: null,
        seat: '66H',
        cabin: 'Economy',
        departure: {
          airport: 'CEB',
          time: '12:00',
          terminal: '2',
          gate: '22AB',
        },
        arrival: {
          airport: 'SHA',
          time: '经 HKG 中转 · 第二段 18:25 起飞',
          terminal: '1（HKG 出发）',
          gate: null,
        },
        status_notes: '第二段登机口空白，请以香港机场实时屏幕为准',
        timeline_tips: [
          '第一段登机时间 11:30，请提前 35 分钟到登机口',
          '闸口起飞前 15 分钟关闭',
          '香港中转请预留过境与步行时间，第二段 17:50 开始登机',
        ],
      },
      explore_chips: {
        culinary: [],
        nearby: ['香港机场怎么转机？', '建议提前多久到登机口？', '行李会直挂到上海吗？'],
      },
    },
  }),
  makeMemory({
    id: 'demo-diary-mango_chocolate',
    title: '菲律宾芒果巧克力球',
    category: '零食 / 水果巧克力',
    agent_id: 'food_explorer',
    imageUri: mangoChocolateUri,
    created_at: '2025-07-30T14:20:00.000Z',
    insight: {
      title: '菲律宾芒果巧克力球',
      subtitle: 'Profood · 50g 随身小包',
      category: '零食 / 水果巧克力',
      confidence: 0.86,
      narrative:
        '试了 Philippine Brand 的芒果巧克力球：外层偏苦的巧克力裹着橙黄芒果干内馅，甜而不腻，很适合旅途里当一口能量补给。',
      visible_clues: [
        'Philippine BRAND',
        'Mango Chocolate Balls',
        'NET WT. 1.76oz (50g)',
        'Halal / Kosher Check',
      ],
      context: {
        cultural: '菲律宾芒果常被加工成果干零食出口，和巧克力结合是经典伴手礼路线。',
        historical: 'Profood International Corp. 自 1978 年起做菲律宾水果制品。',
        practical: '50g 小包装易开封；巧克力怕热，热带机场建议尽快食用或放阴凉处。',
      },
      style_vocabulary: ['芒果干', '黑巧外壳', '伴手礼'],
      suggested_searches: ['Philippine Brand mango chocolate', 'Profood dried mango'],
      next_actions: ['看看配料关注点', '找类似水果巧克力'],
      agent_id: 'food_explorer',
      disclaimer: '零食分析与热量估算仅供参考，非营养医疗或过敏诊断建议。',
      snack_analysis: {
        brand: 'Philippine Brand（Profood）',
        product_name: 'Mango Chocolate Balls',
        snack_type: '水果夹心巧克力',
        taste_tags: ['果香甜', '可可微苦', '嚼感偏韧'],
        ingredients_highlight: ['菲律宾芒果', '巧克力涂层', '果干内馅'],
        caution_notes: ['含可可/乳制品相关成分可能', '糖分不低，建议小份品尝'],
        calories_estimate: '约 200–230 kcal/50g（估算）',
        serving_tip: '当旅途点心一次吃几颗即可，别当正餐替代',
      },
      flavor_notes: [
        { emoji: '🥭', label: '果心', value: '芒果干甜香，偏韧嚼' },
        { emoji: '🍫', label: '外皮', value: '深色巧克力，微苦压甜' },
        { emoji: '✈️', label: '场景', value: '伴手礼 / 登机小食' },
      ],
      allergens: [
        { category: '乳制品', detail: '巧克力涂层常见含奶，敏感者请看包装原文', emoji: '🥛' },
        { category: '大豆', detail: '部分巧克力使用大豆卵磷脂', emoji: '🫘' },
      ],
      explore_chips: {
        culinary: [
          '这款热量大概怎么样？',
          '和普通芒果干比有什么不同？',
          '还有哪些菲律宾伴手礼推荐？',
        ],
        nearby: [],
      },
      share_card: {
        headline: '芒果碰上巧克力',
        quote: '一口热带，刚好解馋。',
        cta: '继续拆零食',
      },
    },
  }),
  makeMemory({
    id: 'demo-diary-teppanyaki',
    title: '铁板烧的火焰秀',
    category: '餐饮 / 铁板料理',
    agent_id: 'food_scan',
    imageUri: teppanyakiUri,
    created_at: '2025-07-30T19:10:00.000Z',
    insight: {
      title: '铁板烧的火焰秀',
      subtitle: '高温、表演与一口焦香',
      category: '餐饮 / 铁板料理',
      confidence: 0.84,
      narrative:
        '夜场铁板前突然窜起橙黄火焰——这不只是做饭，更像一场热与节奏的演出。烤物在火光里上色，黄油一触即融，食欲也被点燃。',
      visible_clues: ['铁板平面高反射', '中心大簇火焰', '烤物上有圆形油脂/配料', '暗光餐厅氛围'],
      context: {
        cultural: '铁板烧（Teppanyaki）把烹饪过程变成桌边表演，火焰与锅铲节奏是体验的一部分。',
        historical: null,
        practical: '火光很大时注意距离与眼镜反光；想拍清楚可略降曝光、对焦火焰边缘。',
      },
      style_vocabulary: ['火焰秀', '桌边料理', '焦香'],
      suggested_searches: ['teppanyaki fire show', '铁板烧点餐建议'],
      next_actions: ['估算这餐营养', '问问怎么点更划算'],
      agent_id: 'food_scan',
      disclaimer: '营养估算仅供参考，非医疗饮食建议。',
      diet_summary: '偏高蛋白、中高脂肪的正餐场景；火焰表演本身不增加热量，配菜与酱汁才是变量。',
      nutrition: {
        calories_current: 720,
        calories_goal: 2000,
        carbs: { current: 42, goal: 250, unit: 'g', emoji: '🍚' },
        fat: { current: 38, goal: 65, unit: 'g', emoji: '🧈' },
        protein: { current: 48, goal: 80, unit: 'g', emoji: '🥩' },
      },
      allergens: [
        { category: '乳制品', detail: '铁板上常见黄油收汁', emoji: '🧈' },
        { category: '海鲜/蛋', detail: '套餐可能含虾、贝或蛋液，点单时需确认', emoji: '🦐' },
      ],
      nutrition_tips: [
        { title: '酱汁另碟', body: '照烧/蒜蓉酱另蘸，比直接浇在食材上更好控钠与糖。' },
        { title: '先蛋白后淀粉', body: '先吃肉与蔬菜，再吃炒饭，饱腹感更稳。' },
      ],
      explore_chips: {
        culinary: ['这餐热量大概多少？', '怎么点更清淡？', '铁板烧有什么禁忌要注意？'],
        nearby: [],
      },
      share_card: {
        headline: '火光里的一餐',
        quote: '味道之前，先被表演抓住。',
        cta: '继续探索美食',
      },
    },
  }),
  makeMemory({
    id: 'demo-diary-sashimi',
    title: '刺身拼盘：鲜味与花刀',
    category: '餐饮 / 日料刺身',
    agent_id: 'food_scan',
    imageUri: sashimiUri,
    created_at: '2025-07-30T20:05:00.000Z',
    insight: {
      title: '刺身拼盘：鲜味与花刀',
      subtitle: '三文鱼玫瑰 · 金枪鱼 · 白身鱼',
      category: '餐饮 / 日料刺身',
      confidence: 0.87,
      narrative:
        '一盘摆盘讲究的刺身：三文鱼卷成玫瑰，旁边是深红金枪鱼与透亮白身鱼，配上黄瓜扇、海藻、芥末与半片柠檬——既是晚餐，也是旅行里值得细看的一幕。',
      visible_clues: [
        '三文鱼玫瑰卷',
        '金枪鱼厚切',
        '白身鱼薄片',
        '芥末 / 柠檬 / 酱油碟',
      ],
      context: {
        cultural: '刺身强调时令与刀工，拼盘常按色泽与口感对比来摆，让眼睛先「尝」一口。',
        historical: null,
        practical: '生食注意新鲜与个人体质；蘸酱少许即可，以免盖过鱼本身的甜鲜。',
      },
      style_vocabulary: ['刺身拼盘', '花刀', '鲜味'],
      suggested_searches: ['sashimi platter', '三文鱼玫瑰摆盘'],
      next_actions: ['看看营养结构', '问问怎么蘸更地道'],
      agent_id: 'food_scan',
      disclaimer: '营养估算仅供参考；生食风险因人而异，请按自身情况选择。',
      diet_summary: '高蛋白、相对低碳水；脂肪主要来自三文鱼等油性鱼。',
      nutrition: {
        calories_current: 480,
        calories_goal: 2000,
        carbs: { current: 12, goal: 250, unit: 'g', emoji: '🥒' },
        fat: { current: 22, goal: 65, unit: 'g', emoji: '🥑' },
        protein: { current: 52, goal: 80, unit: 'g', emoji: '🐟' },
      },
      allergens: [
        { category: '鱼类', detail: '本盘含多种海鱼', emoji: '🐟' },
        { category: '大豆', detail: '酱油含大豆；芥末可能刺激肠胃', emoji: '🌿' },
      ],
      nutrition_tips: [
        { title: '酱油浅蘸', body: '鱼肉轻点酱油，比浸泡更能保留原味，也更控钠。' },
        { title: '配白身更均衡', body: '油性鱼与白身鱼搭配，口感与脂肪摄入更平衡。' },
      ],
      explore_chips: {
        culinary: ['这盘蛋白质高吗？', '不能吃生食可以点什么？', '三文鱼和金枪鱼怎么区分？'],
        nearby: [],
      },
      share_card: {
        headline: '鲜到值得细看',
        quote: '先被摆盘打动，再被口感留住。',
        cta: '继续探索美食',
      },
    },
  }),
];

/** 把本地日记 Demo 与后端记忆合并：Demo 置顶，保证每次打开都有默认可看内容 */
export function withDiaryDemoMemories(items: MemoryItem[]): MemoryItem[] {
  const real = items.filter((item) => !isDiaryDemoId(item.id));
  return [...diaryMemoryDemos, ...real];
}
