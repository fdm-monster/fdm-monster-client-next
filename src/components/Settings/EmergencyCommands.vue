<template>
  <v-card>
    <SettingsToolbar :icon="page.icon" :title="page.title" />
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

      <v-divider />

      <SettingSection
        title="Batch USB connect"
        tooltip="Connect all USB devices"
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
        tooltip="Connect all Sockets"
      >
        <v-btn
          :disabled="isLoading || noPrintersOrAllDisabled"
          color="primary"
          @click="connectSockets"
        >
          <v-icon class="mr-2">hub</v-icon>
          Connect Sockets
        </v-btn>
        <v-progress-circular
          v-if="isLoading"
          class="ml-2"
          indeterminate
          size="30"
          width="4"
        />
      </SettingSection>

      <v-divider />

      <SettingSection
        title="Test all OctoPrint response times"
        :usecols="false"
      >
        <v-btn
          :loading="isLoading"
          color="primary"
          @click="clickFetchNameState()"
        >
          Measure network response times
        </v-btn>
        <div class="mt-3">
          <span v-if="namesFetched">Response times:</span>
          <Bar
            v-if="namesFetched"
            :data="chartConfig"
            :options="chartOptions"
            height="100"
            style="background-color: #272727"
          />
          <span v-else>
            A graph will be shown, presenting the times in milliseconds (ms)
          </span>
        </div>
      </SettingSection>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { BatchService } from '@/backend/batch.service'
import { usePrinterStore } from '@/store/printer.store'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartData,
  ChartOptions,
  Legend,
  LinearScale,
  Title,
  Tooltip
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import { OctoPrintSettingsDto } from '@/backend/dto/octoprint-settings.dto'
import SettingsToolbar from '@/components/Settings/Shared/SettingsToolbar.vue'
import SettingSection from '@/components/Settings/Shared/SettingSection.vue'
import { settingsPage } from '@/components/Settings/Shared/setting.constants'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const page = settingsPage['emergencyCommands']

export type BatchOctoPrintSettingsDto = {
  success: boolean
  printerId: number
  time: number
  value?: OctoPrintSettingsDto
  error?: string
}

const printerStore = usePrinterStore()

const isLoading = ref(false)
const namesFetched = ref(false)
const fetchedNames = ref<string[]>([])

const failedPrinters = ref<any[]>([])
const responseTimesAvg = ref(NaN)
const responseTimesMax = ref(NaN)
const responseTimesMin = ref(NaN)
const chartConfig = ref<ChartData<'bar', number[], string>>({
  labels: [] as string[],
  datasets: [
    {
      label: 'OctoPrint Settings response times (ms)',
      data: [] as number[],
      borderColor: '#FF6384',
      backgroundColor: '#ffffff'
    }
  ]
})

const chartOptions: ChartOptions<'bar'> = {
  color: 'white',
  plugins: {
    title: {
      color: 'red',
      text: 'Response times (ms)',
      display: true
    }
  },
  responsive: true
}

const noPrintersOrAllDisabled = computed(() => {
  return (
    printerStore.printers.length === 0 ||
    printerStore.printers.every((printer) => !printer.enabled)
  )
})

const noPrintersOrAllEnabled = computed(() => {
  return (
    printerStore.printers.length === 0 ||
    printerStore.printers.every((printer) => !!printer.enabled)
  )
})

async function clickFetchNameState() {
  try {
    isLoading.value = true
    const printerIds = printerStore.printers.map((p) => p.id)
    const printerSettingsBatch = (await BatchService.batchSettingsGet(
      printerIds
    )) as BatchOctoPrintSettingsDto[]
    const names = printerSettingsBatch.map(
      (s) => s.value?.appearance?.name || 'ERROR'
    )
    failedPrinters.value = printerSettingsBatch
      .filter((nb) => !nb.success)
      .map((e) => ({
        message: e.error
      }))

    const times = printerSettingsBatch.map((n) => n.time)
    const labels = printerSettingsBatch.map(
      (n) => n.value?.appearance?.name ?? ''
    )
    responseTimesAvg.value =
      times.reduce((a: number, b: number) => a + b, 0) / times.length
    responseTimesMin.value = Math.min(...times)
    responseTimesMax.value = Math.max(...times)
    chartConfig.value = {
      labels,
      datasets: [
        {
          label: 'OctoPrint Settings response times (ms)',
          data: times,
          borderColor: '#FF6384',
          backgroundColor: '#ffffff'
        }
      ]
    }

    namesFetched.value = true
    fetchedNames.value = names
  } finally {
    isLoading.value = false
  }
}

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
