<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    location="bottom"
    min-width="300"
  >
    <template #activator="{ props }">
      <v-btn
        variant="tonal"
        v-bind="props"
        class="mr-2"
      >
        <v-icon class="mr-2">dashboard</v-icon>
        {{ totalPrinters }} Printers
      </v-btn>
    </template>

    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">dashboard</v-icon>
        Printer Status
      </v-card-title>

      <v-card-text class="pa-0">
        <v-list density="compact">
          <v-list-item>
            <template #prepend>
              <v-icon color="success">print</v-icon>
            </template>
            <v-list-item-title>Printing</v-list-item-title>
            <template #append>
              <v-chip size="small" color="success">{{ printingCount }}</v-chip>
            </template>
          </v-list-item>

          <v-list-item>
            <template #prepend>
              <v-icon color="info">ac_unit</v-icon>
            </template>
            <v-list-item-title>Operational</v-list-item-title>
            <template #append>
              <v-chip size="small" color="info">{{ operationalCount }}</v-chip>
            </template>
          </v-list-item>

          <v-list-item>
            <template #prepend>
              <v-icon color="warning">handyman</v-icon>
            </template>
            <v-list-item-title>Maintenance</v-list-item-title>
            <template #append>
              <v-chip size="small" color="warning">{{ maintenanceCount }}</v-chip>
            </template>
          </v-list-item>

          <v-list-item>
            <template #prepend>
              <v-icon color="error">usb_off</v-icon>
            </template>
            <v-list-item-title>Disconnected</v-list-item-title>
            <template #append>
              <v-chip size="small" color="error">{{ disconnectedCount }}</v-chip>
            </template>
          </v-list-item>

          <v-list-item>
            <template #prepend>
              <v-icon>print_disabled</v-icon>
            </template>
            <v-list-item-title>Disabled</v-list-item-title>
            <template #append>
              <v-chip size="small">{{ disabledCount }}</v-chip>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions>
        <v-btn
          variant="tonal"
          color="primary"
          block
          prepend-icon="dashboard"
          @click="goToDashboard"
        >
          View Dashboard
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePrinterStore } from '@/store/printer.store'
import { usePrinterStateStore } from '@/store/printer-state.store'

const menu = ref(false)
const router = useRouter()
const printerStore = usePrinterStore()
const printerStateStore = usePrinterStateStore()

const totalPrinters = computed(() => printerStore.printers.length)
const printingCount = computed(() => printerStateStore.printingCount)
const operationalCount = computed(() => printerStateStore.operationalNotPrintingCount)
const maintenanceCount = computed(() => printerStore.maintenanceCount)
const disconnectedCount = computed(() => printerStore.disconnectedCount)
const disabledCount = computed(() => printerStore.disabledCount)

function goToDashboard() {
  menu.value = false
  router.push('/')
}
</script>
