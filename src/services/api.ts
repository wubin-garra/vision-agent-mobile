import { API_BASE_URL, buildApiUrl } from '@/constants/config';
import type {
  AgentId,
  AgentInfo,
  AnalyzeResponse,
  FollowUpItem,
  FollowUpResponse,
  MemoryDetailResponse,
  MemoryItem,
  StructuredInsight,
} from '@/types/insight';
import type { PosterData } from '@/components/SharePosterCard';
import { assertUploadSuccess, uploadImageMultipart } from '@/utils/imageUpload';
import { prepareImageForUpload } from '@/utils/prepareImage';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function resolveMediaUrls<T extends { image_url: string; thumbnail_url: string }>(
  data: T,
): T {
  return {
    ...data,
    image_url: data.image_url.startsWith('http')
      ? data.image_url
      : `${API_BASE_URL}${data.image_url}`,
    thumbnail_url: data.thumbnail_url.startsWith('http')
      ? data.thumbnail_url
      : `${API_BASE_URL}${data.thumbnail_url}`,
  };
}

function buildAnalyzeParameters(options?: {
  locale?: string;
  agentOverride?: AgentId;
  latitude?: number;
  longitude?: number;
}): Record<string, string> {
  const parameters: Record<string, string> = {
    locale: options?.locale ?? 'zh-CN',
  };
  if (options?.agentOverride) {
    parameters.agent_override = options.agentOverride;
  }
  if (options?.latitude != null) {
    parameters.latitude = String(options.latitude);
  }
  if (options?.longitude != null) {
    parameters.longitude = String(options.longitude);
  }
  return parameters;
}

export async function analyzeImage(
  imageUri: string,
  options?: {
    locale?: string;
    agentOverride?: AgentId;
    latitude?: number;
    longitude?: number;
  },
): Promise<AnalyzeResponse> {
  const uploadUri = await prepareImageForUpload(imageUri);
  const result = await uploadImageMultipart(
    '/v1/analyze',
    uploadUri,
    buildAnalyzeParameters(options),
  );
  const data = JSON.parse(assertUploadSuccess(result)) as AnalyzeResponse & {
    image_url: string;
  };
  return resolveMediaUrls(data);
}

export interface StreamAnalyzeCallbacks {
  onStatus?: (stage: string) => void;
  onAgent?: (agentId: AgentId) => void;
  onThinking?: (payload: { step: string; index: number }) => void;
  onPartial?: (partial: { title: string; category: string; confidence: number }) => void;
  onComplete?: (result: AnalyzeResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * 拍照分析入口。
 * 不用 /v1/analyze/stream：Expo FileSystem.uploadAsync 对 SSE 经常空 body，会导致分析失败。
 * 保留 onStatus/onThinking 等回调接口，供食品扫描等 UI 驱动本地思考动画。
 */
export async function analyzeImageStream(
  imageUri: string,
  callbacks: StreamAnalyzeCallbacks,
  options?: {
    locale?: string;
    agentOverride?: AgentId;
    latitude?: number;
    longitude?: number;
  },
): Promise<AnalyzeResponse | null> {
  try {
    callbacks.onStatus?.('captioning');
    callbacks.onStatus?.('analyzing');
    const result = await analyzeImage(imageUri, options);
    callbacks.onAgent?.(result.agent_id);
    callbacks.onPartial?.({
      title: result.insight.title,
      category: result.insight.category,
      confidence: result.insight.confidence,
    });
    callbacks.onComplete?.(result);
    return result;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('分析失败');
    callbacks.onError?.(err);
    throw err;
  }
}

export async function followUp(
  memoryId: string,
  question: string,
  options?: {
    locale?: string;
    latitude?: number;
    longitude?: number;
  },
): Promise<FollowUpResponse> {
  const locale = options?.locale ?? 'zh-CN';
  const body: Record<string, unknown> = {
    memory_id: memoryId,
    question,
    locale,
  };
  if (options?.latitude != null && options?.longitude != null) {
    body.latitude = options.latitude;
    body.longitude = options.longitude;
  }
  const response = await fetch(buildApiUrl('/v1/followup'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<FollowUpResponse>(response);
}

export async function getMemory(memoryId: string): Promise<MemoryDetailResponse> {
  const response = await fetch(buildApiUrl(`/v1/memories/${memoryId}`));
  const data = await handleResponse<MemoryDetailResponse>(response);
  return {
    ...data,
    memory: {
      ...data.memory,
      image_url: data.memory.image_url.startsWith('http')
        ? data.memory.image_url
        : `${API_BASE_URL}${data.memory.image_url}`,
      thumbnail_url: data.memory.thumbnail_url.startsWith('http')
        ? data.memory.thumbnail_url
        : `${API_BASE_URL}${data.memory.thumbnail_url}`,
    },
    followups: data.followups ?? [],
  };
}

export function mapFollowUpsToQA(followups: FollowUpItem[]) {
  return followups.map((item) => ({
    question: item.question,
    answer: item.answer,
    structuredAnswer: item.structured_answer ?? undefined,
  }));
}

export async function listMemories(): Promise<MemoryItem[]> {
  const response = await fetch(buildApiUrl('/v1/memories'));
  const data = await handleResponse<{ items: MemoryItem[] }>(response);
  return data.items.map((item) => ({
    ...item,
    image_url: item.image_url.startsWith('http')
      ? item.image_url
      : `${API_BASE_URL}${item.image_url}`,
    thumbnail_url: item.thumbnail_url.startsWith('http')
      ? item.thumbnail_url
      : `${API_BASE_URL}${item.thumbnail_url}`,
  }));
}

export async function deleteMemory(memoryId: string): Promise<void> {
  const response = await fetch(buildApiUrl(`/v1/memories/${memoryId}`), {
    method: 'DELETE',
  });
  await handleResponse<{ ok: boolean }>(response);
}

export async function listAgents(): Promise<AgentInfo[]> {
  const response = await fetch(buildApiUrl('/v1/agents'));
  const data = await handleResponse<{ agents: AgentInfo[] }>(response);
  return data.agents;
}

export async function requestTTS(text: string, locale = 'zh-CN') {
  const response = await fetch(buildApiUrl('/v1/tts'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, locale }),
  });
  return handleResponse<{ mode: string; text?: string; audio_base64?: string }>(response);
}

export async function requestSharePoster(payload: { memory_id: string }) {
  const response = await fetch(buildApiUrl('/v1/share/poster'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ poster: PosterData }>(response);
}

export function buildInsightSummary(insight: StructuredInsight): string {
  if (insight.share_card?.quote) {
    return insight.share_card.quote;
  }
  if (insight.narrative) {
    return insight.narrative.slice(0, 160);
  }
  const parts = [insight.subtitle, insight.context.cultural, insight.context.practical]
    .filter(Boolean)
    .join(' ');
  return parts.slice(0, 160);
}

export function buildPosterData(insight: StructuredInsight): PosterData {
  const share = insight.share_card;
  const nutritionLine = insight.nutrition
    ? `🔥 ${insight.nutrition.calories_current}kcal`
    : undefined;
  return {
    headline: share?.headline || insight.title,
    subtitle: insight.subtitle || insight.category,
    quote: share?.quote || insight.narrative || buildInsightSummary(insight),
    cta: share?.cta || nutritionLine || insight.context.practical || undefined,
    brand: 'Vision Agent',
    signature: 'Seeing with Vision Agent',
  };
}
