<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Openings Teacher</v-toolbar-title>
      <v-banner-text v-if="userStore.user" class="flex-grow-1 text-right">
        Signed in as {{ userStore.user.displayName }}
      </v-banner-text>
      <v-avatar 
            v-if="userStore.user && userStore.user.photoURL" 
            :image="userStore.user.photoURL"
            style="position: absolute; top: 16px; right: 16px; z-index: 1;"
          ></v-avatar>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer">
      <v-list nav v-model:opened="openedGroups">
        <v-list-item
          prepend-icon="mdi-home"
          title="Home"
          to="/"
        ></v-list-item>
             
        <v-list-subheader
          class="d-flex justify-center text-h6 font-weight-bold white--text">
          Openings
        </v-list-subheader>

        <v-list-group v-for="opening in openings" :key="opening.id" :value="opening.id">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              :title="opening.name"
              :to="`/openings/${opening.id}`"
            >
              <template v-slot:append></template>
            </v-list-item>
          </template>

          <v-list-item
            v-for="(line, index) in opening.lines"
            :key="line.name"
            :title="line.name"
            @click="openingStore.currentLineIndex = index"
          >
            <template v-slot:append>
              <v-icon v-if="userStore.completedLines.includes(line.id)" color="success">
                mdi-check-circle
              </v-icon>
            </template>
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch } from 'vue'
  import { useOpeningStore } from '@/stores/openingStore'
  import { useUserStore } from '@/stores/userStore'
  import { storeToRefs } from 'pinia'

  const drawer = ref(true)
  const openingStore = useOpeningStore()
  const userStore = useUserStore()
  const { openings, selectedOpeningId, currentLineIndex } = storeToRefs(openingStore)

  const openedGroups = ref<string[]>([])

  watch(selectedOpeningId, (newId) => {
    openedGroups.value = newId ? [newId] : [];
  });

  // Call the init action when the component is mounted
  onMounted(() => openingStore.init())
</script>
