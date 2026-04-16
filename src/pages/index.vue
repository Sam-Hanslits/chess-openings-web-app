<template>
  <v-container>
    <v-row justify="center" class="my-8">
      <v-col cols="12" class="text-center">
        <h1 class="text-h4 font-weight-bold">Sam's Chess Openings Teacher</h1>
        <p class="text-subtitle-1 mt-2">Here you can learn and practice some of the most common lines from some of the most popular chess openings.</p>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="12" md="5">
        <v-card>
          <v-avatar 
            v-if="userStore.user && userStore.user.photoURL" 
            :image="userStore.user.photoURL"
            style="position: absolute; top: 16px; right: 16px; z-index: 1;"
          ></v-avatar>
          <v-card-title>Sign In</v-card-title>
          <div v-if="!userStore.user">
            <v-card-text>
              <p>
                If you're a returning user, please sign in to continue from where you left off.
              </p>
              <p class="mt-6">
                If you're new here, feel free to jump in and try out any of the openings, but if you want to save your progress for next time
                click the button below to sign in with Google.
              </p>
            </v-card-text>
            <v-card-actions>
              <v-btn 
                variant="outlined" 
                @click="withGoogle"
                prepend-icon="mdi-google"
                block
              >Sign In With Google</v-btn>
            </v-card-actions>
          </div>
          <div v-else>
            <v-card-text>
              <p>Welcome back, {{ userStore.user.displayName }}!</p>
            </v-card-text>
            <v-card-actions>
              <v-btn 
                variant="outlined" 
                @click="signOutUser"
                prepend-icon="mdi-logout"
                block
              >Sign Out</v-btn>
            </v-card-actions>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card>
          <v-card-title>Your Progress</v-card-title>
          <v-card-text>
            <div v-if="!userStore.user">
              <p>Sign in to see and save your progress!</p>
            </div>
            <div v-else>
              <div v-for="opening in openingStore.openings" :key="opening.id" class="mb-4">
                <p class="font-weight-medium">{{ opening.name }}</p>
                <v-progress-linear
                  :model-value="userProgressStore.getOpeningProgressPercentage(opening)"
                  color="primary"
                  height="20"
                  rounded
                >
                  <strong>{{ Math.ceil(userProgressStore.getOpeningProgressPercentage(opening)) }}%</strong>
                </v-progress-linear>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { auth } from "../firebase.ts"
import { useUserStore } from "../stores/userStore";
import { useOpeningStore } from '@/stores/openingStore';
import { useUserProgressStore } from '@/stores/userProgressStore';
import { onMounted, watch } from "vue";

const userStore = useUserStore();
const openingStore = useOpeningStore();
const userProgressStore = useUserProgressStore();

onMounted(() => {
  // Load the openings data from the JSON file
  openingStore.init();

  onAuthStateChanged(auth, (currentUser) => {
    userStore.setUser(currentUser);
  });
});

const withGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error during sign in:", error);
  }
};

const signOutUser = async () => {
  await signOut(auth);
};
</script>
