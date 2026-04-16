// Utilities
import { defineStore } from 'pinia'
import db from "../firebase.ts";
import type { User } from "firebase/auth";
import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
  arrayUnion,
  updateDoc,
} from "firebase/firestore";

export const useUserStore = defineStore('userStore', {
  state: () => ({
    user: null as User | null,
    completedLines: [] as string[],
  }),

  actions: {
    async setUser(user: User | null) {
      this.user = user;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          this.completedLines = userDocSnap.data().completedLines || [];
        } else {
          this.completedLines = [];
        }
      } else {
        this.completedLines = [];
      }
    },
    async markLineCompleted(lineId: string) {
      if (!this.user) return;

      const userDocRef = doc(db, 'users', this.user.uid);

      try {
        // Also update the local state so the UI can react instantly
        if (!this.completedLines.includes(lineId)) {
          this.completedLines.push(lineId);
        }
        await setDoc(userDocRef, { completedLines: arrayUnion(lineId) }, { merge: true });
      } catch (error) {
        console.error("Error marking line as completed:", error);
      }
    }
  }
})
