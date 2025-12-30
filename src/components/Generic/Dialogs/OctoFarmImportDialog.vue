<template>
  <BaseDialog
    :id="dialog.dialogId"
    max-width="700px"
    @beforeOpened="onBeforeDialogOpened()"
    @escape="closeDialog()"
    @opened="onDialogOpened()"
  >
    <v-card class="pa-4">
      <v-card-title>
        <span class="text-h5"> Import OctoFarm Printers </span>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-stepper-vertical
              v-model="stepProgress"
              color="primary"
              non-linear
            >
              <template v-slot:default="{ step }">
                <v-stepper-vertical-item
                  title="Export PrintersDB from OctoFarm"
                  elevation="0"
                  :value="1"
                  :complete="step > 1"
                  editable
                >
                  <ol>
                    <li class="d-flex align-center mb-2">
                      <v-icon class="mr-2">mdi:mdi-navigation</v-icon>
                      <span>1. Go to your OctoFarm System page</span>
                    </li>
                    <li class="d-flex align-center mb-2">
                      <v-icon class="mr-2">mdi:mdi-mouse</v-icon>
                      <span>2. Click 'Database'</span>
                    </li>
                    <li class="d-flex align-center mb-2">
                      <v-icon class="mr-2">mdi:mdi-mouse</v-icon>
                      <span>3. Click the button 'Export Printers'</span>
                    </li>
                    <li class="d-flex align-center mb-2">
                      <v-icon class="mr-2">mdi:mdi-upload</v-icon>
                      <span>4. Upload 'PrintersDB.json' above</span>
                    </li>
                  </ol>

                  <div class="my-3">
                    <v-icon class="pr-2">mdi:mdi-information</v-icon>
                    OctoFarm printers should be exported as a JSON file. Please
                    upload the correct "PrintersDB.json" database file using the
                    steps provided.
                    <v-btn
                      size="small"
                      class="ml-2"
                      color="success"
                      @click="showGif = !showGif"
                    >
                      <v-icon class="pr-2">mdi:mdi-file-gif-box</v-icon>
                      <span v-if="!showGif">Show GIF</span>
                      <span v-else>Hide GIF</span>
                    </v-btn>
                  </div>

                  <v-img
                    v-if="showGif"
                    class="my-4"
                    :src="octofarmImportGif"
                    style="border: 3px solid dimgray; max-width: 800px"
                    elevation="10"
                  />

                  <v-divider class="mt-10"/>

                  <v-file-input
                    class="mt-8"
                    style="max-width: 400px"
                    v-model="importFile"
                    variant="filled"
                    accept=".json"
                    clearable
                    label="Upload PrintersDB.json file"
                    @update:model-value="clickValidateAndNext()"
                  />

                  <v-alert
                    class="my-2"
                    v-if="importFile && validationStatus"
                    type="success"
                    variant="tonal"
                  >
                    <div class="d-flex align-center">
                      <div>
                        <div class="font-weight-bold">Validation successful</div>
                        <div>{{ numPrinters }} valid printer(s) found</div>
                      </div>
                    </div>
                  </v-alert>

                  <v-alert
                    class="my-2"
                    v-if="importFile && errorMessage"
                    type="error"
                    variant="tonal"
                  >
                    <div class="d-flex align-center">
                      <v-icon class="mr-2">mdi:mdi-alert-circle</v-icon>
                      <div class="flex-grow-1">
                        <div class="font-weight-bold mb-1">{{ errorMessage }}</div>
                        <div v-if="errorDetailedMessage">
                          <div v-if="!showFullErrorDetails && errorDetailedMessage.length > 150">
                            {{ errorDetailedMessage.slice(0, 150) }}...
                            <v-btn
                              size="x-small"
                              color="error"
                              variant="text"
                              class="ml-1"
                              @click="showFullErrorDetails = true"
                            >
                              Show Details
                            </v-btn>
                          </div>
                          <div v-else>
                            {{ errorDetailedMessage }}
                            <v-btn
                              v-if="showFullErrorDetails && errorDetailedMessage.length > 150"
                              size="x-small"
                              color="error"
                              variant="text"
                              class="ml-1"
                              @click="showFullErrorDetails = false"
                            >
                              Hide Details
                            </v-btn>
                          </div>
                        </div>
                      </div>
                    </div>
                    <v-btn
                      v-if="!validationStatus && committedPrinters.length > 0"
                      size="small"
                      color="warning"
                      variant="outlined"
                      class="mt-2"
                      @click="stepProgress = 2"
                    >
                      <v-icon class="mr-1">mdi:mdi-alert</v-icon>
                      Continue with {{ committedPrinters.length }} valid printer(s)
                    </v-btn>
                  </v-alert>
                </v-stepper-vertical-item>

                <v-stepper-vertical-item
                  title="Show printers & verify"
                  elevation="0"
                  :value="2"
                  :complete="step > 2"
                  editable
                  @click:next="submit"
                >
                  <v-alert
                    :type="validationStatus ? 'success' : 'warning'"
                    variant="tonal"
                    class="mb-4"
                  >
                    <div class="d-flex align-center">
                      <div>
                        <strong>Import state: </strong>
                        <span>
                          {{ validationStatus ? 'success' : 'failed' }}, {{ numPrinters }} printer(s) found
                        </span>
                      </div>
                    </div>
                  </v-alert>

                  <v-alert
                    class="mb-4"
                    v-if="errorMessage"
                    type="error"
                    variant="tonal"
                  >
                    <div class="d-flex align-center">
                      <v-icon class="mr-2">mdi:mdi-alert-circle</v-icon>
                      <div class="flex-grow-1">
                        <div class="font-weight-bold mb-1">{{ errorMessage }}</div>
                        <div v-if="errorDetailedMessage">
                          <div v-if="!showFullErrorDetails && errorDetailedMessage.length > 150">
                            {{ errorDetailedMessage.slice(0, 150) }}...
                            <v-btn
                              size="x-small"
                              color="error"
                              variant="text"
                              class="ml-1"
                              data-testid="show-details-btn"
                              @click="showFullErrorDetails = true"
                            >
                              Show Details
                            </v-btn>
                          </div>
                          <div v-else>
                            {{ errorDetailedMessage }}
                            <v-btn
                              v-if="showFullErrorDetails && errorDetailedMessage.length > 150"
                              size="x-small"
                              color="error"
                              variant="text"
                              class="ml-1"
                              data-testid="hide-details-btn"
                              @click="showFullErrorDetails = false"
                            >
                              Hide Details
                            </v-btn>
                          </div>
                        </div>
                      </div>
                    </div>
                    <v-btn
                      v-if="!validationStatus && committedPrinters.length > 0"
                      size="small"
                      color="warning"
                      variant="outlined"
                      class="mt-2"
                      data-testid="continue-with-valid-btn"
                      @click="stepProgress = 2"
                    >
                      <v-icon class="mr-1">mdi:mdi-alert</v-icon>
                      Continue with {{ committedPrinters.length }} valid printer(s)
                    </v-btn>
                  </v-alert>

                  <div class="d-flex justify-space-between align-center mb-3">
                    <h4 class="text-subtitle-1 font-weight-medium">Found printers</h4>
                    <v-btn
                      @click="toggleSelected"
                      size="small"
                      variant="outlined"
                    >
                      <v-icon class="mr-2">mdi:mdi-check-all</v-icon>
                      Toggle selection
                    </v-btn>
                  </div>

                  <v-card
                    variant="outlined"
                    class="mb-4"
                  >
                    <v-list
                      :lines="'three'"
                      density="compact"
                    >
                      <v-list-item
                        v-for="(committedPrinter, index) of committedPrinters"
                        :key="committedPrinter.name"
                        @click="togglePrinter(index)"
                      >
                        <template v-slot:prepend>
                          <v-checkbox-btn
                            :model-value="selectedPrinters.includes(index)"
                          ></v-checkbox-btn>
                        </template>

                        <v-list-item-title class="font-weight-medium mb-1">
                          {{ committedPrinter.name }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          <div class="d-flex flex-column">
                            <span class="text-caption">
                              <strong>URL:</strong> {{ committedPrinter.printerURL }}
                            </span>
                            <span class="text-caption">
                              <strong>Enabled:</strong> {{ committedPrinter.enabled }}
                              <span class="ml-4"><strong>API Key:</strong> {{ committedPrinter.apiKey.slice(0, 20) }}...</span>
                            </span>
                          </div>
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card>

                  <v-alert
                    type="info"
                    variant="tonal"
                    density="compact"
                    class="mb-4"
                  >
                    <div class="text-caption">
                      <strong>Properties to import:</strong> enabled, name, printerURL, apiKey
                    </div>
                  </v-alert>

                  <template v-slot:next="{ next }">
                    <v-btn
                      color="primary"
                      @click="next"
                      :disabled="!selectedPrinters?.length"
                    >
                      <v-icon class="mr-2">mdi:mdi-upload</v-icon>
                      Submit {{ selectedPrinters?.length }} printer{{ selectedPrinters?.length !== 1 ? 's' : '' }}
                    </v-btn>
                  </template>
                </v-stepper-vertical-item>
              </template>
            </v-stepper-vertical>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="closeDialog()">
          <v-icon class="mr-2">mdi:mdi-close</v-icon>
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { PrintersService } from '@/backend'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import { useDialog } from '@/shared/dialog.composable'
import octofarmImportGif from '@/assets/octofarm-printer-export.gif'
import { CreatePrinter } from '@/models/printers/create-printer.model'

const stepProgress = ref(1)
const validationStatus = ref(false)
const showFullErrorDetails = ref(false)
const showGif = ref(false)
const errorMessage = ref('')
const errorDetailedMessage = ref('')
const importFile = ref<File | null>(null)
const numPrinters = ref(0)
const committedPrinters = ref<CreatePrinter[]>([])
const selectedPrinters = ref<number[]>([])
const importCompletedSuccessfully = ref<boolean>(false)
const dialog = useDialog(DialogName.ImportOctoFarmDialog)

function onBeforeDialogOpened() {
  // Reset all state when dialog opens
  stepProgress.value = 1
  validationStatus.value = false
  errorMessage.value = ''
  errorDetailedMessage.value = ''
  showFullErrorDetails.value = false
  numPrinters.value = 0
  committedPrinters.value = []
  selectedPrinters.value = []
  importCompletedSuccessfully.value = false
}

async function onDialogOpened() {
}

const parsedPrinters = async () => {
  // Reset validation state
  validationStatus.value = false
  errorMessage.value = ''
  errorDetailedMessage.value = ''

  if (!importFile.value) {
    errorMessage.value = 'No file selected'
    errorDetailedMessage.value = 'Please select a PrintersDB.json file to import'
    return []
  }

  try {
    const jsonData = JSON.parse(await importFile.value.text())

    // Validate JSON structure
    if (!jsonData || typeof jsonData !== 'object') {
      errorMessage.value = 'Invalid JSON file format'
      errorDetailedMessage.value = 'The file does not contain valid JSON data'
      return []
    }

    const data = jsonData.databases
    if (!data) {
      errorMessage.value = 'Invalid OctoFarm export format'
      errorDetailedMessage.value = 'Missing "databases" property in the JSON file'
      return []
    }

    if (!Array.isArray(data)) {
      errorMessage.value = 'Invalid databases format'
      errorDetailedMessage.value = 'The "databases" property should be an array'
      return []
    }

    if (!data?.length) {
      errorMessage.value = 'No printer data found'
      errorDetailedMessage.value = 'The databases array is empty'
      return []
    }

    let printers = data
    // Unwrap the nested array with proper type checking
    if (data.length > 0 && Array.isArray(data[0])) {
      const nestedData = data[0]
      if (Array.isArray(nestedData)) {
        printers = nestedData
      }
    }

    if (!Array.isArray(printers) || !printers.length) {
      errorMessage.value = 'No printers found in export'
      errorDetailedMessage.value = 'The export file does not contain any printer data'
      return []
    }

    const transformedPrinters: CreatePrinter[] = printers.map((p, index) => {
      // Clean up the printer object
      if (p['_id']) {
        delete p['_id']
      }
      if (p.apikey) {
        p.apiKey = p.apikey
        delete p.apikey
      }
      if (p.settingsApperance) {
        p.settingsAppearance = p.settingsApperance
        delete p.settingsApperance
      }
      if (p.settingsAppearance?.name) {
        p.name = p.settingsAppearance?.name
        delete p.settingsAppearance
      } else {
        p.name = p.printerURL || `Printer ${index + 1}`
      }

      return {
        enabled: p.disabled === undefined || !p.disabled,
        apiKey: p.apiKey || '',
        printerURL: p.printerURL || '',
        name: p.name || p.printerURL || `Printer ${index + 1}`,
        printerType: 0, // Default OctoPrint type
        username: '', // Default empty
        password: '' // Default empty
      } as CreatePrinter
    })

    // Validate each printer
    let validationFailed = false
    const failedPrinterDetails = []
    const validPrinters = []

    for (let i = 0; i < transformedPrinters.length; i++) {
      const printer = transformedPrinters[i]
      const validationErrors = []

      // Check required fields - enabled is already boolean due to our transformation
      if (!printer.apiKey || printer.apiKey.trim().length === 0) {
        validationErrors.push('missing or invalid API key')
      }
      if (!printer.printerURL || printer.printerURL.trim().length === 0) {
        validationErrors.push('missing or invalid printer URL')
      }
      if (!printer.name || printer.name.trim().length === 0) {
        validationErrors.push('missing or invalid printer name')
      }

      // Validate URL format
      if (printer.printerURL && printer.printerURL.trim().length > 0) {
        try {
          const url = new URL(printer.printerURL.startsWith('http') ? printer.printerURL : `http://${printer.printerURL}`)
          if (!url.hostname) {
            validationErrors.push('invalid URL format')
          }
        } catch {
          validationErrors.push('malformed URL')
        }
      }

      if (validationErrors.length > 0) {
        const printerName = printer.name || `Printer ${i + 1}`
        failedPrinterDetails.push(`${printerName}: ${validationErrors.join(', ')}`)
        validationFailed = true
      } else {
        validPrinters.push(printer)
      }
    }

    if (validationFailed) {
      errorMessage.value = `${failedPrinterDetails.length} printer(s) failed validation`
      errorDetailedMessage.value = failedPrinterDetails.join('; ')
      validationStatus.value = false
      return validPrinters // Return only valid printers
    }

    validationStatus.value = true
    return transformedPrinters

  } catch (parseError: any) {
    errorMessage.value = 'Failed to parse JSON file'
    errorDetailedMessage.value = `Parse error: ${parseError?.message || 'Unknown error'}`
    return []
  }
}

const clickValidateAndNext = async () => {
  // Guard: Don't validate if no file is selected
  if (!importFile.value) {
    // Reset state when file is cleared
    validationStatus.value = false
    errorMessage.value = ''
    errorDetailedMessage.value = ''
    numPrinters.value = 0
    committedPrinters.value = []
    selectedPrinters.value = []
    return
  }

  try {
    const printers = await parsedPrinters()
    // Always update the printer count, even if validation failed
    numPrinters.value = printers?.length || 0

    if (!printers?.length) {
      // If no printers at all, don't proceed to next step
      if (!errorMessage.value) {
        errorMessage.value = 'No valid printers found'
        errorDetailedMessage.value = 'The import file contains no valid printer data'
      }
      return
    }

    // Set up selection for valid printers
    selectedPrinters.value = Array.from({ length: printers.length }, (_, i) => i)
    committedPrinters.value = printers

    // Only proceed to next step if validation was successful
    if (validationStatus.value) {
      stepProgress.value = 2
    } else {
      console.log('[OctoFarm] Validation failed but have valid printers, staying on step 1')
      // Validation failed but we have some valid printers
      // Stay on current step to show validation errors
      // The user can see the errors and decide whether to continue with partial data
    }

  } catch (error: any) {
    errorMessage.value = 'Validation failed'
    errorDetailedMessage.value = `Error during validation: ${error?.message || 'Unknown error'}`
    validationStatus.value = false
    numPrinters.value = 0
  }
}

const togglePrinter = (index: number) => {
  const idx = selectedPrinters.value.indexOf(index)
  if (idx > -1) {
    selectedPrinters.value.splice(idx, 1)
  } else {
    selectedPrinters.value.push(index)
  }
}

const toggleSelected = () => {
  const isOneSelected = selectedPrinters.value.length
  if (isOneSelected) {
    selectedPrinters.value = []
  } else {
    selectedPrinters.value = Array.from({ length: committedPrinters.value.length }, (_, i) => i)
  }
}

const submit = async () => {
  const printers = committedPrinters.value.filter((_, i) =>
    selectedPrinters.value.includes(i)
  )
  if (!printers?.length) {
    return
  }

  try {
    await PrintersService.batchImportPrinters(printers)
    importCompletedSuccessfully.value = true
    closeDialog()
  } catch (e) {
    importCompletedSuccessfully.value = false
    importFile.value = null
    errorMessage.value = 'An error occurred'
    errorDetailedMessage.value = (e as Error).message.toString()
  }
}

const closeDialog = () => {
  importFile.value = null
  dialog.closeDialog()
  stepProgress.value = 1
}
</script>
