<template>
  <div>
    <v-card>
      <v-card-title class="d-flex align-center">
        <span>Printers</span>
        <v-spacer />
        <div class="d-flex align-center ga-2">
          <PrinterTagFilter
            v-model="selectedTagIds"
            :tags="groups"
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
      </v-card-title>

      <v-data-table
        v-model:expanded="expanded"
        :headers="tableHeaders"
        :items="printers"
        :search="search"
        class="elevation-1"
        item-key="id"
        show-expand
        single-expand
        @click:row="clickRow"
      >
        <template #no-data>
          <div class="mt-4 mb-4">
            <h3 v-if="printers.length === 0">
              No printer has been created yet. Create one here:
            </h3>
            <h3 v-else>
              No printer has been found. Adjust your filters or search criteria.
            </h3>
            <PrinterCreateAction />
          </div>
        </template>
        <template #top>
          <v-toolbar flat>
            <v-toolbar-title>
              Showing {{ printers.length || 0 }} printers
            </v-toolbar-title>
            <v-spacer />
            <v-btn
              variant="elevated"
              color="purple"
              prepend-icon="publish"
              @click="openImportOctoFarmPrintersDialog()"
            >
              Import OctoFarm
            </v-btn>
            <v-btn
              class="ml-2"
              variant="elevated"
              color="success"
              prepend-icon="add"
              @click="openCreatePrinterDialog()"
            >
              Create Printer
            </v-btn>
            <v-btn
              class="ml-2"
              variant="elevated"
              prepend-icon="label"
              @click="showTagDialog = true"
            >
              Manage Tags
            </v-btn>
            <v-btn
              class="ml-2 mr-2"
              variant="elevated"
              color="primary"
              prepend-icon="code"
              @click="openYamlImportExportDialog()"
            >
              Import/Export Backup
            </v-btn>
          </v-toolbar>
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
          <v-chip v-if="item.id">
            {{ floorOfPrinter(item.id)?.name }}
          </v-chip>
        </template>
        <template #item.cameras="{ item }">
          <div class="d-flex align-center flex-wrap ga-1">
            <v-chip
              v-for="(camera, _) in camerasOfPrinter(item.id).slice(0, 2)"
              :key="camera.id"
              size="x-small"
              variant="tonal"
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
          </div>
        </template>
        <template #item.group="{ item }">
          <div class="d-flex align-center flex-wrap ga-1">
            <v-chip
              v-for="group of groupsOfPrinter(item.id)"
              :key="group.id"
              size="small"
              variant="tonal"
              closable
              @click:close="deletePrinterFromGroup(group.id, item.id)"
            >
              <v-icon start size="x-small">label</v-icon>
              {{ group.name }}
            </v-chip>

            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  :disabled="!nonGroupsOfPrinter(item.id).length"
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
                  v-for="(group, index) in nonGroupsOfPrinter(item.id)"
                  :key="index"
                  @click="addPrinterToGroup(group.id, item.id)"
                >
                  <template v-slot:prepend>
                    <v-icon size="small">label</v-icon>
                  </template>
                  <v-list-item-title>{{ group.name }}</v-list-item-title>
                </v-list-item>
                <v-list-item v-if="!nonGroupsOfPrinter(item.id).length" disabled>
                  <v-list-item-title class="text-caption">All tags assigned</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
        <template #item.actions="{ item }">
          <div class="d-flex ga-1 align-center">
            <PrinterUrlAction :printer="item" />
            <PrinterConnectionAction :printer="item" />
            <PrinterQuickStopAction :printer="item" />
            <FileExplorerAction :printer="item" />
            <SyncPrinterNameAction :printer="item" />
            <PrinterDeleteAction :printer="item" />
            <PrinterSettingsAction
              :printer="item"
              @update:show="openEditDialog(item)"
            />
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
            <PrinterDetails :printer="item" />
          </td>
        </template>
      </v-data-table>
    </v-card>

    <!-- Tag Management Dialog -->
    <v-dialog v-model="showTagDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">label</v-icon>
          Manage Tags
        </v-card-title>
        <v-card-text>
          <div class="mb-4">
            <div class="text-subtitle-2 mb-2">Available Tags:</div>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="group of groupsWithPrinters"
                :key="group.id"
                closable
                size="small"
                @click:close="deleteGroup(group.id)"
              >
                {{ group.name }}
              </v-chip>
              <v-chip
                v-if="!groupsWithPrinters.length"
                disabled
                size="small"
              >
                No tags yet
              </v-chip>
            </div>
          </div>

          <v-divider class="my-4" />

          <div>
            <div class="text-subtitle-2 mb-2">Create New Tag:</div>
            <v-text-field
              v-model="newGroupName"
              label="Tag Name"
              placeholder="Enter tag name"
              density="compact"
              variant="outlined"
              hide-details
              @keyup.enter="createGroup()"
            />
            <v-btn
              class="mt-2"
              color="primary"
              size="small"
              prepend-icon="add"
              @click="createGroup()"
            >
              Create Tag
            </v-btn>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showTagDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
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
  PrinterTagService
} from '@/backend/printer-tag.service'
import { useDialog } from '@/shared/dialog.composable'
import { VDataTable } from 'vuetify/components'
import { getServiceName } from '@/shared/printer-types.constants'

const snackbar = useSnackbar()
const printerStore = usePrinterStore()
const loading = ref<boolean>(false)
const printerStateStore = usePrinterStateStore()
const floorStore = useFloorStore()
const featureStore = useFeatureStore()

const addOrUpdatePrinterDialog = useDialog(DialogName.AddOrUpdatePrinterDialog)

const groupsWithPrinters = ref<TagWithPrintersDto[]>([])
const groups = ref<{ id: number; name: string }[]>([])
const selectedTagIds = ref<number[]>([])
const newGroupName = ref('')
const showTagDialog = ref(false)
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
  groupsWithPrinters.value = await PrinterTagService.getTagsWithPrinters()
  groups.value = groupsWithPrinters.value.map(g => ({ id: g.id, name: g.name }))

  // Load cameras
  const { CameraStreamService } = await import('@/backend/camera-stream.service')
  cameras.value = await CameraStreamService.listCameraStreams()

  loading.value = false
  return groupsWithPrinters
}

const printerGroupsQuery = useQuery({
  queryKey: ['printerGroups'],
  queryFn: loadData
})

const printers = computed(() => {
  let filtered = printerStore.printers

  // Filter by tags
  if (selectedTagIds.value?.length > 0) {
    const printerIdsInSelectedTags = groupsWithPrinters.value
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

const groupsOfPrinter = (printerId: number) => {
  return groupsWithPrinters.value.filter((g) =>
    g.printers.find((p) => p.printerId === printerId)
  )
}

const nonGroupsOfPrinter = (printerId: number) => {
  return groupsWithPrinters.value.filter(
    (g) => !g.printers.find((p) => p.printerId === printerId)
  )
}

const floorOfPrinter = (printerId: number) => {
  return floorStore.floorOfPrinter(printerId)
}

const camerasOfPrinter = (printerId: number) => {
  return cameras.value.filter(camera => camera.printerId === printerId)
}

const openEditDialog = (printer: PrinterDto) => {
  printerStore.setUpdateDialogPrinter(printer)
  addOrUpdatePrinterDialog.openDialog(printer)
}

const openCreatePrinterDialog = () => {
  addOrUpdatePrinterDialog.openDialog()
}

const clickRow = (event: any, item: any) => {
  if (!item?.item?.id) return

  const itemId = item.item.id.toString()
  const index = expanded.value.indexOf(itemId)

  if (index > -1) {
    // Already expanded, collapse it
    expanded.value.splice(index, 1)
  } else {
    // Not expanded, expand it
    expanded.value = [itemId] // Single expand mode
  }
}

const openImportOctoFarmPrintersDialog = () => {
  useDialog(DialogName.ImportOctoFarmDialog).openDialog()
}

const openYamlImportExportDialog = () => {
  useDialog(DialogName.YamlImportExport).openDialog()
}

const createGroup = async () => {
  if (!newGroupName.value?.trim()?.length) {
    throw new Error('Please set a non-empty group name')
  }

  await PrinterTagService.createTag(newGroupName.value.trim())
  await printerGroupsQuery.refetch()
  newGroupName.value = ''
  showTagDialog.value = false
  snackbar.info('Created tag')
}

const deleteGroup = async (groupId: number) => {
  const existingGroup = groupsWithPrinters.value.find((g) => g.id === groupId)
  if (!existingGroup) {
    throw new Error('Group was not found, please reload the page')
  }

  const printerCount = existingGroup.printers.length
  if (
    printerCount > 0 &&
    !confirm(
      `This group contains ${printerCount} printers, are you sure to delete it?`
    )
  ) {
    return
  }

  await PrinterTagService.deleteTag(groupId)
  await printerGroupsQuery.refetch()
  snackbar.info('Deleted group')
}

const addPrinterToGroup = async (groupId: number, printerId: number) => {
  await PrinterTagService.addPrinterToTag(groupId, printerId)
  await printerGroupsQuery.refetch()
  snackbar.info('Added printer to group')
}

const deletePrinterFromGroup = async (groupId: number, printerId: number) => {
  await PrinterTagService.deletePrinterTag(groupId, printerId)
  await printerGroupsQuery.refetch()
  snackbar.info('Removed printer from group')
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
