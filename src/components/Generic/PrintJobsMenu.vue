<template>
  <div class="text-center">
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      :nudge-width="400"
      location="bottom right"
      offset-x
      offset-y

      transition="slide-x-transition">
      <template #activator="{props}">
        <v-btn
          :color="activePrintCount ? 'green' : 'secondary'"
          dark
          v-bind="props">
          <span>
            Print jobs {{ activePrintCount ? `(${activePrintCount})` : "" }}
          </span>
          <v-icon end>work</v-icon>
        </v-btn>
      </template>

      <v-card
        class="d-flex flex-column"
        min-width="300">
        <v-list style="overflow-y: hidden; flex-shrink: 0">
          <v-list-item>
            <template #prepend>
              <v-avatar
                class="font-weight-bold"
                color="primary"
                size="44">
                {{ activePrintCount }}
              </v-avatar>
            </template>

            <v-list-item-title>
              Print Jobs
              <span class="float-end">
                <v-btn
                  variant="tonal"
                  @click="menu = false">
                  <v-icon>close</v-icon>Close
                </v-btn>
              </span>
            </v-list-item-title>

            <v-list-item-action class="mt-2">
              <v-text-field
                v-model="searchString"
                autofocus
                class="p-2"
                clearable
                label="Search jobs or printers"
                persistent-placeholder
                placeholder="Type part of a filename or printer name to search"
                prepend-icon="search"
                style="min-width: 900px" />
            </v-list-item-action>
          </v-list-item>
        </v-list>

        <v-divider />

        <v-list style="overflow-y: auto; flex-shrink: 1">
          <v-list-item v-if="!activePrintCount">
            No active prints
          </v-list-item>
          <v-list-item
            v-for="{printer, job} of activePrintJobs"
            :key="printer.id"
            lines="two">
            <template #prepend>
              <v-avatar size="70">
                <v-progress-circular
                  :model-value="job?.progress?.completion"
                  :width="5"
                  color="green"
                  size="50">
                  {{
                    truncateProgress(job.progress?.completion) + "%" || ""
                  }}
                </v-progress-circular>
              </v-avatar>
            </template>

            <v-list-item-title>
              {{ job.job?.file?.name }}
            </v-list-item-title>

            <v-list-item-subtitle>
              Elapsed:
              {{ Math.round(job?.progress.printTime ?? 0 / 60) }} minutes
              <br>
              Printer: {{ printer.name }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <v-card-actions>
          <v-spacer />

          <v-btn @click="menu = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script lang="ts" setup>
import {usePrinterStateStore} from '@/store/printer-state.store'

const printerStateStore = usePrinterStateStore()
const searchString = ref('')
const menu = ref(false)

const activePrintJobs = computed(() => {
  return printerStateStore.printersWithJob.filter((p) => {
    const fileName = p.job?.job?.file.name
    const fileNameSearch = fileName?.toLowerCase() || ''
    const printerUrlSearch = p.printer.printerURL?.toLowerCase() || ''
    const searchSearch = p.printer.name?.toLowerCase() || ''

    const combineSearch = `${fileNameSearch} ${printerUrlSearch} ${searchSearch}`
    return !searchString.value || combineSearch.includes(searchString.value.toLowerCase())
  })
})

const activePrintCount = computed(() => {
  return activePrintJobs.value.length || 0
})

function truncateProgress(progress: number) {
  if (!progress) return ''
  return progress?.toFixed(0)
}

watch(menu, () => {
  searchString.value = ''
})
</script>
