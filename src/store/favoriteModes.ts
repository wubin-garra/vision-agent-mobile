import * as FileSystem from 'expo-file-system/legacy';
import { create } from 'zustand';

import type { CameraModeId } from '@/constants/cameraModes';

const STORAGE_PATH = `${FileSystem.documentDirectory ?? ''}favorite-camera-modes.json`;

type FavoriteModesState = {
  /** 收藏顺序（越前越靠左）；不含 auto */
  favoriteIds: CameraModeId[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  isFavorite: (id: CameraModeId) => boolean;
  toggleFavorite: (id: CameraModeId) => void;
};

async function persist(ids: CameraModeId[]) {
  if (!FileSystem.documentDirectory) return;
  try {
    await FileSystem.writeAsStringAsync(STORAGE_PATH, JSON.stringify(ids));
  } catch {
    // 忽略落盘失败，内存态仍可用
  }
}

export const useFavoriteModesStore = create<FavoriteModesState>((set, get) => ({
  favoriteIds: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    if (!FileSystem.documentDirectory) {
      set({ hydrated: true });
      return;
    }
    try {
      const info = await FileSystem.getInfoAsync(STORAGE_PATH);
      if (info.exists) {
        const raw = await FileSystem.readAsStringAsync(STORAGE_PATH);
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          const ids = parsed.filter(
            (id): id is CameraModeId => typeof id === 'string' && id !== 'auto',
          );
          set({ favoriteIds: ids, hydrated: true });
          return;
        }
      }
    } catch {
      // 损坏文件则重置
    }
    set({ hydrated: true });
  },

  isFavorite: (id) => id !== 'auto' && get().favoriteIds.includes(id),

  toggleFavorite: (id) => {
    if (id === 'auto') return;
    set((state) => {
      const exists = state.favoriteIds.includes(id);
      const favoriteIds = exists
        ? state.favoriteIds.filter((item) => item !== id)
        : [...state.favoriteIds, id];
      void persist(favoriteIds);
      return { favoriteIds };
    });
  },
}));
