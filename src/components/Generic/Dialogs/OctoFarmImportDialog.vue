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
              non-linear
            >
              <template v-slot:default="{ step }">
                <v-stepper-vertical-item
                  title="Export PrintersDB from OctoFarm"
                  :value="1"
                  :complete="step > 1"
                >
                  <v-file-input
                    class="mt-2"
                    style="max-width: 400px"
                    v-model="importFile"
                    variant="filled"
                    accept=".json"
                    clearable
                    label="Upload PrintersDB.json file"
                    @update:model-value="updatePrinterCount()"
                  />

                  <ol>
                    <li>
                      <h4>
                        <v-icon>mdi:mdi-navigation</v-icon>
                        Go to your OctoFarm System page
                      </h4>
                    </li>
                    <li>
                      <h4>
                        <v-icon>mdi:mdi-mdi-mouse</v-icon>
                        Click 'Database'
                      </h4>
                    </li>
                    <li>
                      <h4>
                        <v-icon>mdi:mdi-mdi-mouse</v-icon>
                        Click the button 'Export Printers'
                      </h4>
                    </li>
                    <li>
                      <h4>
                        <v-icon>mdi:mdi-mdi-upload</v-icon>
                        Upload 'PrintersDB.json' above
                      </h4>
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

                  <br/>
                  <v-btn
                    color="primary"
                    @click="clickValidateAndNext()"
                    :disabled="!importFile"
                  >
                    Validate
                  </v-btn>
                </v-stepper-vertical-item>

                <v-stepper-vertical-item
                  title="Show printers & verify"
                  :value="2"
                  :complete="step > 2"
                >
                  <div class="my-2">
                    <v-icon class="pr-2">mdi:mdi-information</v-icon>
                    Import state:
                    {{ validationStatus ? 'success' : 'failed' }} -
                    {{ numPrinters }} printer(s) found
                  </div>

                  <v-alert
                    class="my-2"
                    v-if="errorMessage"
                    type="error"
                  >
                    {{ errorMessage }}
                    <br/>
                    Details: {{ errorDetailedMessage?.slice(0, 75) }}
                    <span v-if="errorDetailedMessage?.length > 75">...</span>
                  </v-alert>

                  <v-divider class="mt-2"/>

                  <v-list
                    :lines="'two'"
                    density="compact"
                    class="mt-2"
                  >
                    <v-list-subheader>Found printers</v-list-subheader>
                    <v-list-item
                      v-for="(committedPrinter, index) of committedPrinters"
                      :key="committedPrinter.name"
                      :title="committedPrinter.name"
                      @click="togglePrinter(index)"
                    >
                      <template v-slot:prepend>
                        <v-checkbox-btn
                          :model-value="selectedPrinters.includes(index)"
                        ></v-checkbox-btn>
                      </template>

                      <v-list-item-title>
                        {{ committedPrinter.name }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        <span class="mr-4"
                        >URL: {{ committedPrinter.printerURL }}</span
                        >
                        <span class="mr-4"
                        >Enabled: {{ committedPrinter.enabled }}</span
                        >
                        <span class="mr-4"
                        >API Key: {{ committedPrinter.apiKey }}</span
                        >
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-list-subheader>
                      <v-btn
                        @click="toggleSelected"
                        class="my-2"
                        size="small"
                      >
                        <v-icon class="mr-2">mdi:mdi-check</v-icon>
                        Toggle selection
                      </v-btn>
                    </v-list-subheader>
                  </v-list>

                  <div class="my-3">
                    <v-icon class="pr-2">mdi:mdi-information</v-icon>
                    At this moment, the following properties will be imported:
                    enabled, name, printerURL and apiKey
                  </div>

                  <v-btn
                    class="my-2"
                    color="primary"
                    @click="submit()"
                    :disabled="!selectedPrinters?.length"
                  >
                    Submit {{ selectedPrinters?.length }} printers
                  </v-btn>
                </v-stepper-vertical-item>

                <v-stepper-vertical-item
                  title="Import printers into FDM Monster"
                  :complete="step > 3"
                  :value="3"
                >
                  <div
                    class="mb-5 mt-10"
                    v-if="importCompletedSuccesfully"
                  >
                    <v-icon
                      size="100"
                      class="mr-5"
                      color="green"
                    >
                      mdi:mdi-check-circle
                    </v-icon>
                    Import Completed
                  </div>
                  <div v-else>
                    <v-icon
                      size="100"
                      class="mr-5"
                      color="red"
                    >
                      mdi:mdi-alert-circle
                    </v-icon>

                    Something went wrong: {{ errorMessage }}
                    <br/>
                    <span class="ml-5 mt-2">
                      Details: {{ errorDetailedMessage?.slice(0, 75) }}
                    </span>
                    <span
                      class="ml-5 mt-2"
                      v-if="errorDetailedMessage?.length > 75"
                    >...</span
                    >
                  </div>
                </v-stepper-vertical-item>
              </template>
            </v-stepper-vertical>
          </v-col>
        </v-row>
        <v-btn class="mt-2"> Validate printers</v-btn>
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
const showGif = ref(false)
const errorMessage = ref('')
const errorDetailedMessage = ref('')
const importFile = ref<File[]>([])
const numPrinters = ref(0)
const committedPrinters = ref<CreatePrinter[]>([])
const selectedPrinters = ref<number[]>([])
const importCompletedSuccesfully = ref<boolean>(false)
const dialog = useDialog(DialogName.ImportOctoFarmDialog)

function onBeforeDialogOpened() {
}

async function onDialogOpened() {
}

const parsedPrinters = async () => {
  if (!importFile.value || !importFile.value.length) {
    validationStatus.value = false
    return []
  }

  const data = JSON.parse(await importFile.value[0].text())
  if (!data || !Array.isArray(data)) return []
  if (!data?.length) return []

  let printers = data
  // Unwrap the nested array
  if (data.length === 1 && Array.isArray(data[0])) {
    printers = data[0]
  }

  printers = printers.map((p) => {
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
      p.name = p.printerURL
    }

    return {
      enabled: !p.disabled,
      apiKey: p.apiKey,
      printerURL: p.printerURL,
      name: p.name
    }
  })

  let validationFailed = false
  const failedPrinterNames = []
  errorMessage.value = ''
  errorDetailedMessage.value = ''
  for (const printer of printers) {
    const props = Object.keys(printer)
    if (
      !(
        props.includes('enabled') &&
        (printer.enabled === false || printer.enabled === true) &&
        props.includes('apiKey') &&
        printer.apiKey.length &&
        props.includes('printerURL') &&
        printer.printerURL.length &&
        props.includes('name') &&
        printer.name
      )
    ) {
      failedPrinterNames.push(
        printer.name || printer.printerURL || 'No name known for printer'
      )
      validationFailed ||= true
    }
  }

  validationStatus.value = !validationFailed
  if (validationFailed) {
    errorMessage.value = 'Imported file failed the validation step'
    errorDetailedMessage.value =
      'These printers failed validation: ' + failedPrinterNames.join(', ')
  }

  return printers
}

const clickValidateAndNext = async () => {
  const printers = await parsedPrinters()
  if (!printers?.length) return

  selectedPrinters.value = [...Array(printers.length)].map((x, i) => i)
  committedPrinters.value = printers || []
  stepProgress.value = 2
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
    selectedPrinters.value = [...Array(committedPrinters.value.length)].map(
      (x, i) => i
    )
  }
}

const updatePrinterCount = async () => {
  numPrinters.value = (await parsedPrinters())?.length || 0
}

const submit = async () => {
  stepProgress.value = 3
  const printers = committedPrinters.value.filter((_, i) =>
    selectedPrinters.value.includes(i)
  )
  if (!printers?.length) {
    return
  }

  try {
    await PrintersService.batchImportPrinters(printers)
    importCompletedSuccesfully.value = true
  } catch (e) {
    importCompletedSuccesfully.value = false
    importFile.value = []
    errorMessage.value = 'An error occurred'
    errorDetailedMessage.value = (e as Error).message.toString()
  }
}

const closeDialog = () => {
  importFile.value = []
  dialog.closeDialog()
  stepProgress.value = 1
}
</script>
