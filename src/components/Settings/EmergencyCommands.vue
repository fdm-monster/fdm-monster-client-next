<template>
  <v-card>
    <v-card-text>
      <SettingSection
        title="Batch disabling"
        tooltip="Disable all printers in batch (will not affect print)"
      >
        <v-btn
          :disabled="isLoading || noPrintersOrAllDisabled"
          color="primary"
          @click="batchToggleEnabled(false)"
        >
          Batch disable
        </v-btn>
        <v-progress-circular
          v-if="isLoading"
          class="ml-2"
          indeterminate
          size="30"
          width="4"
        />
        <v-icon
          v-if="noPrintersOrAllDisabled"
          class="ml-2"
          color="warning"
        >
          warning
        </v-icon>
      </SettingSection>

      <v-divider />

      <SettingSection
        title="Batch enabling"
        tooltip="Enabling all printers in batch (will not affect print and it will skip printers in maintenance mode)"
      >
        <v-btn
          :disabled="isLoading || noPrintersOrAllEnabled"
          color="primary"
          @click="batchToggleEnabled(true)"
        >
          Batch enable
        </v-btn>
        <v-progress-circular
          v-if="isLoading"
          class="ml-2"
          indeterminate
          size="30"
          width="4"
        />
        <v-icon
          v-if="noPrintersOrAllEnabled"
          class="ml-2"
          color="warning"
        >
          warning
        </v-icon>
      </SettingSection>

      <v-divider v-if="hasUsbPrinters" />

      <SettingSection
        v-if="hasUsbPrinters"
        title="Batch USB connect"
        tooltip="Connect all USB devices (OctoPrint only)"
      >
        <v-btn
          :disabled="isLoading || noPrintersOrAllDisabled"
          color="primary"
          @click="connectUSBs"
        >
          <v-icon class="mr-2">usb</v-icon>
          Connect USBs
        </v-btn>
        <v-progress-circular
          v-if="isLoading"
          class="ml-2"
          indeterminate
          size="30"
          width="4"
        />
      </SettingSection>

      <SettingSection
        title="Batch Socket connect"
        tooltip="Connect all Network Connections"
      >
        <v-btn
          :disabled="isLoading || noPrintersOrAllDisabled"
          color="primary"
          @click="connectSockets"
        >
          <v-icon class="mr-2">hub</v-icon>
          Refresh Network Connections
        </v-btn>
        <v-progress-circular
          v-if="isLoading"
          class="ml-2"
          indeterminate
          size="30"
          width="4"
        />
      </SettingSection>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { BatchService } from '@/backend/batch.service'
import { usePrinterStore } from '@/store/printer.store'
import SettingsToolbar from '@/components/Settings/Shared/SettingsToolbar.vue'
import SettingSection from '@/components/Settings/Shared/SettingSection.vue'
import { settingsPage } from '@/router/setting.constants'
import { hasSerialConnection } from '@/shared/printer-capabilities.constants'

const page = settingsPage['emergencyCommands']
const printerStore = usePrinterStore()

const isLoading = ref(false)

const hasUsbPrinters = computed(() => {
  return printerStore.printers.some(p => hasSerialConnection(p.printerType))
})

const noPrintersOrAllDisabled = computed(() => {
  return (
    printerStore.printers.every((printer) => !printer.enabled)
  )
})

const noPrintersOrAllEnabled = computed(() => {
  return (
    printerStore.printers.every((printer) => !!printer.enabled)
  )
})

async function batchToggleEnabled(enabled: boolean) {
  if (!confirm('Are you sure you want to toggle all printers?')) {
    return
  }

  isLoading.value = true
  try {
    await BatchService.batchToggleEnabled(
      printerStore.printers.map((p) => p.id),
      enabled
    )
  } finally {
    isLoading.value = false
  }
}

async function connectUSBs() {
  if (!confirm('Are you sure you want to connect all USBs?')) {
    return
  }
  try {
    await BatchService.batchConnectUsb(printerStore.printers.map((p) => p.id))
  } finally {
    isLoading.value = false
  }
}

async function connectSockets() {
  if (!confirm('Are you sure you want to connect all sockets?')) {
    return
  }
  isLoading.value = true
  await BatchService.batchConnectSocket(printerStore.printers.map((p) => p.id))
  isLoading.value = false
}
</script>
