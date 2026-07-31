export const PALM_READER_THINKING_STEPS = [
  '上传掌心照片',
  '确认画面中的掌心与主线',
  '描摹感情线、智慧线与生命线',
  '解读事业线与性格光谱',
  '结合生日生成专属洞察',
];

/** 分析浮层每步最少停留时长（最后一项 0 = 保持到分析结束） */
export const PALM_READER_THINKING_STEP_DURATIONS_MS = [2800, 5200, 5600, 6000, 0];

export const PALM_READER_STAGE_PHRASES: Record<string, string[]> = {
  uploading: ['正在上传掌心照片…', '压缩画质，保留纹路细节…', '图片传输中，稍等片刻…'],
  captioning: ['对准掌心，读取纹路走向…', '确认四条主线是否清晰…', '感受掌形与生命力…'],
  routing: ['正在匹配看手相师…', '准备掌纹解读模型…'],
  analyzing: ['描摹感情线与智慧线…', '整理事业线与年龄节点…', '编织性格光谱与金句…'],
  default: ['与手相师一起看见…', '正在理解掌纹信息…'],
};

export const PALM_READER_STEP_DETAILS: Record<string, string[]> = {
  '上传掌心照片': ['优化分辨率以便描摹纹路', '加密传输到分析服务'],
  '确认画面中的掌心与主线': ['识别掌心朝向与边界', '区分主线与细纹'],
  '描摹感情线、智慧线与生命线': ['标注感情线末端方向', '读取智慧线深浅与长度'],
  '解读事业线与性格光谱': ['定位事业线上升轨迹', '校准理性/感性光谱'],
  '结合生日生成专属洞察': ['融合星座气质', '整理可分享的内省金句'],
};

export const PALM_READER_INPUT_HINTS = [
  '先把掌心照片稳稳上传…',
  '我在思考掌纹里的节奏…',
  '稍等，正在描摹四条主线…',
  '马上为你整理性格光谱…',
  '分析接近完成…',
];

export const PALM_READER_THINKING_GROUPS = [
  {
    id: 'uploading',
    title: '上传图片',
    steps: ['上传掌心照片'],
  },
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
  uploading: '上传图片',
  captioning: '分析掌心',
  routing: '选择看手相师',
  analyzing: '生成手相洞察',
};

/** 无模型 path 时的默认叠加轨迹（仅兜底；正常应由视觉模型贴合真实纹路输出） */
export const DEFAULT_PALM_LINE_PATHS: Record<
  string,
  { x: number; y: number }[]
> = {
  heart: [
    { x: 22, y: 28 },
    { x: 35, y: 26 },
    { x: 48, y: 24 },
    { x: 62, y: 25 },
    { x: 74, y: 28 },
    { x: 82, y: 32 },
  ],
  head: [
    { x: 28, y: 42 },
    { x: 40, y: 43 },
    { x: 55, y: 45 },
    { x: 68, y: 48 },
    { x: 80, y: 52 },
    { x: 88, y: 56 },
  ],
  life: [
    { x: 38, y: 30 },
    { x: 32, y: 40 },
    { x: 28, y: 52 },
    { x: 28, y: 64 },
    { x: 32, y: 76 },
    { x: 38, y: 86 },
  ],
  career: [
    { x: 52, y: 88 },
    { x: 53, y: 74 },
    { x: 54, y: 60 },
    { x: 55, y: 46 },
    { x: 56, y: 34 },
    { x: 57, y: 24 },
  ],
};
