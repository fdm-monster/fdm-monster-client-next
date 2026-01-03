<template>
  <div>
    <v-card>
      <v-card-title class="d-flex align-center">
        <div class="d-flex align-center ga-2">
          <PrinterTagFilter
            v-model="selectedTagIds"
            :tags="tags"
            label="Filter by tags"
            style="width: 220px"
          />
          <PrinterTypeFilter
            v-model="selectedPrinterTypes"
            style="width: 220px"
          />
          <v-text-field
            v-model="search"
            clearable
            label="Search"
            prepend-inner-icon="search"
            density="compact"
            variant="outlined"
            hide-details
            style="width: 220px"
          />
        </div>
        <v-spacer/>
        <div class="d-flex align-center ga-2">
          <v-btn
            variant="elevated"
            color="purple"
            prepend-icon="publish"
            @click="openImportOctoFarmPrintersDialog()"
          >
            Import OctoFarm
          </v-btn>
          <v-btn
            variant="elevated"
            color="success"
            prepend-icon="add"
            @click="openCreatePrinterDialog()"
          >
            Create Printer
          </v-btn>
          <v-btn
            variant="elevated"
            prepend-icon="label"
            @click="openManageTagsDialog()"
          >
            Manage Tags
          </v-btn>
          <v-btn
            variant="elevated"
            color="primary"
            prepend-icon="code"
            @click="openYamlImportExportDialog()"
          >
            Import/Export Backup
          </v-btn>
        </div>
      </v-card-title>

      <v-data-table
        v-model:expanded="expanded"
        :headers="tableHeaders"
        :items="printers"
        :search="search"
        class="elevation-1"
        item-value="id"
        show-expand
      >
        <template #no-data>
          <div class="mt-4 mb-4">
            <h3 v-if="printers.length === 0">
              No printer has been created yet. Create one here:
            </h3>
            <h3 v-else>
              No printer has been found. Adjust your filters or search criteria.
            </h3>
            <PrinterCreateAction/>
          </div>
        </template>
        <template #item.enabled="{ item }">
          <v-switch
            v-model="item.enabled"
            color="primary"
            inset
            @click.native.capture.stop="toggleEnabled(item)"
          >
            {{ item.enabled }}
          </v-switch>
        </template>
        <template v-slot:item.printerType="{ item }">
          {{ getServiceName(item.printerType) }}
        </template>
        <template v-slot:item.name="{ item }">
          <v-chip>
            {{ item.name || item.printerURL }}
          </v-chip>
        </template>
        <template #item.floor="{ item }">
          <div class="d-flex align-center ga-1">
            <v-chip
              v-if="floorOfPrinter(item.id)"
              closable
              size="small"
              @click="openFloorEditDialog(floorOfPrinter(item.id)?.id)"
              @click:close="removePrinterFromFloor(item.id)"
            >
              <v-icon start size="x-small">layers</v-icon>
              {{ floorOfPrinter(item.id)?.name }}
            </v-chip>
            <span v-else class="text-caption text-medium-emphasis">
              No floor
            </span>

            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="x-small"
                  icon
                  variant="text"
                >
                  <v-icon>more_vert</v-icon>
                </v-btn>
              </template>

              <v-list density="compact" min-width="200">
                <v-list-item
                  prepend-icon="grid_on"
                  @click="goToPrinterGrid(item.id)"
                >
                  <v-list-item-title>
                    {{ floorOfPrinter(item.id) ? 'View Floor Grid' : 'View Printer Grid' }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
        <template #item.cameras="{ item }">
          <div class="d-flex align-center flex-wrap ga-1">
            <v-chip
              v-for="(camera, _) in camerasOfPrinter(item.id).slice(0, 2)"
              :key="camera.id"
              size="x-small"
              variant="tonal"
              @click="openCameraEditDialog(camera.id)"
            >
              <v-icon start size="x-small">videocam</v-icon>
              {{ camera.name }}
            </v-chip>
            <v-chip
              v-if="camerasOfPrinter(item.id).length > 2"
              size="x-small"
              variant="text"
            >
              +{{ camerasOfPrinter(item.id).length - 2 }} more
            </v-chip>
            <span v-if="!camerasOfPrinter(item.id).length" class="text-caption text-medium-emphasis">
              No cameras
            </span>

            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="x-small"
                  icon
                  variant="text"
                >
                  <v-icon>more_vert</v-icon>
                </v-btn>
              </template>

              <v-list density="compact" min-width="180">
                <v-list-item
                  prepend-icon="videocam"
                  @click="goToCameraPageForPrinter(item.id)"
                >
                  <v-list-item-title>View Cameras</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
        <template #item.group="{ item }">
          <div class="d-flex align-center flex-wrap ga-1">
            <v-chip
              v-for="tag of tagsOfPrinter(item.id)"
              :key="tag.id"
              :color="tag.color"
              size="small"
              variant="tonal"
              closable
              @click="openManageTagsDialogAndEdit(tag.id)"
              @click:close="deletePrinterFromTag(tag.id, item.id)"
            >
              <v-icon start size="x-small">label</v-icon>
              {{ tag.name }}
            </v-chip>

            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  :disabled="!nonTagsOfPrinter(item.id).length"
                  size="x-small"
                  icon
                  variant="text"
                >
                  <v-icon>add</v-icon>
                </v-btn>
              </template>

              <v-list density="compact" min-width="150">
                <v-list-subheader>Add Tag</v-list-subheader>
                <v-list-item
                  v-for="(tag, index) in nonTagsOfPrinter(item.id)"
                  :key="index"
                  @click="addPrinterToTag(tag.id, item.id)"
                >
                  <template v-slot:prepend>
                    <v-chip
                      :color="tag.color"
                      size="x-small"
                      variant="flat"
                      class="mr-2"
                    >
                      <v-icon size="x-small">label</v-icon>
                    </v-chip>
                  </template>
                  <v-list-item-title>{{ tag.name }}</v-list-item-title>
                </v-list-item>
                <v-list-item v-if="!nonTagsOfPrinter(item.id).length" disabled>
                  <v-list-item-title class="text-caption">All tags assigned</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
        <template #item.actions="{ item }">
          <div class="d-flex align-center">
            <!-- Core actions -->
            <div class="d-flex ga-1">
              <FileExplorerAction :printer="item"/>
              <PrinterSettingsAction
                :printer="item"
                @update:show="openEditDialog(item)"
              />
              <PrinterDeleteAction :printer="item"/>
              <PrinterUrlAction :printer="item"/>
              <PrinterQuickStopAction :printer="item"/>
              <PrinterConnectionAction :printer="item"/>
              <SyncPrinterNameAction :printer="item"/>
            </div>
          </div>
        </template>
        <template #item.socketupdate="{ item }">
          <span v-if="currentEventReceivedAt[item.id]">
            Updated {{ diffSeconds(currentEventReceivedAt[item.id]) }} seconds
            ago
          </span>
          <span v-else> No update received (silence) </span>
        </template>
        <template #expanded-row="{ item, columns }">
          <td :colspan="columns.length">
            <PrinterDetails :printer="item"/>
          </td>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PrintersService } from '@/backend/printers.service'
import PrinterDetails from '@/components/PrinterList/PrinterDetails.vue'
import PrinterTagFilter from '@/components/Generic/Filters/PrinterTagFilter.vue'
import PrinterTypeFilter from '@/components/Generic/Filters/PrinterTypeFilter.vue'
import PrinterUrlAction from '@/components/Generic/Actions/PrinterUrlAction.vue'
import PrinterSettingsAction from '@/components/Generic/Actions/PrinterSettingsAction.vue'
import PrinterConnectionAction from '@/components/Generic/Actions/PrinterConnectionAction.vue'
import PrinterQuickStopAction from '@/components/Generic/Actions/PrinterQuickStopAction.vue'
import FileExplorerAction from '@/components/Generic/Actions/FileExplorerAction.vue'
import SyncPrinterNameAction from '@/components/Generic/Actions/SyncPrinterNameAction.vue'

import { usePrinterStore } from '@/store/printer.store'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import PrinterCreateAction from '@/components/Generic/Actions/PrinterCreateAction.vue'
import PrinterDeleteAction from '@/components/Generic/Actions/PrinterDeleteAction.vue'
import { useFloorStore } from '@/store/floor.store'
import { usePrinterStateStore } from '@/store/printer-state.store'
import { PrinterDto } from '@/models/printers/printer.model'
import { useFeatureStore } from '@/store/features.store'
import { useQuery } from '@tanstack/vue-query'
import { useSnackbar } from '@/shared/snackbar.composable'
import {
  TagWithPrintersDto,
  TagDto,
  PrinterTagService
} from '@/backend/printer-tag.service'
import { useDialog } from '@/shared/dialog.composable'
import { VDataTable } from 'vuetify/components'
import { getServiceName } from '@/shared/printer-types.constants'
import { CameraStreamService } from '@/backend/camera-stream.service'
import { printerTagsQueryKey } from '@/queries/printer-tags.query'

const snackbar = useSnackbar()
const router = useRouter()
const printerStore = usePrinterStore()
const loading = ref<boolean>(false)
const printerStateStore = usePrinterStateStore()
const floorStore = useFloorStore()
const featureStore = useFeatureStore()

const addOrUpdatePrinterDialog = useDialog(DialogName.AddOrUpdatePrinterDialog)

const tagsWithPrinters = ref<TagWithPrintersDto[]>([])
const tags = ref<TagDto[]>([])
const selectedTagIds = ref<number[]>([])
const selectedPrinterTypes = ref<number[]>([])
const cameras = ref<any[]>([])

type ReadonlyHeaders = VDataTable['$props']['headers']

const search = ref('')
const expanded = ref<string[]>([])

const tableHeaders = computed(
  () =>
    [
      { title: 'Enabled', key: 'enabled' },
      { title: 'Type', key: 'printerType' },
      { title: 'Printer Name', align: 'start', sortable: true, key: 'name' },
      { title: 'Floor', key: 'floor', sortable: false },
      { title: 'Tags', key: 'group', sortable: true },
      { title: 'Cameras', key: 'cameras', sortable: false },
      { title: 'Actions', key: 'actions', sortable: false },
      { title: 'Socket Update', key: 'socketupdate', sortable: false },
      { title: '', key: 'data-table-expand' }
    ] as ReadonlyHeaders
)

async function loadData() {
  loading.value = true
  await featureStore.loadFeatures()
  tagsWithPrinters.value = await PrinterTagService.getTagsWithPrinters()
  tags.value = tagsWithPrinters.value.map(g => ({ id: g.id, name: g.name, color: g.color }))

  cameras.value = await CameraStreamService.listCameraStreams()

  loading.value = false
  return tagsWithPrinters
}

const printerTagsQuery = useQuery({
  queryKey: [printerTagsQueryKey],
  queryFn: loadData
})

const printers = computed(() => {
  let filtered = printerStore.printers

  // Filter by tags
  if (selectedTagIds.value?.length > 0) {
    const printerIdsInSelectedTags = tagsWithPrinters.value
      .filter(g => selectedTagIds.value.includes(g.id))
      .flatMap(g => g.printers.map(p => p.printerId))
    filtered = filtered.filter((p) =>
      printerIdsInSelectedTags.includes(p.id)
    )
  }

  // Filter by printer type
  if (selectedPrinterTypes.value?.length > 0) {
    filtered = filtered.filter((p) =>
      selectedPrinterTypes.value.includes(p.printerType)
    )
  }

  return filtered
})

const currentEventReceivedAt = computed(
  () => printerStateStore.printerCurrentEventReceivedAtById
)

const diffSeconds = (timestamp: number) => {
  if (!timestamp) return
  const now = Date.now()
  return (now - timestamp) / 1000
}

const tagsOfPrinter = (printerId: number) => {
  return tagsWithPrinters.value.filter((g) =>
    g.printers.find((p) => p.printerId === printerId)
  )
}

const nonTagsOfPrinter = (printerId: number) => {
  return tagsWithPrinters.value.filter(
    (g) => !g.printers.some((p) => p.printerId === printerId)
  )
}

const floorOfPrinter = (printerId: number) => {
  return floorStore.floorOfPrinter(printerId)
}

const camerasOfPrinter = (printerId: number) => {
  return cameras.value.filter(camera => camera.printerId === printerId)
}

const openEditDialog = (printer: PrinterDto) => {
  addOrUpdatePrinterDialog.openDialog({ id: printer.id })
}

const openCreatePrinterDialog = () => {
  addOrUpdatePrinterDialog.openDialog()
}

const openImportOctoFarmPrintersDialog = () => {
  useDialog(DialogName.ImportOctoFarmDialog).openDialog()
}

const openYamlImportExportDialog = () => {
  useDialog(DialogName.YamlImportExport).openDialog()
}

const openManageTagsDialog = () => {
  useDialog(DialogName.ManageTagsDialog).openDialog()
}

const openManageTagsDialogAndEdit = (tagId: number) => {
  const tag = tagsWithPrinters.value.find(t => t.id === tagId)
  if (tag) {
    const manageTagsDialog = useDialog(DialogName.ManageTagsDialog)
    manageTagsDialog.openDialog({ tagId, tagName: tag.name })
  }
}

const goToPrinterGrid = (printerId: number) => {
  const floor = floorOfPrinter(printerId)
  if (floor) {
    router.push({
      path: '/printer-grid',
      query: { floor: floor.id.toString() }
    })
  } else {
    router.push('/printer-grid')
  }
}

const openFloorEditDialog = (floorId?: number) => {
  if (floorId) {
    useDialog(DialogName.AddOrUpdateFloorDialog).openDialog({ printerFloorId: floorId })
  }
}

const openCameraEditDialog = (cameraId?: number) => {
  if (cameraId) {
    useDialog(DialogName.AddOrUpdateCameraDialog).openDialog({ addOrUpdate: 'update', cameraId })
  }
}

const goToCameraPageForPrinter = (printerId: number) => {
  router.push({
    path: '/cameras',
    query: { printer: printerId.toString() }
  })
}

const addPrinterToTag = async (tagId: number, printerId: number) => {
  await PrinterTagService.addPrinterToTag(tagId, printerId)
  await printerTagsQuery.refetch()
  snackbar.info('Added printer to tag')
}

const deletePrinterFromTag = async (tagId: number, printerId: number) => {
  await PrinterTagService.deletePrinterTag(tagId, printerId)
  await printerTagsQuery.refetch()
  snackbar.info('Removed printer from tag')
}

const removePrinterFromFloor = async (printerId: number) => {
  const floor = floorOfPrinter(printerId)
  if (!floor) {
    snackbar.error('Printer is not assigned to any floor')
    return
  }

  if (!confirm(`Remove printer from floor "${floor.name}"?`)) {
    return
  }

  await floorStore.deletePrinterFromFloor({
    floorId: floor.id,
    printerId
  })
  snackbar.info('Removed printer from floor')
}

const toggleEnabled = async (printer: PrinterDto) => {
  if (!printer.id) {
    throw new Error('Printer ID not set, cant toggle enabled')
  }

  printer.enabled = !printer.enabled
  await PrintersService.toggleEnabled(printer.id, printer.enabled)
}
</script>

<style lang="scss">
.disabled-highlight tbody {
  tr:hover {
    background-color: transparent !important;
  }
}

.reorder-row-icon {
  cursor: move;
}
</style>
