<template>
  <v-app-bar elevation="0">
    <v-toolbar-title class="text-uppercase text-white">
      <span class="font-weight-light"> FDM </span>
      <strong> Monster </strong>
    </v-toolbar-title>

    <v-spacer v-if="isDemoMode" />
    <h2
      v-if="isDemoMode"
      class="text-uppercase text--white"
    >
      DEMO MODE
    </h2>
    <v-spacer />

    <PrintJobsMenu />

    <v-menu
      v-if="authStore.hasAuthToken && !authStore.isLoginExpired"
      :close-on-content-click="false"
      location="bottom right"
      open-on-hover
      transition="slide-y-transition"
    >
      <template #activator="{ props }">
        <!--Theme?-->
        <v-btn
          class="ml-2"
          color="secondary"
          theme="dark"
          v-bind="props"
        >
          <v-icon class="mr-2">person</v-icon>
          {{ username }}
        </v-btn>
      </template>

      <v-list>
        <v-list-item
          v-for="(item, index) in items"
          :key="index"
          :to="item.path"
          :title="item.title"
          :prepend-avatar="item.icon"
          link
        />
      </v-list>
    </v-menu>

    <span
      v-if="isDevEnv && expiry"
      class="ml-2"
    >
      AuthExp {{ expiry }}
    </span>

    <span
      v-if="isDevEnv"
      class="ml-2"
    >
      <small>
        S{{ socketState.setup ? 1 : 0 }} C{{ socketState.connected ? 1 : 0 }}
        A{{ socketState.active ? 1 : 0}}
        {{ socketState.id }}
      </small>
    </span>

    <TooltipButton
      v-if="authStore.loginRequired === true"
      tooltip="Go back to login"
      text="Logout"
      color="secondary"
      icon="logout"
      @click="logout()"
    />

    <v-btn
      v-if="authStore.loginRequired === true"
      class="ml-2"
    >
      <v-icon class="mr-2">logout</v-icon>
      Logout
    </v-btn>

    <HelpOverlay />
  </v-app-bar>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useIntervalFn } from '@vueuse/core'
import PrintJobsMenu from '@/components/Generic/PrintJobsMenu.vue'
import { useAuthStore } from '@/store/auth.store'
import { useProfileStore } from '@/store/profile.store'
import { routeToLogin } from '@/router/utils'
import { isDevEnv, isProdEnv } from '@/shared/app.constants'
import { socketState } from "@/shared/socketio.service";

const profileStore = useProfileStore()
const authStore = useAuthStore()
const router = useRouter()
const items = [
  { title: 'Open Profile', icon: 'person', path: '/settings/account' }
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

const isDemoMode = computed(() => {
  return authStore.isDemoMode
})

async function logout() {
  await authStore.logout(true)
  await routeToLogin(router)
}
</script>

<style lang="scss">
.border-time {
  border: 1px solid white;

  * {
    border: none;
  }
}
</style>
