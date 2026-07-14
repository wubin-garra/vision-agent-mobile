import type { AgentId, StructuredInsight } from './insight';

export type MainTabParamList = {
  Home: undefined;
  Camera: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Points: { tab?: 'invite' | 'redeem' | 'rules' } | undefined;
  Insight: {
    memoryId: string;
    imageUri: string;
    insight: StructuredInsight;
    followupChips: string[];
    agentId: AgentId;
    /** 从日记/历史进入时置顶阅读；拍照分析后为 fresh */
    entryMode?: 'history' | 'fresh';
    /** 食识拍分析时的思考步骤（拍照流程传入，历史记录可缺省） */
    thinkingSteps?: string[];
  };
};

export type { AgentId, StructuredInsight } from './insight';
