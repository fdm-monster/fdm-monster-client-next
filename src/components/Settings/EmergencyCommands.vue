<template>
  <v-card>
    <v-toolbar color="primary">
      <v-avatar>
        <v-icon>settings</v-icon>
      </v-avatar>
      <v-toolbar-title> Emergency Commands </v-toolbar-title>
    </v-toolbar>
    <v-list
      subheader
      lines="three"
    >
      <v-list-subheader>
        Emergency Commands to rectify problematic situations
      </v-list-subheader>

      <v-list-item>
        <v-list-item-title> Batch disabling </v-list-item-title>
        <v-list-item-subtitle>
          Disable all printers in batch (will not affect print)
          <br />
          <v-btn
            :disabled="isLoading || noPrintersOrAllDisabled"
            color="primary"
            @click="batchToggleEnabled(false)"
            class="ml-4"
          >
            Batch disable
          </v-btn>
          <v-progress-circular
            v-if="isLoading"
            indeterminate
            size="30"
            width="4"
            class="ml-2"
          />
          <v-icon
            v-if="noPrintersOrAllDisabled"
            color="warning"
            class="ml-2"
          >
            warning
          </v-icon>
        </v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title> Batch enabling </v-list-item-title>
        <v-list-item-subtitle>
          Enabling all printers in batch (will not affect print and it will skip
          printers in maintenance mode)
          <br />
          <v-btn
            :disabled="isLoading || noPrintersOrAllEnabled"
            color="primary"
            @click="batchToggleEnabled(true)"
            class="ml-4"
          >
            Batch enable
          </v-btn>
          <v-progress-circular
            v-if="isLoading"
            indeterminate
            size="30"
            width="4"
            class="ml-2"
          />
          <v-icon
            v-if="noPrintersOrAllEnabled"
            color="warning"
            class="ml-2"
            v-tooltip.bottom="'No printers available'"
            >warning</v-icon
          >
        </v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title> Batch USB connect </v-list-item-title>
        <v-list-item-subtitle>
          Connect all USB devices
          <br />
          <v-btn
            :disabled="
              !hasConnectUsbFeature || isLoading || noPrintersOrAllDisabled
            "
            color="primary"
            @click="connectUSBs"
            class="ml-4"
          >
            <v-icon class="mr-2">usb</v-icon>
            Connect USBs
          </v-btn>
          <v-alert
            v-if="!hasConnectUsbFeature"
            class="ml-4 mt-2"
            type="warning"
            color="orange"
          >
            <v-icon class="mr-2">warning</v-icon> This feature requires an FDM
            Monster server update.
          </v-alert>
          <v-progress-circular
            v-if="isLoading"
            indeterminate
            size="30"
            width="4"
            class="ml-2"
          />
        </v-list-item-subtitle>
        <v-list-item-subtitle class="mt-2">
          Connect all Sockets
          <br />
          <v-btn
            :disabled="
              !hasConnectSocketFeature || isLoading || noPrintersOrAllDisabled
            "
            color="primary"
            @click="connectSockets"
            class="ml-4"
          >
            <v-icon class="mr-2">hub</v-icon>
            Connect Sockets
          </v-btn>
        </v-list-item-subtitle>
        <v-alert
          v-if="!hasConnectSocketFeature"
          class="ml-4 mt-2"
          type="warning"
          color="orange"
        >
          <v-icon class="mr-2">warning</v-icon> This feature requires an FDM
          Monster server update.
        </v-alert>
        <v-progress-circular
          v-if="isLoading"
          indeterminate
          size="30"
          width="4"
          class="ml-2"
        />
      </v-list-item>
    </v-list>

    <div class="ma-3">
      <v-alert> Test all OctoPrint response times </v-alert>
      <div class="ml-6">
        <v-btn
          color="primary"
          @click="clickFetchNameState()"
          :loading="isLoading"
        >
          Measure network response times
        </v-btn>
      </div>
      <div class="ml-7 mt-3">
        <span v-if="namesFetched"> Response times: </span>
        <Bar
          v-if="namesFetched"
          style="background-color: #272727"
          :data="chartConfig"
          :options="chartOptions"
          height="100"
        />
        <span v-else
          >A graph will be shown, presenting the times in milliseconds
          (ms)</span
        >
        <v-progress-circular
          v-if="isLoading"
          indeterminate
          size="30"
          width="4"
          class="ml-2"
        />
      </div>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { BatchService } from '@/backend/batch.service'
import { usePrinterStore } from '@/store/printer.store'
import { useFeatureStore } from '@/store/features.store'
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
import { IdType } from '@/utils/id.type'
import { OctoPrintSettingsDto } from '@/backend/dto/octoprint-settings.dto'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export type BatchOctoPrintSettingsDto = {
  success: boolean
  printerId: IdType
  time: number
  value?: OctoPrintSettingsDto
  error?: string
}

const printerStore = usePrinterStore()
const featureStore = useFeatureStore()

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

const hasConnectUsbFeature = computed(() => {
  return featureStore.hasFeature('batchConnectUsbCalls')
})
const hasConnectSocketFeature = computed(() => {
  return featureStore.hasFeature('batchConnectSocketCalls')
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
