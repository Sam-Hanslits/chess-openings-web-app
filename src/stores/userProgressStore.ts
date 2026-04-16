import { defineStore } from 'pinia';
import type { opening } from '@/types/openingTypes';
import { useUserStore } from './userStore';

export const useUserProgressStore = defineStore('userProgress', {
  getters: {
    getOpeningProgressPercentage() {
      return (opening: opening): number => {
        const userStore = useUserStore();

        if (!opening || !opening.lines || opening.lines.length === 0) {
          return 0;
        }

        const openingLineIds = new Set(opening.lines.map(line => line.id));

        const completedCount = userStore.completedLines.filter(id => openingLineIds.has(id)).length;

        return (completedCount / opening.lines.length) * 100;
      };
    },
  },
});