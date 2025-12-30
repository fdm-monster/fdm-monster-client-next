<template>
  <v-card>
    <SettingsToolbar :icon="page.icon" :title="page.title" />
    <v-card-text>
      <SettingSection
        title="Experimental Server Features"
        tooltip="Moonraker support is currently in beta, use at your own risk."
        :usecols="false"
      >
        <div class="d-flex align-center mb-2">
          <v-checkbox
            v-model="experimentalMoonrakerSupport"
            :disabled="isMoonrakerSupportLoading"
            @change="updateMoonrakerSupport"
            hide-details
            label="Enable Experimental Moonraker Support"
          />
          <v-progress-circular
            v-if="isMoonrakerSupportLoading"
            indeterminate
            size="30"
            width="4"
            class="ml-2"
          />
          <v-icon v-if="showMoonrakerSuccess" color="success" class="ml-2">
            check_circle
          </v-icon>
        </div>

        <v-alert v-if="experimentalMoonrakerSupport" color="warning" variant="tonal" class="mb-2">
          Disabling Moonraker support will disable all printers of type Moonraker. You need to
          re-enable them after re-enabling this feature.
        </v-alert>

        <div class="d-flex align-center mb-2">
          <v-checkbox
            v-model="experimentalPrusaLinkSupport"
            :disabled="isPrusaLinkSupportLoading"
            @change="updatePrusaLinkSupport"
            hide-details
            label="Enable Experimental PrusaLink Support"
          />
          <v-progress-circular
            v-if="isPrusaLinkSupportLoading"
            indeterminate
            size="30"
            width="4"
            class="ml-2"
          />
          <v-icon v-if="showPrusaLinkSuccess" color="success" class="ml-2">
            check_circle
          </v-icon>
        </div>

        <div class="d-flex align-center">
          <v-checkbox
            v-model="experimentalBambuSupport"
            :disabled="isBambuSupportLoading"
            @change="updateBambuSupport"
            hide-details
            label="Enable Experimental Bambu Support"
          />
          <v-progress-circular
            v-if="isBambuSupportLoading"
            indeterminate
            size="30"
            width="4"
            class="ml-2"
          />
          <v-icon v-if="showBambuSuccess" color="success" class="ml-2">
            check_circle
          </v-icon>
        </div>
      </SettingSection>

      <v-divider />

      <SettingSection
        title="Experimental Thumbnail Support"
        tooltip="Thumbnails are extracted from gcode. Please enable PNG thumbnails in your slicer."
        :usecols="false"
      >
        <div class="d-flex align-center">
          <v-checkbox
            v-model="experimentalThumbnailSupport"
            :disabled="isThumbnailSupportLoading"
            @change="updateThumbnailSupport"
            hide-details
            label="Enable Experimental Thumbnail Support"
          />
          <v-progress-circular
            v-if="isThumbnailSupportLoading"
            indeterminate
            size="30"
            width="4"
            class="ml-2"
          />
          <v-icon v-if="showThumbnailSuccess" color="success" class="ml-2">
            check_circle
          </v-icon>
        </div>
      </SettingSection>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { SettingsService } from '@/backend'
import SettingsToolbar from '@/components/Settings/Shared/SettingsToolbar.vue'
import SettingSection from '@/components/Settings/Shared/SettingSection.vue'
import { settingsPage } from '@/components/Settings/Shared/setting.constants'

const page = settingsPage['experimental']
const experimentalMoonrakerSupport = ref(false)
const experimentalPrusaLinkSupport = ref(false)
const experimentalBambuSupport = ref(false)
const experimentalThumbnailSupport = ref(false)
const isMoonrakerSupportLoading = ref(false)
const isPrusaLinkSupportLoading = ref(false)
const isBambuSupportLoading = ref(false)
const isThumbnailSupportLoading = ref(false)
const showMoonrakerSuccess = ref(false)
const showPrusaLinkSuccess = ref(false)
const showBambuSuccess = ref(false)
const showThumbnailSuccess = ref(false)

async function loadSettings() {
  const settings = await SettingsService.getSettings()
  experimentalMoonrakerSupport.value = settings.server.experimentalMoonrakerSupport
  experimentalPrusaLinkSupport.value = settings.server.experimentalPrusaLinkSupport
  experimentalBambuSupport.value = settings.server.experimentalBambuSupport
  experimentalThumbnailSupport.value = settings.server.experimentalThumbnailSupport
}

onMounted(async () => {
  await loadSettings()
})

const updateMoonrakerSupport = async () => {
  isMoonrakerSupportLoading.value = true
  showMoonrakerSuccess.value = false

  try {
    await SettingsService.updateExperimentalMoonrakerSupport(experimentalMoonrakerSupport.value)
    await loadSettings()
    setTimeout(() => {
      isMoonrakerSupportLoading.value = false
      showMoonrakerSuccess.value = true
    }, 250)

    setTimeout(() => {
      showMoonrakerSuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('Failed to update Moonraker support:', error)
    experimentalMoonrakerSupport.value = !experimentalMoonrakerSupport.value
    isMoonrakerSupportLoading.value = false
  }
}

const updatePrusaLinkSupport = async () => {
  isPrusaLinkSupportLoading.value = true
  showPrusaLinkSuccess.value = false

  try {
    await SettingsService.updateExperimentalPrusaLinkSupport(experimentalPrusaLinkSupport.value)
    await loadSettings()
    setTimeout(() => {
      isPrusaLinkSupportLoading.value = false
      showPrusaLinkSuccess.value = true
    }, 250)

    setTimeout(() => {
      showPrusaLinkSuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('Failed to update PrusaLink support:', error)
    experimentalPrusaLinkSupport.value = !experimentalPrusaLinkSupport.value
    isPrusaLinkSupportLoading.value = false
  }
}

const updateBambuSupport = async () => {
  isBambuSupportLoading.value = true
  showBambuSuccess.value = false

  try {
    await SettingsService.updateExperimentalBambuSupport(experimentalBambuSupport.value)
    await loadSettings()
    setTimeout(() => {
      isBambuSupportLoading.value = false
      showBambuSuccess.value = true
    }, 250)

    setTimeout(() => {
      showBambuSuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('Failed to update Bambu support:', error)
    experimentalBambuSupport.value = !experimentalBambuSupport.value
    isBambuSupportLoading.value = false
  }
}

const updateThumbnailSupport = async () => {
  isThumbnailSupportLoading.value = true
  showThumbnailSuccess.value = false

  try {
    await SettingsService.updateExperimentalThumbnailSupport(experimentalThumbnailSupport.value)
    await loadSettings()
    setTimeout(() => {
      isThumbnailSupportLoading.value = false
      showThumbnailSuccess.value = true
    }, 250)

    setTimeout(() => {
      showThumbnailSuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('Failed to update Thumbnail support:', error)
    experimentalThumbnailSupport.value = !experimentalThumbnailSupport.value
    isThumbnailSupportLoading.value = false
  }
}
</script>
