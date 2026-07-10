import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

/** 确保 API 地址带 http:// 协议 */
export function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return `http:${trimmed}`;
  return `http://${trimmed.replace(/^\/+/, '')}`;
}

/** 从 Metro / Expo 开发地址提取局域网 IP */
function parseLanHost(uri?: string | null): string | null {
  if (!uri) return null;
  const withoutScheme = uri.replace(/^[a-z+]+:\/\//i, '');
  const hostPort = withoutScheme.split('/')[0] ?? '';
  const host = hostPort.split(':')[0]?.trim();
  if (!host || host === 'localhost' || host === '127.0.0.1') return null;
  return host;
}

function resolveDevApiUrl(): string {
  const fromExtra = Constants.expoConfig?.extra?.apiBaseUrl;
  if (typeof fromExtra === 'string' && fromExtra.trim().length > 0) {
    return normalizeBaseUrl(fromExtra);
  }

  const hostCandidates = [
    parseLanHost(Constants.expoConfig?.hostUri),
    parseLanHost(Constants.expoGoConfig?.debuggerHost),
    parseLanHost(Constants.linkingUri),
    parseLanHost((Constants.manifest as { debuggerHost?: string } | null)?.debuggerHost),
  ].filter(Boolean) as string[];

  const lanHost = hostCandidates[0];
  if (lanHost) {
    return `http://${lanHost}:8000`;
  }

  if (Platform.OS === 'android' && !Device.isDevice) {
    return 'http://10.0.2.2:8000';
  }

  if (Platform.OS === 'ios' && !Device.isDevice) {
    return 'http://localhost:8000';
  }

  return 'http://请配置局域网IP:8000';
}

const envApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
export const API_BASE_URL =
  envApiUrl && envApiUrl.length > 0 ? normalizeBaseUrl(envApiUrl) : resolveDevApiUrl();

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export const API_MISCONFIGURED =
  API_BASE_URL.includes('请配置') || API_BASE_URL.includes('LAN_IP');

export const AGENT_LABELS: Record<string, string> = {
  local_guide: '本地向导',
  art_critic: '艺术评论家',
  design_critic: '设计评论家',
  stylist: '造型师',
  food_explorer: '美食探索',
  text_reader: '文字解读',
  general_curiosity: '好奇心',
};

export function formatApiError(error: unknown): string {
  if (API_MISCONFIGURED) {
    return (
      '未配置后端地址。\n\n' +
      '真机调试请在 vision-agent-mobile/.env 设置：\n' +
      'EXPO_PUBLIC_API_URL=http://你的电脑IP:8000\n\n' +
      'Windows 运行 ipconfig 查看 IPv4 地址，配置后重启 npm start。'
    );
  }

  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (
    lower.includes('timeout') ||
    lower.includes('timed out') ||
    lower.includes('network request failed') ||
    lower.includes('connection') ||
    lower.includes('failed to connect') ||
    lower.includes('10.0.2.2')
  ) {
    return (
      `无法连接后端 (${API_BASE_URL})\n\n` +
      '常见原因：电脑 IP 变了（重新运行 ipconfig 查看）。\n\n' +
      '请确认：\n' +
      '1. 后端已启动：uvicorn app.main:app --host 0.0.0.0 --port 8000\n' +
      '2. .env 更新为：EXPO_PUBLIC_API_URL=http://当前电脑IP:8000\n' +
      '3. 重启 npm start 并 Reload App\n' +
      '4. 手机浏览器打开 http://电脑IP:8000/health 能访问'
    );
  }

  return message || '请稍后重试';
}
