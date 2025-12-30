<template>
  <BaseDialog
    :id="dialog.dialogId"
    max-width="700px"
    @escape="closeDialog()"
  >
    <v-card
      rounded="lg"
      color="surface"
    >
      <v-card-title class="d-flex align-center pa-5">
        <v-avatar
          color="primary"
          size="48"
          class="mr-3"
        >
          <v-icon size="28">videocam</v-icon>
        </v-avatar>
        <div>
          <div class="text-h6 font-weight-bold">
            {{ isUpdating ? 'Update Camera Stream' : 'Add New Camera Stream' }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ isUpdating ? 'Modify camera stream settings' : 'Connect a new camera to your printer farm' }}
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="formRef">
          <!-- Camera Name -->
          <v-text-field
            v-model="cameraStream.name"
            label="Camera Name"
            placeholder="e.g., Front Camera, Ender 3 Cam"
            prepend-inner-icon="label"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            class="mb-2"
            hint="Give your camera a descriptive name"
            persistent-hint
          />

          <!-- Stream URL -->
          <v-text-field
            v-model="cameraStream.streamURL"
            label="Stream URL (MJPEG)"
            placeholder="http://192.168.1.100:8080/webcam/?action=stream"
            prepend-inner-icon="link"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required, rules.url]"
            class="mb-2"
            hint="MJPEG stream URL from OctoPrint, Klipper, or IP camera"
            persistent-hint
          />

          <!-- Printer Association (Optional) -->
          <v-select
            v-model="cameraStream.printerId"
            :items="printerOptions"
            label="Associate with Printer (Optional)"
            placeholder="Select a printer"
            prepend-inner-icon="print"
            variant="outlined"
            density="comfortable"
            clearable
            class="mb-2"
            hint="Link this camera to a specific printer"
            persistent-hint
          />

          <!-- Preview Section -->
          <v-card
            v-if="cameraStream.streamURL"
            variant="outlined"
            class="mt-4"
            rounded="lg"
            color="surface"
          >
            <div class="d-flex align-center justify-space-between pa-3 preview-header">
              <div class="d-flex align-center">
                <v-icon
                  size="small"
                  class="mr-2"
                >preview</v-icon>
                <span class="text-subtitle-2 font-weight-medium">Stream Preview</span>
              </div>
              <v-btn
                size="small"
                variant="text"
                color="primary"
                @click="retryLoadImage"
              >
                <v-icon start>refresh</v-icon>
                Reconnect
              </v-btn>
            </div>
            <v-card-text class="pa-0">
              <div class="camera-preview-container">
                <img
                  v-show="!imageError && !imageLoading"
                  :key="imageRetryKey"
                  :src="cameraStream.streamURL"
                  class="camera-preview"
                  @error="handleImageError"
                  @load="handleImageLoad"
                />
                <div
                  v-if="imageLoading && !imageError"
                  class="camera-preview-loading"
                >
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="64"
                  />
                  <div class="text-body-2 mt-4">Connecting to camera...</div>
                </div>
                <div
                  v-if="imageError"
                  class="camera-preview-error"
                >
                  <v-icon
                    size="64"
                    color="error"
                  >error_outline</v-icon>
                  <div class="text-body-2 font-weight-bold mt-2">Unable to load camera stream</div>
                  <div class="text-caption text-medium-emphasis mt-1">Check the URL and try again</div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Help Alert -->
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="mt-4"
          >
            <div class="text-caption">
              <strong>Tip:</strong> Most 3D printer cameras use MJPEG streams. Common URLs:
              <ul class="mt-2 ml-4">
                <li><code>http://[ip]:8080/webcam/?action=stream</code> (OctoPrint/Klipper)</li>
                <li><code>http://[ip]/mjpeg_stream</code> (IP cameras)</li>
              </ul>
            </div>
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="text"
          @click="close"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="saving"
          :disabled="!isFormValid"
          @click="isUpdating ? updateCamera() : createCamera()"
        >
          <v-icon start>{{ isUpdating ? 'save' : 'add' }}</v-icon>
          {{ isUpdating ? 'Update Camera' : 'Add Camera' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import { useDialog } from '@/shared/dialog.composable'
import {
  CameraStream,
  CameraWithPrinter
} from '@/models/camera-streams/camera-stream'
import { CameraStreamService } from '@/backend/camera-stream.service'
import { useQueryClient } from '@tanstack/vue-query'
import { usePrinterStore } from '@/store/printer.store'

const queryClient = useQueryClient()
const dialog = useDialog(DialogName.AddOrUpdateCameraDialog)
const printerStore = usePrinterStore()

const formRef = ref()
const saving = ref(false)
const imageError = ref(false)
const imageLoading = ref(true)
const imageRetryKey = ref(0)

const cameraStream = ref<CameraStream>({
  name: '',
  streamURL: '',
  printerId: undefined
})

// Validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
  url: (v: string) => {
    if (!v) return true
    try {
      new URL(v)
      return true
    } catch {
      return 'Please enter a valid URL'
    }
  }
}

// Printer options for dropdown
const printerOptions = computed(() => {
  return printerStore.printers.map((printer) => ({
    title: printer.name,
    value: printer.id
  }))
})

// Form validation - Allow saving even if preview fails to load
const isFormValid = computed(() => {
  return (
    cameraStream.value.name?.trim() &&
    cameraStream.value.streamURL?.trim()
  )
})

const isDialogUpdate = () => dialog.context()?.addOrUpdate === 'update'

const isUpdating = computed(() => {
  return isDialogUpdate()
})

// Handle image loading errors
function handleImageError() {
  imageError.value = true
  imageLoading.value = false
}

function handleImageLoad() {
  imageError.value = false
  imageLoading.value = false
}

// Retry loading the camera stream
function retryLoadImage() {
  imageError.value = false
  imageLoading.value = true
  imageRetryKey.value++
}

// Watch for dialog context changes
watch(
  () => dialog.context(),
  (context) => {
    imageError.value = false
    imageLoading.value = true
    imageRetryKey.value = 0

    if (!context || context?.addOrUpdate !== 'update') {
      cameraStream.value.streamURL = ''
      cameraStream.value.name = ''
      cameraStream.value.printerId = undefined
      return
    }

    const stream = queryClient
      .getQueryData<CameraWithPrinter[]>(['cameraStream'])
      ?.find(
        (cameraStream) => cameraStream.cameraStream.id === context.cameraId
      )

    if (stream) {
      cameraStream.value.name = stream.cameraStream.name || ''
      cameraStream.value.streamURL = stream.cameraStream.streamURL || ''
      cameraStream.value.printerId = stream.cameraStream.printerId
    }
  }
)

function closeDialog() {
  dialog.closeDialog()
}

async function createCamera() {
  if (!formRef.value?.validate()) return

  saving.value = true
  try {
    await CameraStreamService.createCameraStream({
      streamURL: cameraStream.value.streamURL,
      name: cameraStream.value.name,
      printerId: cameraStream.value.printerId
    })
    await queryClient.refetchQueries({ queryKey: ['cameraStream'] })
    dialog.closeDialog()
  } catch (error) {
    console.error('Failed to create camera:', error)
  } finally {
    saving.value = false
  }
}

async function updateCamera() {
  if (!formRef.value?.validate()) return

  saving.value = true
  try {
    await CameraStreamService.updateCameraStream(dialog.context()?.cameraId, {
      streamURL: cameraStream.value.streamURL,
      name: cameraStream.value.name,
      printerId: cameraStream.value.printerId
    })
    await queryClient.refetchQueries({ queryKey: ['cameraStream'] })
    dialog.closeDialog()
  } catch (error) {
    console.error('Failed to update camera:', error)
  } finally {
    saving.value = false
  }
}

function close() {
  dialog.closeDialog()
}
</script>

<style scoped>
.camera-preview-container {
  position: relative;
  width: 100%;
  min-height: 300px;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-preview {
  width: 100%;
  height: auto;
  display: block;
}

.camera-preview-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  padding: 20px;
}

.camera-preview-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  padding: 20px;
}

code {
  background: rgba(var(--v-theme-on-surface), 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.875em;
}

.preview-header {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  color: rgba(var(--v-theme-on-secondary));
}
</style>
