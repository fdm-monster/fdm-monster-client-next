<template>
  <v-btn
    class="ms-4"
    color="secondary"
    icon="delete"
    rounded
    @click.c.capture.native.stop="openCreatePrinterDialog()"
  >
    <v-icon>add</v-icon>
  </v-btn>
</template>

<script lang="ts" setup>
import { DialogName } from '../Dialogs/dialog.constants'
import { useDialog } from '@/shared/dialog.composable'
import { IdType } from '@/utils/id.type'

const props = defineProps<{
  floorId?: IdType
  floorX?: number
  floorY?: number
}>()

const dialog = useDialog(DialogName.AddOrUpdatePrinterDialog)

function openCreatePrinterDialog() {
  dialog.openDialog(props)
}
</script>
