<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useOverlayStore } from "@/store/overlay.store";
import DiscordInviteButton from '@/components/Generic/Actions/DiscordInviteButton.vue'
import GithubIssuesButton from '@/components/Generic/Actions/GithubIssuesButton.vue'

const appLoaderStore = useOverlayStore();
const countdown = ref(0)
let intervalId: NodeJS.Timeout | null = null

function updateCountdown() {
  if (!appLoaderStore.nextRetryTime) {
    countdown.value = 0
    return
  }
  countdown.value = Math.max(0, Math.ceil((appLoaderStore.nextRetryTime - Date.now()) / 1000))
}

onMounted(() => {
  updateCountdown()
  intervalId = globalThis.setInterval(updateCountdown, 100)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <v-slide-y-transition>
    <v-card
      v-if="appLoaderStore.serverDisconnected"
      class="pa-8 mx-auto text-center"
      max-width="600"
      elevation="12"
    >
      <div class="mb-8">
        <v-icon
          size="80"
          color="error"
          class="mb-5"
        >
          wifi_off
        </v-icon>
        <h1 class="text-h4 font-weight-bold mb-4">Server Disconnected</h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Cannot connect to FDM Monster server. Please ensure the server is running and try again.
        </p>

        <div v-if="appLoaderStore.isRetrying" class="mt-6">
          <v-chip
            color="primary"
            outline
            size="large"
            class="px-4"
          >
            <v-icon v-if="!appLoaderStore.isTestingConnection" class="mr-2">mdi:mdi-refresh</v-icon>
            <v-icon v-if="appLoaderStore.isTestingConnection" class="mr-2">mdi:mdi-timer</v-icon>
            <span v-if="appLoaderStore.isTestingConnection">Testing connection</span>
            <span v-else>Retrying in {{ countdown }}s</span>
          </v-chip>
          <v-progress-linear
            v-if="!appLoaderStore.isTestingConnection"
            :model-value="((5 - countdown) / 5) * 100"
            color="primary"
            height="4"
            class="mt-4"
            rounded
          ></v-progress-linear>
          <v-progress-linear
            v-else
            indeterminate
            color="primary"
            height="4"
            class="mt-4"
            rounded
          ></v-progress-linear>
        </div>
      </div>

      <div class="d-flex flex-column align-center ga-4">
        <v-btn
          :disabled="!appLoaderStore.isRetrying || appLoaderStore.isTestingConnection"
          color="primary"
          size="large"
          variant="elevated"
          @click="appLoaderStore.retryNow()"
          class="px-8"
        >
          <v-icon class="mr-2">mdi:mdi-play</v-icon>
          Retry Now
        </v-btn>
      </div>

      <v-divider class="my-8"/>

      <div class="text-center">
        <p class="text-caption text-medium-emphasis mb-3">
          Helpful links:
        </p>
        <div class="d-flex ga-3 flex-wrap justify-center mb-6">
          <v-btn
            color="surface-variant"
            variant="outlined"
            href="https://docs.fdm-monster.net"
            target="_blank"
          >
            <v-icon class="mr-2">menu_book</v-icon>
            Documentation
          </v-btn>

          <DiscordInviteButton
            label="Discord Support"
            variant="elevated"
          />

          <GithubIssuesButton
            label="GitHub"
            variant="outlined"
            color="surface-variant"
          />
        </div>

        <p class="text-caption text-medium-emphasis mb-3">
          Common solutions:
        </p>
        <div class="d-flex flex-wrap justify-center ga-2">
          <v-chip size="small" variant="outlined">Check server status</v-chip>
          <v-chip size="small" variant="outlined">Verify network connection</v-chip>
          <v-chip size="small" variant="outlined">Review server logs</v-chip>
        </div>
      </div>
    </v-card>
  </v-slide-y-transition>
</template>

<style scoped>
.rounded-circle {
  border-radius: 50%;
}
</style>
