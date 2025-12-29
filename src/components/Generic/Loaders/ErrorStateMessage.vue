<script setup lang="ts">
import { useOverlayStore } from "@/store/overlay.store";
import { useSnackbar } from "@/shared/snackbar.composable";

const appLoaderStore = useOverlayStore();
const snackbar = useSnackbar();

function reloadPage() {
  globalThis.location.reload()
}

function copyError() {
  navigator.clipboard.writeText(JSON.stringify(appLoaderStore.errorCaught))
  snackbar.openInfoMessage({
    title: 'Copied',
    subtitle: 'Error copied to clipboard'
  })
}
</script>

<template>
  <v-slide-y-transition>
    <v-card
      v-if="appLoaderStore.errorCaught"
      class="pa-8 mx-auto align-content-center"
      max-width="700"
      elevation="12"
    >
      <div class="mb-6 text-center" >
        <v-icon
          size="80"
          color="error"
          class="mb-4"
        >
          error_outline
        </v-icon>
        <h1 class="text-h4 font-weight-bold mb-3">Server Error</h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          The server returned an unexpected response. Please check your configuration and logs.
        </p>
      </div>

      <v-expansion-panels class="mb-6">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <v-icon class="mr-2">bug_report</v-icon>
              Error Details
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-card variant="outlined" class="pa-4">
              <div class="mb-3">
                <strong>Error:</strong>
                <pre class="text-caption mt-1">{{ JSON.stringify(appLoaderStore.errorCaught, null, 2) }}</pre>
              </div>
              <div v-if="appLoaderStore.errorUrl" class="mb-3">
                <strong>URL:</strong>
                <code class="text-caption">{{ appLoaderStore.errorUrl }}</code>
              </div>
              <div v-if="appLoaderStore.errorResponse" class="mb-3">
                <strong>Response:</strong>
                <pre class="text-caption mt-1">{{ appLoaderStore.errorResponse }}</pre>
              </div>
            </v-card>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <div class="d-flex flex-column align-center ga-3">
        <v-btn
          color="primary"
          size="large"
          variant="elevated"
          @click="reloadPage()"
          class="px-8"
        >
          <v-icon class="mr-2">refresh</v-icon>
          Reload Page
        </v-btn>

        <div class="d-flex ga-3 flex-wrap justify-center">
          <v-btn
            color="secondary"
            variant="outlined"
            @click="copyError()"
          >
            <v-icon class="mr-2">content_copy</v-icon>
            Copy Error
          </v-btn>

          <v-btn
            color="surface-variant"
            variant="outlined"
            href="https://docs.fdm-monster.net"
            target="_blank"
          >
            <v-icon class="mr-2">menu_book</v-icon>
            Documentation
          </v-btn>

          <v-btn
            color="purple"
            variant="outlined"
            href="https://discord.gg/mwA8uP8CMc"
            target="_blank"
          >
            <v-icon class="mr-2">chat</v-icon>
            Get Support
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-slide-y-transition>
</template>

<style scoped>
pre {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.75rem;
}

code {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.875rem;
}
</style>
