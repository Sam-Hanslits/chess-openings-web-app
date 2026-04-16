import { defineStore } from 'pinia'
import type { opening, line } from '@/types/openingTypes'
import openingsData from '@/data/openings.json'
import { database } from '../firebase.ts';
import { ref, get, child } from 'firebase/database';

export const useOpeningStore = defineStore('openings', {
  state: () => ({
    openings: [] as opening[],
    selectedOpeningId: null as string | null,
    currentLineIndex: 0,
    
  }),

  actions: {
    async init() {
      try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, 'openings'));

        if (snapshot.exists()) {
          const openingsObject = snapshot.val();
          this.openings = Object.keys(openingsObject).map(key => ({
            id: key, // Assuming the key in RTDB is the opening ID
            ...openingsObject[key]
          })) as opening[];
        } else {
          this.openings = openingsData.openings as opening[];
        }
      } catch (error) {
        console.log('Error initializing opening store:', error);
        this.openings = openingsData.openings as opening[];
      }
      this.selectedOpeningId = null;
      this.currentLineIndex = 0;
    },

    getOpening(id: string) {
      return this.openings.find(opening => opening.id === id) || null;
    },

    getSelectedOpeningId() {
      return this.selectedOpeningId;
    }
  }
})