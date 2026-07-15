import PostHog from 'posthog-react-native';

const API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY?.trim() ?? '';
const HOST =
  process.env.EXPO_PUBLIC_POSTHOG_HOST?.trim() || 'https://us.i.posthog.com';

export const isAnalyticsEnabled = API_KEY.length > 0;

/** 未配置 key 时禁用采集，避免开发环境误上报 */
export const posthog = new PostHog(API_KEY || 'phc_disabled', {
  host: HOST,
  disabled: !isAnalyticsEnabled,
  captureAppLifecycleEvents: isAnalyticsEnabled,
});

type AnalyticsValue = string | number | boolean | null | undefined;
export type AnalyticsProps = Record<string, AnalyticsValue>;

function cleanProperties(properties?: AnalyticsProps): Record<string, string | number | boolean | null> | undefined {
  if (!properties) return undefined;
  const next: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value === undefined) continue;
    next[key] = value;
  }
  return next;
}

export function track(event: string, properties?: AnalyticsProps): void {
  if (!isAnalyticsEnabled) return;
  posthog.capture(event, cleanProperties(properties));
}

export function trackScreen(name: string, properties?: AnalyticsProps): void {
  if (!isAnalyticsEnabled) return;
  posthog.screen(name, cleanProperties(properties));
}
