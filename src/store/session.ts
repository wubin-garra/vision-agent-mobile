import { create } from 'zustand';

import type { AgentId, MemoryItem, StructuredInsight } from '@/types/insight';

interface SessionState {
  selectedAgent: AgentId | null;
  setSelectedAgent: (agent: AgentId | null) => void;
  /** 看手相师：上次填写的生日 YYYY-MM-DD */
  birthday: string | null;
  setBirthday: (birthday: string | null) => void;
  memories: MemoryItem[];
  setMemories: (items: MemoryItem[]) => void;
  addMemory: (item: MemoryItem) => void;
  removeMemory: (id: string) => void;
  currentInsight: StructuredInsight | null;
  setCurrentInsight: (insight: StructuredInsight | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  selectedAgent: null,
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
  birthday: null,
  setBirthday: (birthday) => set({ birthday }),
  memories: [],
  setMemories: (items) => set({ memories: items }),
  addMemory: (item) => set((state) => ({ memories: [item, ...state.memories] })),
  removeMemory: (id) =>
    set((state) => ({ memories: state.memories.filter((item) => item.id !== id) })),
  currentInsight: null,
  setCurrentInsight: (insight) => set({ currentInsight: insight }),
}));
