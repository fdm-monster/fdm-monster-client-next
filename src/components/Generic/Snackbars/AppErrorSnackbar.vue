<template>
  <v-snackbar
    v-model="snackbarOpened"
    :timeout="snackbarTimeout"
    location="bottom right"
    class="error-snackbar"
    color="error"
    variant="elevated"
    rounded="lg"
    multi-line
    width="400"
    max-width="90vw"
  >
    <div class="d-flex align-center ga-3">
      <v-icon
        color="white"
        size="24"
      >
        error
      </v-icon>

      <div class="flex-grow-1 min-width-0">
        <div class="text-body-1 font-weight-medium text-white">
          {{ snackbarTitle }}
        </div>
        <div
          v-if="snackbarSubtitle?.length"
          class="text-body-2 text-white opacity-90 mt-1"
        >
          {{ snackbarSubtitle }}
        </div>
      </div>

      <v-btn
        icon="close"
        variant="text"
        color="white"
        size="small"
        class="ml-2"
        @click="snackbarOpened = false"
      />
    </div>
  </v-snackbar>
</template>
<script lang="ts" setup>
import { ErrorMessage, useSnackbar } from '@/shared/snackbar.composable'
import { onMounted, ref } from 'vue'

const snackbar = useSnackbar()
const snackbarTimeout = ref(-1)
const snackbarOpened = ref(false)
const snackbarTitle = ref('')
const snackbarSubtitle = ref('')

onMounted(() => {
  snackbar.onErrorMessage((data: ErrorMessage) => {
    snackbarTitle.value = data.title
    snackbarSubtitle.value = data.subtitle ?? ''
    snackbarOpened.value = true
    snackbarTimeout.value = data.timeout ?? 10000
  })
})
</script>

<style scoped>
.error-snackbar {
  margin: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.min-width-0 {
  min-width: 0;
}

/* Ensure text doesn't overflow */
.error-snackbar :deep(.v-snackbar__content) {
  padding: 16px 20px;
}

/* Animation for better UX */
.error-snackbar :deep(.v-snackbar__wrapper) {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}
</style>

