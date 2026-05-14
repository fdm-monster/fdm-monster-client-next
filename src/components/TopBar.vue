<template>
  <v-app-bar :color="badge.palette.value ?? undefined" elevation="0">
    <div :class="['d-none', 'd-md-flex', 'align-center', 'flex-shrink-0', 'text-h6', 'text-uppercase', 'pl-4', `text-${badge.onPalette.value}`]">
      <span class="font-weight-light">FDM&nbsp;</span>
      <strong>Monster</strong>
    </div>

    <v-chip
      v-if="badge.chipText.value"
      color="yellow"
      variant="elevated"
      size="small"
      class="ml-3 mr-3 flex-shrink-0 text-black font-weight-bold text-uppercase"
    >
      {{ badge.chipText.value }}
    </v-chip>

    <span
      v-if="pageTitle"
      :class="['text-h6', 'font-weight-light', 'text-uppercase', 'pl-2', 'page-title-divider', 'flex-shrink-0', `text-${badge.onPalette.value}`]"
    >
      {{ pageTitle }}
    </span>

    <v-spacer />

    <PrinterStatusMenu />

    <QueueMenu />

    <PrintJobsMenu />

    <v-menu
      v-if="authStore.hasAuthToken && !authStore.isLoginExpired"
      :close-on-content-click="false"
      location="bottom right"
      open-on-hover
      transition="slide-y-transition"
    >
      <template #activator="{ props }">
        <v-btn
          class="ml-2"
          variant="tonal"
          :color="badge.onPalette.value"
          v-bind="props"
        >
          <v-icon class="mr-2">mdi:mdi-account</v-icon>
          {{ username }}
        </v-btn>
      </template>

      <v-list>
        <v-list-item
          v-for="(item, index) in items"
          :key="index"
          :to="item.path"
          :title="item.title"
          :prepend-icon="item.icon"
          link
        />
        <v-divider v-if="isDevEnv" />
        <v-list-item v-if="isDevEnv && expiry" disabled>
          <template #prepend>
            <v-icon>schedule</v-icon>
          </template>
          <v-list-item-title class="text-caption">
            Auth Expiry: {{ expiry }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item v-if="isDevEnv" disabled>
          <template #prepend>
            <v-icon>wifi</v-icon>
          </template>
          <v-list-item-title class="text-caption font-monospace">
            SocketIO: S{{ socketState.setup ? 1 : 0 }} C{{ socketState.connected ? 1 : 0 }} A{{ socketState.active ? 1 : 0 }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption">
            {{ socketState.id }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-menu>

    <TooltipButton
      v-if="authStore.loginRequired === true"
      tooltip="Go back to login"
      text="Logout"
      text-class="d-none d-md-inline"
      icon="logout"
      variant="tonal"
      :color="badge.onPalette.value"
      @click="logout()"
    />

    <HelpOverlay />
  </v-app-bar>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useIntervalFn } from '@vueuse/core'
import PrinterStatusMenu from '@/components/Generic/PrinterStatusMenu.vue'
import QueueMenu from '@/components/Generic/QueueMenu.vue'
import PrintJobsMenu from '@/components/Generic/PrintJobsMenu.vue'
import { useAuthStore } from '@/store/auth.store'
import { useProfileStore } from '@/store/profile.store'
import { routeToLogin } from '@/router/utils'
import { isDevEnv, isProdEnv } from '@/shared/app.constants'
import { socketState } from "@/shared/socketio.service";
import { useDevInstanceBadge } from '@/shared/dev-instance-badge.composable'

const profileStore = useProfileStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const badge = useDevInstanceBadge()

// Page titles and subtitles based on route
const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  'Print Jobs': {
    title: 'Print Jobs'
  },
  'Print Queue': {
    title: 'Print Queue'
  },
  'CameraGridView': {
    title: 'Cameras'
  },
  'PrintersView': {
    title: 'Printer List'
  },
  'PrinterGrid': {
    title: 'Printer Grid'
  },
  'Settings': {
    title: 'Settings'
  },
  "Files": {
    title: 'Files'
  },
  "MaintenanceLogs": {
    title: 'Maintenance Logs'
  }
  // Add more page titles as needed
}

const pageTitle = computed(() => {
  const routeName = route.name as string
  const routePath = route.path as string

  // Handle settings pages based on path with breadcrumb format
  if (routePath.startsWith('/settings/')) {
    const settingsPageMap: Record<string, string> = {
      '/settings/floors': 'Settings - Floors',
      '/settings/printer': 'Settings - Printer',
      '/settings/emergency-commands': 'Settings - Emergency Commands',
      '/settings/server-protection': 'Settings - Server Protection',
      '/settings/user-management': 'Settings - Users',
      '/settings/account': 'Settings - Account',
      '/settings/software-upgrade': 'Settings - Software Upgrade',
      '/settings/diagnostics': 'Settings - Diagnostics',
      '/settings/experimental': 'Settings - Experimental',
      '/settings/debug-socket': 'Settings - SocketIO Debug',
      '/settings/about': 'Settings - About'
    }
    return settingsPageMap[routePath] || 'Settings'
  }

  return pageTitles[routeName]?.title || ''
})

const items = [
  { title: 'Open Profile', icon: 'mdi:mdi-account', path: '/settings/account' }
]

const now = ref(Date.now())
if (isDevEnv) {
  useIntervalFn(() => {
    now.value = Date.now()
  }, 1000)
}

const expiry = computed(() => {
  if (isProdEnv) {
    return ''
  }
  if (!authStore.tokenClaims?.exp) {
    return ''
  }
  const diffValue = authStore.tokenClaims.exp - now.value / 1000
  return `${Math.round(diffValue)}s`
})

const username = computed(() => {
  return profileStore.username
})

async function logout() {
  await authStore.logout(true)
  await routeToLogin(router)
}
</script>

<style scoped>
.page-title-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
  white-space: nowrap;
}

.page-title-divider {
  border-left: 2px solid rgb(var(--v-theme-primary));
}

:deep(.v-toolbar__content) {
  flex-wrap: nowrap !important;
}
</style>
