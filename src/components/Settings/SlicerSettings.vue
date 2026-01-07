<template>
  <v-card>
    <v-card-text>
      <SettingSection
        title="PrusaSlicer Integration"
        tooltip="Configure API key authentication for slicer file uploads. This allows PrusaSlicer and other slicers to upload files directly to FDM Monster."
        :usecols="false"
      >
        <v-alert color="info" variant="tonal" class="mb-4" density="compact">
          <div class="text-body-2">
            <strong>Setup:</strong> Configure PrusaSlicer → <strong>Print Host</strong> with:
            <div class="mt-1 ml-2">
              • Host Type: <strong>OctoPrint</strong><br>
              • Hostname: <strong>{{ serverUrl }}</strong><br>
              • API Key: <em>(copy from below)</em>
            </div>
          </div>
        </v-alert>

        <div class="d-flex flex-column">
          <div class="text-subtitle-2 mb-2">Slicer API Key</div>

          <div v-if="isLoading" class="d-flex align-center">
            <v-progress-circular indeterminate size="24" width="3" class="mr-2" />
            <span>Loading...</span>
          </div>

          <div v-else-if="!slicerApiKey" class="d-flex flex-column align-center">
            <v-alert color="warning" variant="tonal" class="mb-4 text-center" density="compact">
              No API key generated yet.
            </v-alert>
            <v-btn
              color="primary"
              variant="elevated"
              size="large"
              :loading="isRegenerating"
              @click="generateApiKey"
              prepend-icon="vpn_key"
              class="px-8"
              style="min-width: 240px; max-width: 300px;"
            >
              Generate API Key
            </v-btn>
          </div>

          <div v-else class="d-flex flex-column">
            <div class="d-flex align-center mb-3">
              <v-text-field
                v-model="displayApiKey"
                :type="showApiKey ? 'text' : 'password'"
                readonly
                variant="outlined"
                density="compact"
                hide-details
                class="flex-grow-1 mr-2"
                style="font-family: monospace;"
              >
                <template #append-inner>
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    @click="showApiKey = !showApiKey"
                    :title="showApiKey ? 'Hide' : 'Show'"
                  >
                    <v-icon>{{ showApiKey ? 'visibility_off' : 'visibility' }}</v-icon>
                  </v-btn>
                </template>
              </v-text-field>

              <v-btn
                icon
                variant="tonal"
                color="primary"
                @click="copyApiKey"
                :title="copied ? 'Copied!' : 'Copy to clipboard'"
              >
                <v-icon>{{ copied ? 'check' : 'content_copy' }}</v-icon>
              </v-btn>
            </div>

            <div class="d-flex gap-2">
              <v-btn
                color="warning"
                variant="tonal"
                class="mr-2"
                :loading="isRegenerating"
                @click="confirmRegenerate"
                prepend-icon="refresh"
              >
                Regenerate Key
              </v-btn>

              <v-btn
                color="error"
                variant="tonal"
                :loading="isDeleting"
                @click="confirmDelete"
                prepend-icon="delete"
              >
                Delete Key
              </v-btn>
            </div>

            <v-alert v-if="showSuccess" color="success" variant="tonal" class="mt-3">
              {{ successMessage }}
            </v-alert>
          </div>
        </div>
      </SettingSection>
    </v-card-text>

    <!-- Regenerate Confirmation Dialog -->
    <v-dialog v-model="showRegenerateDialog" max-width="450">
      <v-card>
        <v-card-title>Regenerate API Key?</v-card-title>
        <v-card-text>
          This will invalidate the current API key. You will need to update the key in your slicer settings.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showRegenerateDialog = false">Cancel</v-btn>
          <v-btn color="warning" @click="regenerateApiKey">Regenerate</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="450">
      <v-card>
        <v-card-title>Delete API Key?</v-card-title>
        <v-card-text>
          This will disable API key authentication for slicer uploads. Slicers will no longer be able to upload files using this key.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteApiKey">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { SettingsService } from '@/backend'
import SettingSection from '@/components/Settings/Shared/SettingSection.vue'

const slicerApiKey = ref<string | null>(null)
const isLoading = ref(true)
const isRegenerating = ref(false)
const isDeleting = ref(false)
const showApiKey = ref(false)
const copied = ref(false)
const showSuccess = ref(false)
const successMessage = ref('')
const showRegenerateDialog = ref(false)
const showDeleteDialog = ref(false)

const displayApiKey = computed(() => slicerApiKey.value || '')

const serverUrl = computed(() => {
  return globalThis.location.origin
})

async function loadApiKey() {
  isLoading.value = true
  try {
    const response = await SettingsService.getSlicerApiKey()
    slicerApiKey.value = response.slicerApiKey
  } catch (error) {
    console.error('Failed to load slicer API key:', error)
  } finally {
    isLoading.value = false
  }
}

async function generateApiKey() {
  isRegenerating.value = true
  try {
    const response = await SettingsService.regenerateSlicerApiKey()
    slicerApiKey.value = response.slicerApiKey
    showSuccessMessage('API key generated successfully')
  } catch (error) {
    console.error('Failed to generate API key:', error)
  } finally {
    isRegenerating.value = false
  }
}

function confirmRegenerate() {
  showRegenerateDialog.value = true
}

async function regenerateApiKey() {
  showRegenerateDialog.value = false
  isRegenerating.value = true
  try {
    const response = await SettingsService.regenerateSlicerApiKey()
    slicerApiKey.value = response.slicerApiKey
    showSuccessMessage('API key regenerated successfully')
  } catch (error) {
    console.error('Failed to regenerate API key:', error)
  } finally {
    isRegenerating.value = false
  }
}

function confirmDelete() {
  showDeleteDialog.value = true
}

async function deleteApiKey() {
  showDeleteDialog.value = false
  isDeleting.value = true
  try {
    await SettingsService.deleteSlicerApiKey()
    slicerApiKey.value = null
    showSuccessMessage('API key deleted')
  } catch (error) {
    console.error('Failed to delete API key:', error)
  } finally {
    isDeleting.value = false
  }
}

async function copyApiKey() {
  if (!slicerApiKey.value) return

  try {
    await navigator.clipboard.writeText(slicerApiKey.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}

function showSuccessMessage(message: string) {
  successMessage.value = message
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}

onMounted(async () => {
  await loadApiKey()
})
</script>

