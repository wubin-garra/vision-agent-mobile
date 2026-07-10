import { create } from 'zustand';

import type { AgentId, MemoryItem, StructuredInsight } from '@/types/insight';

interface SessionState {
  selectedAgent: AgentId | null;
  setSelectedAgent: (agent: AgentId | null) => void;
  memories: MemoryItem[];
  setMemories: (items: MemoryItem[]) => void;
  addMemory: (item: MemoryItem) => void;
  currentInsight: StructuredInsight | null;
  setCurrentInsight: (insight: StructuredInsight | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  selectedAgent: null,
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
  memories: [],
  setMemories: (items) => set({ memories: items }),
  addMemory: (item) => set((state) => ({ memories: [item, ...state.memories] })),
  currentInsight: null,
  setCurrentInsight: (insight) => set({ currentInsight: insight }),
}));
