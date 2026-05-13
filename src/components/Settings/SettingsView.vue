<template>
  <div>
    <v-row no-gutters>
      <v-navigation-drawer :permanent="true">
        <v-list
          density="compact"
          nav
        >
          <v-list-item
            v-for="item in visibleItems"
            :key="item.title"
            :to="item.path"
            link
            :prepend-icon="item.icon"
            :title="item.title"
            router-link
            :style="item.divider ? 'border-bottom: 1px solid gray' : ''"
          />
        </v-list>
      </v-navigation-drawer>

      <v-col>
        <router-view />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { settingPage, settingsPage } from '@/router/setting.constants'
import { useProfileStore } from '@/store/profile.store'

const profileStore = useProfileStore()

// Make sure we have profile info to drive admin-only filtering.
onMounted(async () => {
  if (!profileStore.userId) {
    try {
      await profileStore.getProfile()
    } catch (error) {
      console.error('Failed to load profile for settings nav:', error)
    }
  }
})

// Filter out admin-only settings entries when the user lacks ADMIN.
const ADMIN_ONLY: string[] = [settingPage.apiKeys]
const visibleItems = computed(() => {
  if (profileStore.isAdmin) return settingsPage
  const filtered: Record<string, (typeof settingsPage)[keyof typeof settingsPage]> = {}
  for (const [key, value] of Object.entries(settingsPage)) {
    if (!ADMIN_ONLY.includes(key)) filtered[key] = value
  }
  return filtered as typeof settingsPage
})
</script>
