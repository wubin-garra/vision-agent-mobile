export const FOOD_SCAN_THINKING_STEPS = [
  '检查图像是否包含食物',
  '识别主要食材与份量',
  '估算热量与三大营养素',
  '生成饮食建议与过敏原提示',
];

/** 分析浮层每步最少停留时长（最后一项 0 = 保持到分析结束） */
export const FOOD_SCAN_THINKING_STEP_DURATIONS_MS = [3200, 3400, 3600, 0];

/** 分析阶段轮换文案（弱化等待感，不展示秒数） */
export const FOOD_SCAN_STAGE_PHRASES: Record<string, string[]> = {
  captioning: ['扫描画面中的食材…', '读取色彩与摆盘层次…', '确认这是一顿可分析的正餐…'],
  routing: ['正在匹配食识拍分析…', '准备营养估算模型…'],
  analyzing: ['估算份量与热量配比…', '计算碳水、脂肪与蛋白质…', '整理过敏原与饮食建议…'],
  default: ['与食识拍一起看见这顿饭…', '正在理解营养信息…'],
};

/** 每个思考步骤下的动态子文案 */
export const FOOD_SCAN_STEP_DETAILS: Record<string, string[]> = {
  '检查图像是否包含食物': ['识别餐盘边界与主体区域', '区分主菜、配菜与装饰'],
  '识别主要食材与份量': ['标注蛋白质来源', '估算碳水与油脂占比'],
  '估算热量与三大营养素': ['对照常见日摄入目标', '校准热量密度'],
  '生成饮食建议与过敏原提示': ['归纳可执行饮食小贴士', '标注潜在过敏原'],
};

/** 底部输入框轮换提示 */
export const FOOD_SCAN_INPUT_HINTS = [
  '我在思考这顿饭的营养…',
  '稍等，正在估算热量与营养素…',
  '马上为你整理饮食建议…',
  '分析接近完成…',
];

/** Chance 风格思考过程分组（回顾弹层用） */
export const FOOD_SCAN_THINKING_GROUPS = [
  {
    id: 'captioning',
    title: '分析图像',
    steps: ['检查图像是否包含食物'],
  },
  {
    id: 'analyzing',
    title: '分析营养',
    steps: [
      '识别主要食材与份量',
      '估算热量与三大营养素',
      '生成饮食建议与过敏原提示',
    ],
  },
] as const;

export const FOOD_SCAN_STAGE_LABELS: Record<string, string> = {
  captioning: '分析图像',
  routing: '选择食识拍',
  analyzing: '生成营养报告',
};
