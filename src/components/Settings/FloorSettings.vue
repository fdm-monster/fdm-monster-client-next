<template>
  <v-card>
    <SettingsToolbar icon="house_siding" title="Floors" />

    <v-card-text>
      <SettingSection title="Manage Floors" :usecols="false">
        <div class="mb-4 d-flex align-center ga-3">
          <v-btn
            color="primary"
            prepend-icon="add"
            @click="createFloor()"
          >
            Create New Floor
          </v-btn>
          <div class="text-caption text-medium-emphasis">
            <v-icon size="small" class="mr-1">drag_indicator</v-icon>
            Drag floors to reorder them
          </div>
        </div>

        <Draggable
          v-model="sortableFloors"
          item-key="id"
          handle=".drag-handle"
          @end="onDragEnd"
        >
          <template #item="{ element: floor }">
            <v-expansion-panels
              variant="accordion"
              class="mb-2"
            >
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <div class="d-flex align-center justify-space-between" style="width: 100%">
                    <div class="d-flex align-center">
                      <v-icon class="drag-handle mr-2" style="cursor: move">drag_indicator</v-icon>
                      <v-icon class="mr-3">layers</v-icon>
                      <div>
                        <div class="text-subtitle-1 font-weight-medium">{{ floor.name }}</div>
                        <div class="text-caption text-medium-emphasis">
                          Floor Order #{{ floor.order }} • {{ floor.printers.length }} printer(s) assigned
                        </div>
                      </div>
                    </div>
                  </div>
                </v-expansion-panel-title>

            <v-expansion-panel-text>
              <!-- Floor details and actions -->
              <div class="mb-4">
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      :model-value="floor.name"
                      label="Floor Name"
                      variant="outlined"
                      density="compact"
                      hide-details
                      @blur="updateFloorName(floor.id, $event.target.value)"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      :model-value="floor.order"
                      label="Floor Order"
                      type="number"
                      variant="outlined"
                      density="compact"
                      hide-details
                      @blur="updateFloorOrder(floor.id, Number($event.target.value))"
                    />
                  </v-col>
                </v-row>
              </div>

              <!-- Manage on grid button -->
              <div class="mb-4">
                <v-btn
                  color="primary"
                  variant="tonal"
                  prepend-icon="grid_on"
                  @click="goToGridForFloor(floor.id)"
                >
                  Manage Printers on Grid
                </v-btn>
              </div>

              <v-divider class="my-3" />

              <!-- Assigned printers -->
              <div v-if="floor.printers.length > 0" class="mb-3">
                <div class="text-subtitle-2 mb-2">Assigned Printers:</div>
                <div class="d-flex flex-wrap ga-2">
                  <v-chip
                    v-for="printerPos in floor.printers"
                    :key="printerPos.printerId"
                    closable
                    size="small"
                    @click:close="removePrinterFromFloor(floor.id, printerPos.printerId)"
                  >
                    <v-icon start size="x-small">print</v-icon>
                    {{ getPrinterName(printerPos.printerId) }}
                    <v-chip size="x-small" variant="flat" class="ml-1">
                      {{ printerPos.x }},{{ printerPos.y }}
                    </v-chip>
                  </v-chip>
                </div>
              </div>
              <div v-else class="text-caption text-medium-emphasis mb-3">
                No printers assigned to this floor yet.
              </div>

              <!-- Delete floor -->
              <v-divider class="my-3" />
              <v-btn
                color="error"
                variant="outlined"
                size="small"
                prepend-icon="delete"
                @click="deleteFloor(floor.id)"
              >
                Delete Floor
              </v-btn>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
          </template>
        </Draggable>

        <div v-if="!floors.length" class="text-center pa-8 text-medium-emphasis">
          <v-icon size="large" class="mb-2">layers_clear</v-icon>
          <div>No floors created yet. Click "Create New Floor" to get started.</div>
        </div>
      </SettingSection>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Draggable from 'vuedraggable'
import { useFloorStore } from '@/store/floor.store'
import { usePrinterStore } from '@/store/printer.store'
import { useSnackbar } from '@/shared/snackbar.composable'
import { useDialog } from '@/shared/dialog.composable'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import SettingsToolbar from '@/components/Settings/Shared/SettingsToolbar.vue'
import SettingSection from '@/components/Settings/Shared/SettingSection.vue'
import { FloorDto } from '@/models/floors/floor.model'

const router = useRouter()
const floorStore = useFloorStore()
const printerStore = usePrinterStore()
const snackbar = useSnackbar()
const addOrUpdateFloorDialog = useDialog(DialogName.AddOrUpdateFloorDialog)

const floors = computed(() => floorStore.floors)

// Local sortable array for drag and drop
const sortableFloors = computed({
  get: () => [...floors.value],
  set: () => {
    // The actual reordering is handled in onDragEnd
  }
})

function getPrinterName(printerId: number) {
  const printer = printerStore.printers.find(p => p.id === printerId)
  return printer?.name || `Printer ${printerId}`
}

function goToGridForFloor(floorId: number) {
  router.push({
    path: '/printers-grid',
    query: { floor: floorId.toString() }
  })
}

async function createFloor() {
  await addOrUpdateFloorDialog.openDialog()
}

async function updateFloorName(floorId: number, name: string) {
  if (!name.trim()) return
  await floorStore.updateFloorName({ floorId, name: name.trim() })
  snackbar.info('Floor name updated')
}

async function updateFloorOrder(floorId: number, order: number) {
  if (!order || order < 0) return
  await floorStore.updateFloorOrder({ floorId, order })
  snackbar.info('Floor order updated')
}

async function deleteFloor(floorId: number) {
  if (!confirm('Are you sure you want to delete this floor? Printers will not be deleted.')) return
  await floorStore.deleteFloor(floorId)
  snackbar.info('Floor deleted')
}

async function removePrinterFromFloor(floorId: number, printerId: number) {
  await floorStore.deletePrinterFromFloor({ floorId, printerId })
  snackbar.info('Printer removed from floor')
}

async function onDragEnd() {
  // Update order based on new positions
  const updates: Promise<any>[] = []

  sortableFloors.value.forEach((floor: FloorDto, index: number) => {
    const newOrder = index + 1
    if (floor.order !== newOrder) {
      updates.push(floorStore.updateFloorOrder({ floorId: floor.id, order: newOrder }))
    }
  })

  if (updates.length > 0) {
    await Promise.all(updates)
    snackbar.info('Floor order updated')
  }
}
</script>
