<template>
  <v-snackbar
    v-model="snackbarOpened"
    :timeout="progressTimeout"
    absolute
    location="bottom right"
    class="ma-3 elevation-24"
    min-width="450px"
    multi-line
    rounded="pill"
    style="z-index: 1000"
  >
    <v-row>
      <v-col cols="2">
        <v-btn
          icon
          size="large"
        >
          <v-icon>file_upload</v-icon>
        </v-btn>
      </v-col>
      <v-col
        class="d-flex align-center flex-row"
        cols="8"
      >
        <div style="width: 100%">
          <span class="font-weight-bold text-button">
            {{ snackbarTitle }}
          </span>
          <div
            v-for="(progress, index) in progressTracked"
            :key="index"
            class="mb-2"
          >
            <v-icon v-if="progress.completed">check</v-icon>
            <v-icon v-else-if="progress.timeoutAt">pause</v-icon>
            <v-icon v-else>hourglass_bottom</v-icon>
            {{ progress.title }}
            {{ (progress.completed ? 100 : progress.value).toFixed(1) }}%
            <br />
            <v-progress-linear
              :key="progress.key"
              :model-value="progress.completed ? 100 : progress.value"
              :color="progress.timeoutAt ? 'red' : 'success'"
            />
          </div>
        </div>
      </v-col>
      <v-col cols="1">
        <v-btn
          icon
          size="large"
          @click="snackbarOpened = false"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-snackbar>
</template>
<script lang="ts" setup>
import {
  ProgressMessage,
  useSnackbar
} from '../../../shared/snackbar.composable'
import { onMounted, ref } from 'vue'
import {
  TrackedUpload,
  UploadStates
} from '../../../models/socketio-messages/socketio-message.model'
import { eventTypeToMessage, InfoEventType } from '../../../shared/alert.events'

const snackbar = useSnackbar()
const snackbarOpened = ref(false)
const snackbarTitle = ref('')

// Merged upload progress tracking
interface ProgressTracked {
  value: number
  key: string
  title: string
  completed: boolean
  startedAt: number
  expiresAt: number
  timeoutAt?: number
}

const progressTracked = ref<ProgressTracked[]>([])
const progressTimeout = ref<number>(100)

function getProgressByKey(key: string) {
  return progressTracked.value.find((p) => p.key === key)
}

function addProgressTracker(
  // Tracking key
  key: string,
  title: string,
  value: number = 0,
  completed: boolean = false,
  expiresAt: number = Date.now() + 1500
) {
  console.log(
    `[AppProgressSnackbar] Adding ${key} tracker with progress ${value}`
  )
  progressTracked.value.push({
    key,
    title,
    value,
    completed,
    startedAt: Date.now(),
    expiresAt,
    timeoutAt: undefined
  })
}

function removeProgressTracker(key: string) {
  progressTracked.value = progressTracked.value.filter((p) => p.key !== key)
}

onMounted(() => {
  setInterval(() => {
    if (!progressTracked.value.length) {
      return
    }

    for (const progress of progressTracked.value) {
      const { value, completed, expiresAt, key } = progress
      if ((completed || value >= 100) && expiresAt < Date.now()) {
        removeProgressTracker(key)
      } else if (progress.timeoutAt && progress.timeoutAt < Date.now()) {
        removeProgressTracker(key)
      } else if (!progress.timeoutAt && expiresAt < Date.now()) {
        progress.timeoutAt = Date.now() + 5000
      }
    }
    if (!progressTracked.value.length) {
      // Dwell the notification snackbar for a timeout duration
      progressTimeout.value = 2000
      snackbarTitle.value = 'Upload ended'
      console.debug(
        `[AppSnackbars] Setting timeout to ${progressTimeout.value}`
      )
    } else {
      progressTimeout.value = -1
      snackbarOpened.value = true
    }
  }, 1000)
  snackbar.onProgressMessage((data: ProgressMessage) => {
    const { key, value, title, completed } = data
    const record = getProgressByKey(key)
    if (!record) {
      if (value >= 100) {
        // If the value is above 100, don't consider it (bug/noise)
        return
      }
      addProgressTracker(key, title, value, false, Date.now() + 1500)
    } else if (Math.min(100, value) >= record.value) {
      record.expiresAt = Date.now() + 1500
      record.value = value
      record.completed = completed
    }
    snackbarTitle.value = 'Uploading files'
  })
})
</script>
