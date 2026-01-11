<template>
  <v-col :cols="cols">
    <v-card
      class="pa-4"
      variant="tonal"
      color="surface-variant"
    >
      <div class="d-flex align-center justify-space-between mb-3">
        <h4 class="text-subtitle-1 font-weight-bold">Connection Tests</h4>
        <v-chip
          :color="hasFailures ? 'error' : 'success'"
          size="small"
          variant="flat"
        >
          {{ getEvents().length }}
        </v-chip>
      </div>

      <v-divider class="mb-4" />

      <div v-if="getEvents().length === 0" class="text-center py-6 text-medium-emphasis">
        <v-icon icon="mdi:mdi-information-outline" size="32" class="mb-2 opacity-50" />
        <div class="text-caption">No test results yet</div>
      </div>

      <div v-else class="checks-list">
        <div
          v-for="(item, index) of getEvents()"
          :key="index"
          class="check-item d-flex align-start mb-3"
        >
          <v-icon
            :color="item.color"
            :icon="item.failure ? 'mdi:mdi-close-circle' : 'mdi:mdi-check-circle'"
            size="18"
            class="mt-1 mr-3"
          />
          <div class="flex-grow-1">
            <div class="text-body-2 font-weight-medium">
              {{ item.label }}
            </div>
            <div
              v-if="item.text"
              class="text-caption text-medium-emphasis mt-1"
            >
              {{ item.text }}
            </div>
          </div>
        </div>
      </div>

      <v-divider v-if="getEvents().length > 0" class="mt-4 mb-3" />

      <div class="d-flex justify-center">
        <slot />
      </div>
    </v-card>
  </v-col>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useTestPrinterStore } from '@/store/test-printer.store'

const props = defineProps<{
  cols?: number
}>()

const cols = computed(() => props.cols || 4)

const testPrinterStore = useTestPrinterStore()

const getEvents = () => {
  return testPrinterStore.getEvents().map((e) => {
    return {
      label: e.event,
      text: e.payload,
      color: e.failure ? 'error' : 'success',
      failure: e.failure
    }
  })
}

const hasFailures = computed(() => {
  return getEvents().some(e => e.failure)
})
</script>
