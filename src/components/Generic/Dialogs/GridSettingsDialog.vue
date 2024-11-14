<template>
  <BaseDialog
    :id="dialog.dialogId"
    max-width="1000px"
    @beforeOpened="onBeforeDialogOpened"
    @escape="closeDialog()"
    @opened="onDialogOpened"
  >
    <v-card class="pa-4">
      <v-card-title>
        <span class="text-h5">
          Grid Settings
          <v-tooltip top>
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                class="ma-2"
                fab
                x-small
              >
                <v-icon>question_mark</v-icon>
              </v-btn>
            </template>
            <template v-slot:default>
              Change your grid rows, columns and tile settings.
            </template>
          </v-tooltip>
        </span>
      </v-card-title>

      <GridSettingsList />

      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialog.closeDialog()">Close</v-btn>
      </v-card-actions>
    </v-card>
  </BaseDialog>
</template>
<script lang="ts" setup>
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import { useDialog } from '@/shared/dialog.composable'
import GridSettingsList from '@/components/Settings/Shared/GridSettingsList.vue'

const dialog = useDialog(DialogName.GridSettingsDialog)

function closeDialog() {
  dialog.closeDialog(dialog.context())
}
</script>
