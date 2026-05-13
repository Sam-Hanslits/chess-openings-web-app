<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Openings Teacher</v-toolbar-title>
      <v-spacer></v-spacer>
      <div v-if="userStore.user" class="d-flex align-center mr-4">
        <span class="mr-3">Signed in as {{ userStore.user.displayName }}</span>
        <v-avatar 
          v-if="userStore.user.photoURL" 
          :image="userStore.user.photoURL"
        ></v-avatar>
      </div>
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
              :active="currentRouteId === opening.id"
              @click="router.push(`/openings/${opening.id}`)"
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
  import { ref, onMounted, watch, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useOpeningStore } from '@/stores/openingStore'
  import { useUserStore } from '@/stores/userStore'
  import { storeToRefs } from 'pinia'

  const drawer = ref(true)
  const route = useRoute()
  const router = useRouter()
  const openingStore = useOpeningStore()
  const userStore = useUserStore()
  const { openings, currentLineIndex } = storeToRefs(openingStore)

  const currentRouteId = computed(() => (route.params as { id?: string }).id)

  const openedGroups = ref<string[]>(currentRouteId.value ? [currentRouteId.value] : [])

  watch(currentRouteId, (id) => {
    if (id) {
      if (!openedGroups.value.includes(id)) {
        openedGroups.value.push(id);
      }
      // Mutate array in-place to avoid breaking Vuetify's animation proxy
      for (let i = openedGroups.value.length - 1; i >= 0; i--) {
        if (openedGroups.value[i] !== id) {
          openedGroups.value.splice(i, 1);
        }
      }
    } else {
      openedGroups.value.splice(0, openedGroups.value.length);
    }
  })

  onMounted(() => openingStore.init())
</script>
