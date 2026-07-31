export const PALM_READER_THINKING_STEPS = [
  '确认画面中的掌心与主线',
  '描摹感情线、智慧线与生命线',
  '解读事业线与性格光谱',
  '结合生日生成专属洞察',
];

/** 分析浮层每步最少停留时长（最后一项 0 = 保持到分析结束） */
export const PALM_READER_THINKING_STEP_DURATIONS_MS = [3200, 3400, 3600, 0];

export const PALM_READER_STAGE_PHRASES: Record<string, string[]> = {
  captioning: ['对准掌心，读取纹路走向…', '确认四条主线是否清晰…', '感受掌形与生命力…'],
  routing: ['正在匹配看手相师…', '准备掌纹解读模型…'],
  analyzing: ['描摹感情线与智慧线…', '整理事业线与年龄节点…', '编织性格光谱与金句…'],
  default: ['与手相师一起看见…', '正在理解掌纹信息…'],
};

export const PALM_READER_STEP_DETAILS: Record<string, string[]> = {
  '确认画面中的掌心与主线': ['识别掌心朝向与边界', '区分主线与细纹'],
  '描摹感情线、智慧线与生命线': ['标注感情线末端方向', '读取智慧线深浅与长度'],
  '解读事业线与性格光谱': ['定位事业线上升轨迹', '校准理性/感性光谱'],
  '结合生日生成专属洞察': ['融合星座气质', '整理可分享的内省金句'],
};

export const PALM_READER_INPUT_HINTS = [
  '我在思考掌纹里的节奏…',
  '稍等，正在描摹四条主线…',
  '马上为你整理性格光谱…',
  '分析接近完成…',
];

export const PALM_READER_THINKING_GROUPS = [
  {
    id: 'captioning',
    title: '分析掌心',
    steps: ['确认画面中的掌心与主线'],
  },
  {
    id: 'analyzing',
    title: '解读掌纹',
    steps: [
      '描摹感情线、智慧线与生命线',
      '解读事业线与性格光谱',
      '结合生日生成专属洞察',
    ],
  },
] as const;

export const PALM_READER_STAGE_LABELS: Record<string, string> = {
  captioning: '分析掌心',
  routing: '选择看手相师',
  analyzing: '生成手相洞察',
};

/** 无模型 path 时的默认叠加轨迹（左手掌心朝上常见布局） */
export const DEFAULT_PALM_LINE_PATHS: Record<
  string,
  { x: number; y: number }[]
> = {
  heart: [
    { x: 28, y: 22 },
    { x: 48, y: 20 },
    { x: 72, y: 24 },
  ],
  head: [
    { x: 30, y: 38 },
    { x: 55, y: 40 },
    { x: 78, y: 44 },
  ],
  life: [
    { x: 42, y: 28 },
    { x: 34, y: 48 },
    { x: 36, y: 72 },
  ],
  career: [
    { x: 52, y: 78 },
    { x: 54, y: 55 },
    { x: 56, y: 32 },
  ],
};
