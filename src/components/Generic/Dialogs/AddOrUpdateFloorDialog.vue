<template>
  <BaseDialog
    :id="dialog.dialogId"
    :max-width="'700px'"
    @escape="closeDialog"
    @opened="onDialogOpened"
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">
          <v-avatar
            color="primary"
            size="56"
            >{{ avatarInitials }}</v-avatar
          >
          {{ printerFloorId ? 'Edit Floor' : 'New Floor' }}
        </span>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col :cols="12">
            <v-container>
              <v-row>
                <v-col
                  v-if="formData"
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="formData.name"
                    autofocus
                    label="Floor name*"
                    required
                  />
                  <v-text-field
                    v-model="formData.order"
                    label="Floor order"
                    required
                    type="number"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <em class="text-red"> * indicates required field </em>
        <v-spacer />
        <v-btn
          variant="text"
          @click="closeDialog"
          >Close</v-btn
        >
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="submit"
          >{{ printerFloorId ? 'Update' : 'Create' }}</v-btn
        >
      </v-card-actions>
    </v-card>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import {
  generateInitials,
  newRandomNamePair
} from '@/shared/noun-adjectives.data'
import { FloorService } from '@/backend/floor.service'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import { useFloorStore } from '@/store/floor.store'
import { useDialog } from '@/shared/dialog.composable'
import { appConstants } from '@/shared/app.constants'
import {
  getDefaultCreateFloor,
  PreCreateFloor
} from '@/models/floors/floor.model'
import { useSnackbar } from '@/shared/snackbar.composable'

const dialog = useDialog(DialogName.AddOrUpdateFloorDialog)
const floorStore = useFloorStore()
const snackbar = useSnackbar()

const formData = ref<PreCreateFloor>(getDefaultCreateFloor())

const printerFloorId = computed(() => dialog.context()?.printerFloorId)

const avatarInitials = computed(() => {
  return formData.value ? generateInitials(formData.value.name) : ''
})

const validateFormData = () => {
  if (
    !formData.value.name ||
    formData.value.name.length < appConstants.minFloorNameLength
  ) {
    snackbar.openErrorMessage({ title: 'Invalid floor name' })
    return false
  }
  if (!Number.isInteger(Number(formData.value.order))) {
    snackbar.openErrorMessage({ title: 'Floor order must be an integer' })
    return false
  }
  return true
}

const submit = async () => {
  if (!validateFormData()) return

  const floorData = FloorService.convertCreateFormToFloor(formData.value)

  if (printerFloorId.value) {
    // Update existing floor
    await floorStore.updateFloorName({
      floorId: printerFloorId.value,
      name: floorData.name
    })
    await floorStore.updateFloorOrder({
      floorId: printerFloorId.value,
      order: floorData.order
    })
    snackbar.openInfoMessage({ title: `Floor ${floorData.name} updated` })
  } else {
    // Create new floor
    await floorStore.createFloor(floorData)
    snackbar.openInfoMessage({ title: `Floor ${floorData.name} created` })
    formData.value.name = newRandomNamePair()
    const maxIndex = Math.max(...floorStore.floors.map((f) => f.order)) + 1
    formData.value.order = maxIndex.toString()
  }

  closeDialog()
}

const closeDialog = () => {
  dialog.closeDialog()
}

const onDialogOpened = () => {
  if (printerFloorId.value) {
    const crudeData = floorStore.floor(printerFloorId.value)
    formData.value = FloorService.convertPrinterFloorToCreateForm(crudeData)
  } else if (floorStore.floors?.length) {
    const maxIndex = Math.max(...floorStore.floors.map((pf) => pf.order)) + 1
    formData.value.order = maxIndex.toString()
  }
}
</script>
