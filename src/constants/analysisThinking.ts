/**
 * 通用 / 零食 / 翻译师分析等待文案。
 * 食识拍、手相仍用各自专用常量文件。
 */

export type AnalysisThinkingVariant =
  | 'food_scan'
  | 'palm_reader'
  | 'snack'
  | 'menu_translator'
  | 'general';

type ThinkingPack = {
  steps: string[];
  durationsMs: number[];
  stagePhrases: Record<string, string[]>;
  stepDetails: Record<string, string[]>;
  inputHints: string[];
  stageLabels: Record<string, string>;
  fallbackTitle: string;
};

/** 自动模式与其它通用镜头 */
export const GENERAL_THINKING: ThinkingPack = {
  steps: [
    '上传并压缩图片',
    '读取画面主体与细节',
    '匹配最合适的解读视角',
    '生成结构化洞察',
    '整理可继续追问的线索',
  ],
  durationsMs: [2400, 4800, 5200, 5600, 0],
  stagePhrases: {
    uploading: ['正在上传照片…', '压缩画质，准备送入模型…', '图片传输中，稍等片刻…'],
    captioning: ['扫描画面主体…', '捕捉色彩、文字与结构…', '确认可解读的关键线索…'],
    routing: ['正在选择智能体…', '匹配最合适的解读视角…'],
    analyzing: ['编织洞察与建议…', '整理可见线索与背景…', '马上就好…'],
    default: ['正在理解这张照片…', '与你一起看见更多细节…'],
  },
  stepDetails: {
    '上传并压缩图片': ['优化分辨率以便识别', '加密传输到分析服务'],
    '读取画面主体与细节': ['区分前景与背景', '标注可读文字与物体'],
    '匹配最合适的解读视角': ['对照场景类型', '选择专项或开放解读'],
    '生成结构化洞察': ['组织标题与叙述', '补齐实用建议'],
    '整理可继续追问的线索': ['准备追问入口', '提炼可分享金句'],
  },
  inputHints: [
    '先把照片稳稳上传…',
    '我在看画面里的故事…',
    '稍等，正在组织洞察…',
    '马上为你整理结果…',
    '分析接近完成…',
  ],
  stageLabels: {
    uploading: '上传图片',
    captioning: '分析图像',
    routing: '选择智能体',
    analyzing: '生成洞察',
  },
  fallbackTitle: '正在分析',
};

/** 零食分析（food_explorer） */
export const SNACK_THINKING: ThinkingPack = {
  steps: [
    '上传零食照片',
    '识别包装与品名',
    '读取口味与配料线索',
    '整理过敏原与食用注意',
    '生成零食档案与建议',
  ],
  durationsMs: [2400, 4800, 5400, 5600, 0],
  stagePhrases: {
    uploading: ['正在上传零食照片…', '压缩包装细节，准备识别…'],
    captioning: ['扫描品名与口味标识…', '寻找配料与营养信息…'],
    routing: ['匹配零食分析…', '准备拆解这包小食…'],
    analyzing: ['归纳口味与口感…', '核对过敏原与注意点…', '估算热量与份量建议…'],
    default: ['与零食分析一起拆包装…', '正在理解这包小食…'],
  },
  stepDetails: {
    '上传零食照片': ['保留包装文字清晰度', '加密传输到分析服务'],
    '识别包装与品名': ['读取品牌与产品名', '确认零食品类'],
    '读取口味与配料线索': ['捕捉咸甜辣层次', '提取配料亮点'],
    '整理过敏原与食用注意': ['标注潜在过敏原', '给出份量小提示'],
    '生成零食档案与建议': ['汇总口味标签', '写好解馋金句'],
  },
  inputHints: [
    '包装字有点小，我再看一眼…',
    '正在拆解口味与配料…',
    '稍等，整理过敏原提示…',
    '马上生成零食档案…',
  ],
  stageLabels: {
    uploading: '上传图片',
    captioning: '识别包装',
    routing: '选择零食分析',
    analyzing: '生成零食档案',
  },
  fallbackTitle: '零食分析思考中',
};

/** 翻译师（menu_translator） */
export const MENU_TRANSLATOR_THINKING: ThinkingPack = {
  steps: [
    '上传菜单照片',
    '识别语言与栏位',
    '逐条读取菜名与价格',
    '翻译并标注忌口线索',
    '整理点餐提示',
  ],
  durationsMs: [2400, 4600, 5600, 5800, 0],
  stagePhrases: {
    uploading: ['正在上传菜单照片…', '保留文字清晰度，准备识别…'],
    captioning: ['判断源语言…', '扫描栏目与价位符号…'],
    routing: ['匹配翻译师…', '准备逐条对照翻译…'],
    analyzing: ['翻译可见菜名…', '标注海鲜/辣度等标签…', '整理点餐小贴士…'],
    default: ['与翻译师一起读菜单…', '正在对照原文与译文…'],
  },
  stepDetails: {
    '上传菜单照片': ['优先保留文字边缘', '加密传输到分析服务'],
    '识别语言与栏位': ['区分刺身/烤物等分区', '确认目标语言'],
    '逐条读取菜名与价格': ['抽取可读条目', '看不清的价格先跳过'],
    '翻译并标注忌口线索': ['原文 + 译文对照', '标出海鲜或推荐'],
    '整理点餐提示': ['给出忌口总览', '准备可追问的筛选'],
  },
  inputHints: [
    '菜单字有点密，我逐行看…',
    '正在对照原文与译文…',
    '稍等，整理忌口与推荐…',
    '马上生成点餐提示…',
  ],
  stageLabels: {
    uploading: '上传图片',
    captioning: '识别菜单',
    routing: '选择翻译师',
    analyzing: '生成对照翻译',
  },
  fallbackTitle: '翻译师思考中',
};

export function resolveThinkingPack(
  variant: AnalysisThinkingVariant,
): ThinkingPack {
  switch (variant) {
    case 'snack':
      return SNACK_THINKING;
    case 'menu_translator':
      return MENU_TRANSLATOR_THINKING;
    case 'general':
    default:
      return GENERAL_THINKING;
  }
}
