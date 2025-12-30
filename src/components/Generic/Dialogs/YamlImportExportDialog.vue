<template>
  <BaseDialog
    :id="dialog.dialogId"
    max-width="600px"
    @escape="closeDialog()"
    @opened="onDialogOpened"
    @before-opened="onBeforeDialogOpened"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-3">code</v-icon>
        YAML Import/Export
      </v-card-title>

      <v-tabs v-model="selectedMode">
        <v-tab :value="0">
          <v-icon start>upload</v-icon>
          Import
        </v-tab>
        <v-tab :value="1">
          <v-icon start>download</v-icon>
          Export
        </v-tab>
      </v-tabs>

      <v-card-text class="pt-4">
        <v-window v-model="selectedMode">
          <!-- Import Mode -->
          <v-window-item :value="0">
            <v-file-input
              v-model="importFile"
              accept=".yaml,.yml"
              label="Select YAML file"
              prepend-icon="attach_file"
              variant="outlined"
              hint="Upload a YAML file to import printers, floors, and groups"
              persistent-hint
            />

            <v-btn
              v-if="isFileProvided && !importSummary"
              :disabled="!isFileProvided"
              :loading="validatingImport"
              block
              color="secondary"
              class="mt-4"
              @click="validateImportFile()"
            >
              <v-icon start>checklist</v-icon>
              Validate & Preview
            </v-btn>

            <v-alert v-if="errorMessage" type="error" class="mt-4" closable>
              <div class="font-weight-bold">{{ errorMessage }}</div>
              <div v-if="errorDetailedMessage" class="text-caption mt-2">
                {{ errorDetailedMessage }}
              </div>
            </v-alert>

            <v-card v-if="importSummary" variant="tonal" class="mt-4">
              <v-card-title class="text-h6">
                <v-icon class="mr-2" color="success">info</v-icon>
                Import Summary
              </v-card-title>
              <v-card-text>
                <v-list density="compact">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>info</v-icon>
                    </template>
                    <v-list-item-title>Version: {{ importSummary.version }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>storage</v-icon>
                    </template>
                    <v-list-item-title>Database: {{ importSummary.databaseType }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>schedule</v-icon>
                    </template>
                    <v-list-item-title>Exported: {{ importSummary.exportedAt }}</v-list-item-title>
                  </v-list-item>
                  <v-divider class="my-2" />
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>print</v-icon>
                    </template>
                    <v-list-item-title>{{ importSummary.printersCount }} Printers</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>layers</v-icon>
                    </template>
                    <v-list-item-title>{{ importSummary.floorsCount }} Floors</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>label</v-icon>
                    </template>
                    <v-list-item-title>{{ importSummary.groupsCount }} Tags</v-list-item-title>
                  </v-list-item>
                  <v-list-item v-if="importSummary.hasSettings">
                    <template v-slot:prepend>
                      <v-icon color="warning">settings</v-icon>
                    </template>
                    <v-list-item-title>Settings Included</v-list-item-title>
                  </v-list-item>
                  <v-list-item v-if="importSummary.usersCount > 0">
                    <template v-slot:prepend>
                      <v-icon color="warning">person</v-icon>
                    </template>
                    <v-list-item-title>{{ importSummary.usersCount }} Users</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>

            <v-btn
              v-if="isImportMode && importSummary"
              :disabled="!isFileProvided"
              block
              color="primary"
              size="large"
              class="mt-4"
              @click="uploadAndImportYamlFile()"
            >
              <v-icon start>upload</v-icon>
              Import YAML Data
            </v-btn>
          </v-window-item>

          <!-- Export Mode -->
          <v-window-item :value="1">
            <v-expansion-panels variant="accordion">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon class="mr-2">tune</v-icon>
                  Advanced Options
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="text-caption mb-2 text-medium-emphasis">
                    Select which data to include in the export:
                  </div>
                  <v-checkbox
                    v-model="exportPrinters"
                    label="Printers"
                    hide-details
                    density="comfortable"
                  />
                  <v-checkbox
                    v-model="exportFloors"
                    label="Floors"
                    hide-details
                    density="comfortable"
                  />
                  <v-checkbox
                    v-model="exportFloorGrid"
                    label="Grid Positions"
                    hint="Automatically includes printers"
                    persistent-hint
                    density="comfortable"
                    class="mb-2"
                  />
                  <v-checkbox
                    v-model="exportGroups"
                    label="Tags"
                    hide-details
                    density="comfortable"
                  />
                  <v-checkbox
                    v-model="exportSettings"
                    label="Settings"
                    hide-details
                    density="comfortable"
                  />
                  <v-checkbox
                    v-model="exportUsers"
                    label="Users"
                    hide-details
                    density="comfortable"
                  />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <v-divider class="my-4" />

            <v-textarea
              v-model="notes"
              label="Notes (optional)"
              placeholder="Add notes for yourself..."
              variant="outlined"
              rows="2"
              auto-grow
            />

            <v-btn
              block
              color="primary"
              size="large"
              class="mt-2"
              @click="downloadExportYamlFile()"
            >
              <v-icon start>download</v-icon>
              Download YAML File
            </v-btn>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="closeDialog()"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { load } from 'js-yaml'
import BaseDialog from './BaseDialog.vue'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import { ServerPrivateService } from '@/backend/server-private.service'
import { useDialog } from '@/shared/dialog.composable'
import { useSnackbar } from '@/shared/snackbar.composable'
import { useFeatureStore } from '@/store/features.store'

const featureStore = useFeatureStore()
const dialog = useDialog(DialogName.YamlImportExport)
const snackbar = useSnackbar()

const errorMessage = ref('')
const errorDetailedMessage = ref('')
const selectedMode = ref(0)
const exportFloors = ref(true)
const exportFloorGrid = ref(true)
const exportGroups = ref(true)
const exportPrinters = ref(true)
const exportSettings = ref(true)
const exportUsers = ref(true)
const importFile = ref<File[] | undefined>(undefined)
const notes = ref('')
const validatingImport = ref(false)
const importSummary = ref<any>(null)

const isFileProvided = computed(() => {
  return !!importFile.value
})

const isImportMode = computed(() => {
  return selectedMode.value === 0
})

const onBeforeDialogOpened = async () => {
  await featureStore.loadFeatures()
}

const onDialogOpened = async () => {
  importFile.value = undefined
  errorMessage.value = ''
  errorDetailedMessage.value = ''
  notes.value = ''
  importSummary.value = null
  validatingImport.value = false
}

const validateImportFile = async () => {
  if (!importFile.value || !importFile.value.length) {
    errorMessage.value = 'No file selected'
    return
  }

  validatingImport.value = true
  errorMessage.value = ''
  errorDetailedMessage.value = ''
  importSummary.value = null

  try {
    const text = await importFile.value[0].text()
    const parsed = load(text) as any

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid YAML file format')
    }

    importSummary.value = {
      version: parsed.version || 'Unknown',
      databaseType: parsed.databaseType || 'Unknown',
      exportedAt: parsed.exportedAt ? new Date(parsed.exportedAt).toLocaleString() : 'Unknown',
      printersCount: parsed.printers?.length || 0,
      floorsCount: parsed.floors?.length || 0,
      groupsCount: parsed.groups?.length || 0,
      hasSettings: !!parsed.settings,
      usersCount: parsed.users?.length || 0
    }

    snackbar.openInfoMessage({ title: 'Import file validated successfully' })
  } catch (error: any) {
    errorMessage.value = 'Failed to validate import file'
    errorDetailedMessage.value = error.message
    importSummary.value = null
  } finally {
    validatingImport.value = false
  }
}

const downloadExportYamlFile = async () => {
  if (exportFloorGrid.value) {
    exportPrinters.value = true
  }

  await ServerPrivateService.downloadYamlExport({
    exportPrinters: exportPrinters.value,
    exportGroups: exportGroups.value,
    exportFloorGrid: exportFloorGrid.value,
    exportSettings: exportSettings.value,
    exportUsers: exportUsers.value,
    printerComparisonStrategiesByPriority: ['name', 'url'],
    exportFloors: exportFloors.value,
    floorComparisonStrategiesByPriority: 'floor',
    notes: notes.value
  })
  snackbar.openInfoMessage({
    title: 'Downloaded the YAML file'
  })
  notes.value = ''
}

const uploadAndImportYamlFile = async () => {
  errorMessage.value = ''
  errorDetailedMessage.value = ''
  if (!importFile.value || !importFile.value.length) {
    errorMessage.value = 'The import file was not specified'
    return
  }
  try {
    await ServerPrivateService.uploadAndImportYaml(importFile.value[0])
    importFile.value = undefined
    snackbar.openInfoMessage({
      title: 'Imported the YAML file'
    })
    closeDialog()
  } catch (e) {
    errorMessage.value = 'An error occurred during import'
    errorDetailedMessage.value = (e as Error).message.toString()
    importFile.value = undefined
  }
}

const closeDialog = () => {
  importFile.value = undefined
  errorMessage.value = ''
  errorDetailedMessage.value = ''
  notes.value = ''
  importSummary.value = null
  validatingImport.value = false
  dialog.closeDialog()
}
</script>
