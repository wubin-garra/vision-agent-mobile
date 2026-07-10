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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
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

  const result = await uploadImageMultipart('/v1/analyze', imageUri, parameters);
  const data = JSON.parse(assertUploadSuccess(result)) as AnalyzeResponse & { image_url: string };

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

export interface StreamAnalyzeCallbacks {
  onStatus?: (stage: string) => void;
  onAgent?: (agentId: AgentId) => void;
  onPartial?: (partial: { title: string; category: string; confidence: number }) => void;
  onComplete?: (result: AnalyzeResponse) => void;
  onError?: (error: Error) => void;
}

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

  let result: AnalyzeResponse | null = null;

  try {
    const upload = await uploadImageMultipart('/v1/analyze/stream', imageUri, parameters);
    const text = assertUploadSuccess(upload);

    for (const block of text.split('\n\n')) {
      const lines = block.split('\n');
      let event = 'message';
      let data = '';
      for (const line of lines) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        if (line.startsWith('data:')) data = line.slice(5).trim();
      }
      if (!data) continue;

      const parsed = JSON.parse(data);
      if (event === 'status') callbacks.onStatus?.(parsed.stage);
      if (event === 'agent') callbacks.onAgent?.(parsed.agent_id);
      if (event === 'partial') callbacks.onPartial?.(parsed);
      if (event === 'complete') {
        const resolved: AnalyzeResponse = {
          ...parsed,
          image_url: parsed.image_url.startsWith('http')
            ? parsed.image_url
            : `${API_BASE_URL}${parsed.image_url}`,
          thumbnail_url: parsed.thumbnail_url.startsWith('http')
            ? parsed.thumbnail_url
            : `${API_BASE_URL}${parsed.thumbnail_url}`,
        };
        result = resolved;
        callbacks.onComplete?.(resolved);
      }
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error('分析失败');
    callbacks.onError?.(err);
    throw err;
  }

  return result;
}

export async function followUp(
  memoryId: string,
  question: string,
  locale = 'zh-CN',
): Promise<FollowUpResponse> {
  const response = await fetch(buildApiUrl('/v1/followup'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memory_id: memoryId, question, locale }),
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
  return {
    headline: share?.headline || insight.title,
    subtitle: insight.subtitle || insight.category,
    quote: share?.quote || insight.narrative || buildInsightSummary(insight),
    cta: share?.cta || insight.context.practical || undefined,
    brand: 'Vision Agent',
    signature: 'Seeing with Vision Agent',
  };
}
