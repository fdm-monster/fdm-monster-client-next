<template>
  <v-snackbar
    v-model="snackbarOpened"
    :timeout="timeout"
    location="bottom right"
    class="info-snackbar"
    :color="isWarning ? 'warning' : 'success'"
    variant="elevated"
    rounded="lg"
    multi-line
    width="400"
    max-width="90vw"
  >
    <div class="d-flex align-center ga-3">
      <v-icon
        :color="isWarning ? 'black' : 'white'"
        size="24"
      >
        {{ isWarning ? 'warning' : 'check_circle' }}
      </v-icon>

      <div class="flex-grow-1 min-width-0">
        <div :class="isWarning ? 'text-body-1 font-weight-medium text-black' : 'text-body-1 font-weight-medium text-white'">
          {{ infoTitle }}
        </div>
        <div
          v-if="infoSubtitle?.length"
          :class="isWarning ? 'text-body-2 text-black opacity-90 mt-1' : 'text-body-2 text-white opacity-90 mt-1'"
        >
          {{ infoSubtitle }}
        </div>
      </div>

      <v-btn
        icon="close"
        variant="text"
        :color="isWarning ? 'black' : 'white'"
        size="small"
        class="ml-2"
        @click="snackbarOpened = false"
      />
    </div>
  </v-snackbar>
</template>
<script lang="ts" setup>
import { InfoMessage, useSnackbar } from '@/shared/snackbar.composable'
import { onMounted, ref } from 'vue'

const snackbar = useSnackbar()
const snackbarOpened = ref(false)
const infoTitle = ref('')
const infoSubtitle = ref('')
const timeout = ref(2000)
const isWarning = ref(false)

onMounted(() => {
  snackbar.onInfoMessage((data: InfoMessage) => {
    infoTitle.value = data.title
    infoSubtitle.value = data.subtitle ?? ''
    isWarning.value = data.warning ?? false
    timeout.value = data.timeout ?? 2000
    snackbarOpened.value = true
  })
})
</script>

<style scoped>
.info-snackbar {
  margin: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.min-width-0 {
  min-width: 0;
}

/* Ensure text doesn't overflow */
.info-snackbar :deep(.v-snackbar__content) {
  padding: 16px 20px;
}

/* Animation for better UX */
.info-snackbar :deep(.v-snackbar__wrapper) {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}
</style>

