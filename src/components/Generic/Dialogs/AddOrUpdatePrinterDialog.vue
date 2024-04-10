<template>
  <BaseDialog
    :id="dialog.dialogId"
    :max-width="showChecksPanel ? '900px' : '700px'"
    @escape="closeDialog()"
  >
    <v-card class="pa-4">
      <v-card-title>
        <span class="text-h5">
          <v-avatar
            color="primary"
            size="56"
          >
            {{ avatarInitials }}
          </v-avatar>
          <span v-if="isUpdating"> Updating Printer </span>
          <span v-else> New Printer </span>
        </span>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col :cols="showChecksPanel ? 8 : 12">
            <v-row v-if="formData">
              <v-col>
                <!--                  :rules="printerNameRules"-->
                <v-text-field
                  v-model="formData.name"
                  :counter="printerNameRules.max"
                  autofocus
                  class="ma-1"
                  label="Printer name*"
                  required
                />
              </v-col>
              <v-col>
                <v-checkbox
                  v-model="formData.enabled"
                  hint="Disabling makes the printer passive"
                  label="Enabled*"
                  persistent-hint
                  required
                />
              </v-col>
            </v-row>

            <!--              persistent-hint-->
            <!--              rules="required|url">-->
            <v-text-field
              v-model="formData.printerURL"
              class="ma-1"
              hint="F.e. 'octopi.local' or 'https://my.printer.com'"
              label="Printer URL*"
            />

            <!--              :rules="apiKeyRules"-->
            <v-text-field
              v-model="formData.apiKey"
              :counter="apiKeyRules.length"
              class="ma-1"
              hint="User or Application Key only (Global API key fails)"
              label="API Key*"
              persistent-hint
              required
            />
            <!--            </validation-provider>-->
          </v-col>

          <PrinterChecksPanel
            v-if="showChecksPanel"
            :cols="4"
          >
            <v-btn @click="showChecksPanel = false"> Hide checks </v-btn>
          </PrinterChecksPanel>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <em class="text-red"> * indicates required field </em>
        <v-spacer />
        <v-btn
          variant="text"
          @click="closeDialog()"
        >
          Close
        </v-btn>
        <v-btn
          v-if="isUpdating"
          color="gray"
          variant="text"
          @click="duplicatePrinter()"
        >
          Duplicate
        </v-btn>
        <v-btn
          color="warning"
          variant="text"
          @click="testPrinter()"
        >
          Test connection
        </v-btn>

        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="submit()"
        >
          {{ submitButtonText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { inject } from 'vue'
import {
  generateInitials,
  newRandomNamePair
} from '@/shared/noun-adjectives.data'
import { usePrinterStore } from '@/store/printer.store'
import { PrintersService } from '@/backend'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import { useTestPrinterStore } from '@/store/test-printer.store'
import {
  CreatePrinter,
  getDefaultCreatePrinter
} from '@/models/printers/crud/create-printer.model'
import { useDialog } from '@/shared/dialog.composable'
import { AppConstants } from '@/shared/app.constants'
import { useSnackbar } from '@/shared/snackbar.composable'

const dialog = useDialog(DialogName.AddOrUpdatePrinterDialog)
const printersStore = usePrinterStore()
const testPrinterStore = useTestPrinterStore()

const appConstants = inject('appConstants') as AppConstants
const snackbar = useSnackbar()
const showChecksPanel = ref(false)
const copyPasteConnectionString = ref('')
const formData = ref(getDefaultCreatePrinter())

onMounted(async () => {
  if (printerId.value) {
    const crudeData = printersStore.printer(printerId.value) as CreatePrinter
    formData.value = PrintersService.convertPrinterToCreateForm(crudeData)
  }
})

const printerId = computed(() => {
  return printersStore.updateDialogPrinter?.id
})

const storedPrinter = computed(() => {
  return printersStore.updateDialogPrinter
})

const isUpdating = computed(() => {
  return !!storedPrinter
})

const submitButtonText = computed(() => {
  return isUpdating ? 'Save' : 'Create'
})

const avatarInitials = computed(() => {
  if (formData) {
    return generateInitials(formData.value?.name)
  }
  return '?'
})

const printerNameRules = computed(() => {
  return { required: true, max: appConstants.maxPrinterNameLength }
})

const apiKeyRules = computed(() => {
  return {
    required: true,
    length: appConstants.apiKeyLength,
    alpha_num: true
  }
})

function resetForm() {
  formData.value = getDefaultCreatePrinter()
}

function openTestPanel() {
  showChecksPanel.value = true
}

async function testPrinter() {
  if (!formData) return

  testPrinterStore.clearEvents()
  openTestPanel()

  const { correlationToken } = await testPrinterStore.createTestPrinter(
    formData.value as CreatePrinter
  )
  testPrinterStore.currentCorrelationToken = correlationToken
}

async function createPrinter(newPrinterData: CreatePrinter) {
  await printersStore.createPrinter(newPrinterData)
  snackbar.openInfoMessage({
    title: `Printer ${newPrinterData.name} created`
  })
}

async function updatePrinter(updatedPrinter: CreatePrinter) {
  const printerId = updatedPrinter.id

  await printersStore.updatePrinter({
    printerId: printerId as string,
    updatedPrinter
  })

  snackbar.openInfoMessage({
    title: `Printer ${updatedPrinter.name} updated`
  })
}

async function submit() {
  // if (!(await isValid())) return
  if (!formData) return
  const createdPrinter = formData.value as CreatePrinter
  if (isUpdating) {
    await updatePrinter(createdPrinter)
  } else {
    await createPrinter(createdPrinter)
  }
  closeDialog()
}

async function duplicatePrinter() {
  formData.value.name = newRandomNamePair()
  printersStore.updateDialogPrinter = undefined
}

function closeDialog() {
  dialog.closeDialog()
  showChecksPanel.value = false
  testPrinterStore.clearEvents()
  resetForm()
  printersStore.updateDialogPrinter = undefined
  copyPasteConnectionString.value = ''
}

watch(printerId, (val) => {
  if (!val) return
  const printer = printersStore.printer(val) as CreatePrinter
  formData.value = PrintersService.convertPrinterToCreateForm(printer)
})
</script>
