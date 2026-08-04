import type { AgentId, AgentMismatchInfo } from '@/types/insight';
import { AGENT_LABELS } from '@/constants/config';

function labelOf(agent: AgentId | string): string {
  if (agent === 'general_curiosity') return '智能解读';
  return AGENT_LABELS[agent] ?? agent;
}

/** 后端未返回 mismatch 时，用请求/实际 agent 差生成引导文案 */
export function buildClientAgentMismatch(
  requested: AgentId,
  actual: AgentId,
): AgentMismatchInfo {
  return {
    requested_agent: requested,
    suggested_agent: actual,
    title: '换一张照片试试',
    message: `这张更适合${labelOf(actual)}。想看${labelOf(requested)}，重新拍一张更对题的照片。`,
    reason: 'agent_id_mismatch',
  };
}

export function resolveAnalyzeMismatch(input: {
  requestedMode: AgentId | 'auto';
  resultAgentId: AgentId;
  serverMismatch?: AgentMismatchInfo | null;
  insight?: {
    title?: string | null;
    narrative?: string | null;
    confidence?: number;
    snack_analysis?: { snack_type?: string; calories_estimate?: string | null } | null;
  };
}): AgentMismatchInfo | null {
  if (input.requestedMode === 'auto') return null;

  if (input.serverMismatch) {
    return {
      ...input.serverMismatch,
      title: input.serverMismatch.title || '换一张照片试试',
    };
  }

  if (input.resultAgentId !== input.requestedMode) {
    return buildClientAgentMismatch(input.requestedMode, input.resultAgentId);
  }

  const snackType = input.insight?.snack_analysis?.snack_type ?? '';
  const title = input.insight?.title ?? '';
  if (
    input.requestedMode === 'food_explorer' &&
    (/非食品|不可食用/.test(snackType) || /不可食用/.test(title))
  ) {
    return {
      requested_agent: input.requestedMode,
      suggested_agent: 'general_curiosity',
      title: '换一张照片试试',
      message:
        '这张更像日化/清洁类物品，不适合零食分析。想拆零食包装，请换一张食品照片；也可继续用智能解读查看。',
      reason: 'non_edible_snack',
    };
  }

  return null;
}
