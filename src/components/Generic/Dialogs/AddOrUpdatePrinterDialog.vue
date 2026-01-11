<template>
  <BaseDialog
    :id="dialog.dialogId"
    :max-width="showChecksPanel ? '900px' : '800px'"
    @escape="closeDialog()"
    @opened="onDialogOpened()"
  >
    <v-card class="pa-6">
      <v-card-title class="pb-4">
        <div class="d-flex align-center">
          <v-avatar
            color="grey-darken-2"
            size="48"
            class="mr-4"
          >
            <span class="text-h6">{{ avatarInitials }}</span>
          </v-avatar>
          <span class="text-h5">{{ dialogTitle }}</span>
        </div>
      </v-card-title>

      <v-divider class="mb-6"/>

      <v-card-text>
        <div class="d-flex align-center mb-4">
          <h4 class="text-h6">Printer type</h4>
          <v-btn
            v-if="!hasAllPrinterTypes"
            variant="text"
            size="small"
            color="primary"
            class="ml-2"
            @click="openExperimentalSettings"
          >
            Enable more types
          </v-btn>
        </div>
        <v-select
          v-model="formData.printerType"
          :items="serviceTypes"
          item-title="name"
          item-value="type"
          label="Select printer type*"
          class="mb-4"
          required
        >
          <template #selection="{ item }">
            <div class="d-flex align-center">
              <v-img
                :src="item.raw.logo"
                :height="item.raw.height"
                max-width="30px"
                width="30px"
                class="mr-3"
              />
              <span>{{ item.raw.name }}</span>
            </div>
          </template>
          <template #item="{ item, props }">
            <v-list-item v-bind="props">
              <template #prepend>
                <v-img
                  :src="item.raw.logo"
                  :height="item.raw.height"
                  max-width="30px"
                  width="30px"
                  class="mr-3"
                />
              </template>
            </v-list-item>
          </template>
        </v-select>

        <v-row>
          <v-col :cols="showChecksPanel ? 8 : 12">
            <v-row v-if="formData">
              <v-col>
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

            <v-text-field
              v-model="formData.printerURL"
              class="ma-1"
              hint="F.e. 'octopi.local' or 'https://my.printer.com'"
              label="Printer URL*"
            />

            <v-text-field
              v-if="formData.printerType === OctoPrintType"
              v-model="formData.apiKey"
              :counter="apiKeyRules.length"
              class="ma-1"
              hint="User or Application Key with 32 or 43 characters (Global API key will fail)"
              :label="
                formData.printerType === OctoPrintType || formData.printerType === MoonrakerType
                  ? 'API Key (required)*'
                  : 'API Key (unsupported)'
              "
              persistent-hint
              required
            />

            <v-text-field
              v-if="formData.printerType === PrusaLinkType || formData.printerType === BambuType"
              v-model="formData.username"
              class="ma-1"
              :hint="formData.printerType === BambuType ? 'Serial number from printer' : 'Username (often \'maker\')'"
              :label="formData.printerType === BambuType ? 'Serial' : 'Username'"
              persistent-hint
              required
            />

            <v-text-field
              v-if="formData.printerType === PrusaLinkType || formData.printerType === BambuType"
              v-model="formData.password"
              class="ma-1"
              :hint="formData.printerType === BambuType ? 'Access code from printer settings' : 'Password (visit your printer settings)'"
              :label="formData.printerType === BambuType ? 'AccessCode' : 'Password'"
              persistent-hint
              required
            />
          </v-col>

          <PrinterChecksPanel
            v-if="showChecksPanel"
            :cols="4"
          >
            <v-btn @click="showChecksPanel = false"> Hide checks</v-btn>
          </PrinterChecksPanel>
        </v-row>
        <v-alert
          v-if="printerValidationError?.length"
          class="my-3"
          type="error"
          variant="tonal"
        >
          <div class="d-flex flex-column">
            <strong>Connection Error</strong>
            <span class="mt-2">{{ printerValidationError }}</span>
            <v-checkbox
              v-model="forceSavePrinter"
              color="warning"
              label="Force save"
              class="mt-2"
            />
          </div>
        </v-alert>
        <v-alert
          v-if="validatingPrinter"
          class="my-3"
          type="info"
          variant="tonal"
        >
          <div class="d-flex align-center">
            <v-progress-circular
              indeterminate
              size="20"
              class="mr-3"
            />
            <span>Validating printer connection...</span>
          </div>
        </v-alert>
        <v-alert
          v-if="duplicatingPrinter"
          class="my-3"
          color="info"
        >
          Duplicating printer...
          <v-progress-circular
            class="ml-2"
            indeterminate
            size="20"
          />
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <em class="text-red"> * indicates required field </em>
        <v-spacer/>
        <v-btn
          variant="text"
          @click="closeDialog()"
        >
          Close
        </v-btn>
        <v-btn
          v-if="isUpdating"
          :disabled="!isValid() || duplicatingPrinter"
          :loading="duplicatingPrinter"
          color="gray"
          variant="text"
          @click="duplicatePrinter()"
        >
          Duplicate
        </v-btn>
        <v-btn
          :disabled="!isValid()"
          color="warning"
          variant="text"
          @click="testPrinter()"
        >
          Test connection
        </v-btn>

        <v-btn
          :disabled="!isValid()"
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
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { generateInitials } from "@/shared/noun-adjectives.data";
import { usePrinterStore } from "@/store/printer.store";
import { PrintersService } from "@/backend";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useTestPrinterStore } from "@/store/test-printer.store";
import { CreatePrinter, getDefaultCreatePrinter } from "@/models/printers/create-printer.model";
import { useDialog } from "@/shared/dialog.composable";
import { appConstants } from "@/shared/app.constants";
import { useSnackbar } from "@/shared/snackbar.composable";
import { AxiosError } from "axios";
import { useFeatureStore } from "@/store/features.store";
import klipperLogoSvg from "@/assets/klipper-logo.svg";
import octoPrintTentacleSvg from "@/assets/octoprint-tentacle.svg";
import prusaLinkLogoSvg from "@/assets/prusa-link-logo.svg";
import bambuLogoSvg from "@/assets/bambu-logo.png";
import {
  getPrinterTypeName,
  isMoonrakerType, isPrusaLinkType, isBambuType,
  MoonrakerType,
  OctoPrintType,
  PrusaLinkType,
  BambuType,
} from "@/shared/printer-types.constants";
import PrinterChecksPanel from "@/components/Generic/Dialogs/PrinterChecksPanel.vue";
import { useFloorStore } from "@/store/floor.store";
import { captureException } from "@sentry/vue";

const router = useRouter();

const dialog = useDialog(DialogName.AddOrUpdatePrinterDialog);
const printersStore = usePrinterStore();
const testPrinterStore = useTestPrinterStore();
const featureStore = useFeatureStore();
const floorStore = useFloorStore();
const snackbar = useSnackbar();

const printerValidationError = ref<null | string>(null);
const validatingPrinter = ref(false);
const forceSavePrinter = ref(false);
const showChecksPanel = ref(false);
const copyPasteConnectionString = ref("");
const formData = ref(getDefaultCreatePrinter());
const duplicatingPrinter = ref(false);
const isDuplicating = ref(false);
const duplicatedFromName = ref<string | null>(null);

const serviceTypes = computed(() => {
  if (featureStore.hasFeature("multiplePrinterServices")) {
    const feature = featureStore.getFeature<{ types: string[] }>(
      "multiplePrinterServices",
    );
    const hasKlipperSupport = feature?.subFeatures?.types?.includes("klipper");
    const hasPrusaLinkSupport = feature?.subFeatures?.types?.includes("prusaLink");
    const hasBambuSupport = feature?.subFeatures?.types?.includes("bambu");

    return [
      {
        name: getPrinterTypeName(OctoPrintType),
        type: OctoPrintType,
        logo: octoPrintTentacleSvg,
        height: "60px",
      },
      ...(hasKlipperSupport ? [{
        name: getPrinterTypeName(MoonrakerType),
        type: MoonrakerType,
        logo: klipperLogoSvg,
        height: "60px",
      }] : []),
      ...(hasPrusaLinkSupport ? [{
        name: getPrinterTypeName(PrusaLinkType),
        type: PrusaLinkType,
        logo: prusaLinkLogoSvg,
        height: "20px",
      }] : []),
      ...(hasBambuSupport ? [{
        name: getPrinterTypeName(BambuType),
        type: BambuType,
        logo: bambuLogoSvg,
        height: "60px",
      }] : []),
    ];
  }

  return [
    {
      name: "OctoPrint",
      type: OctoPrintType,
      logo: octoPrintTentacleSvg,
      height: "75px",
    },
  ];
});

const hasAllPrinterTypes = computed(() => {
  if (!featureStore.hasFeature("multiplePrinterServices")) {
    return false;
  }
  const feature = featureStore.getFeature<{ types: string[] }>(
    "multiplePrinterServices",
  );
  const hasKlipperSupport = feature?.subFeatures?.types?.includes("klipper");
  const hasPrusaLinkSupport = feature?.subFeatures?.types?.includes("prusaLink");
  const hasBambuSupport = feature?.subFeatures?.types?.includes("bambu");

  return hasKlipperSupport && hasPrusaLinkSupport && hasBambuSupport;
});

const printerId = computed(() => {
  return dialog.context()?.id;
});

async function onDialogOpened() {
  await featureStore.loadFeatures();

  // Reset duplication state when dialog opens
  isDuplicating.value = false;
  duplicatedFromName.value = null;

  if (!printerId.value) {
    formData.value = getDefaultCreatePrinter();
    return;
  }
  const printer = printersStore.printer(printerId.value) as CreatePrinter;
  if (printer) {
    formData.value = PrintersService.convertPrinterToCreateForm(printer);
  }
}

const isUpdating = computed(() => {
  return !!printerId.value && !isDuplicating.value;
});

const dialogTitle = computed(() => {
  if (isDuplicating.value && duplicatedFromName.value) {
    return `Duplicating from "${ duplicatedFromName.value }"`
  }

  if (isUpdating.value) {
    return 'Updating Printer'
  }

  const ctx = dialog.context()
  if (ctx?.floorId) {
    const floor = floorStore.floors.find(f => f.id === ctx.floorId)
    if (floor) {
      return `Add Printer to ${ floor.name }`
    }
  }

  return 'New Printer'
});

const submitButtonText = computed(() => {
  return (forceSavePrinter.value ? "Force " : "") + (isUpdating.value ? "Save" : "Create");
});

const avatarInitials = computed(() => {
  if (formData) {
    return generateInitials(formData.value?.name);
  }
  return "?";
});

const printerNameRules = computed(() => {
  return { required: true, max: appConstants.maxPrinterNameLength };
});

const apiKeyRules = computed(() => {
  return {
    required: true,
    length: appConstants.apiKeyLength,
    alpha_num: true,
  };
});

function resetForm() {
  formData.value = getDefaultCreatePrinter();
}

function openTestPanel() {
  showChecksPanel.value = true;
}

async function testPrinter() {
  if (!isValid()) return;

  testPrinterStore.clearEvents();
  openTestPanel();

  const { correlationToken } = await testPrinterStore.createTestPrinter(
    formData.value as CreatePrinter,
  );
  testPrinterStore.currentCorrelationToken = correlationToken;
}

const isValid = () => {
  const form = formData.value;
  if (!form) return false;
  if (isMoonrakerType(form.printerType)) {
    return form.printerURL?.length && form.name?.length;
  }
  if (isPrusaLinkType(form.printerType) || isBambuType(form.printerType)) {
    return form.printerURL?.length && form.name?.length && form.username?.length && form.password?.length;
  }
  return form.printerURL?.length && form.name?.length && form.apiKey?.length;
};

async function createPrinter(newPrinterData: CreatePrinter) {
  const printer = await printersStore.createPrinter(newPrinterData, forceSavePrinter.value);
  snackbar.openInfoMessage({
    title: `Printer ${ newPrinterData.name } created`,
  });
  return printer;
}

async function updatePrinter(updatedPrinter: CreatePrinter) {
  const printerId = updatedPrinter.id;

  const printer = await printersStore.updatePrinter(
    {
      printerId: printerId!,
      updatedPrinter,
    },
    forceSavePrinter.value,
  );

  snackbar.openInfoMessage({
    title: `Printer ${ updatedPrinter.name } updated`,
  });

  return printer;
}

async function submit() {
  if (!isValid()) return;

  printerValidationError.value = null;
  validatingPrinter.value = true;

  if (
    formData.value.printerURL?.length &&
    !formData.value.printerURL?.startsWith("http://") &&
    !formData.value.printerURL?.startsWith("https://")
  ) {
    formData.value.printerURL = "https://" + formData.value.printerURL;
  }

  const createdPrinter = formData.value as CreatePrinter;

  if (isMoonrakerType(createdPrinter.printerType) || isPrusaLinkType(createdPrinter.printerType) || isBambuType(createdPrinter.printerType)) {
    createdPrinter.apiKey = "";
  }

  try {
    if (isUpdating.value) {
      await updatePrinter(createdPrinter);
    } else {
      const printer = await createPrinter(createdPrinter);

      try {
        const dialogContext = dialog.context();
        if (
          dialogContext?.floorId &&
          typeof dialogContext.floorX === 'number' &&
          typeof dialogContext.floorY === 'number' &&
          dialogContext.floorX >= 0 &&
          dialogContext.floorY >= 0
        ) {
          await useFloorStore().addPrinterToFloor({
            floorId: dialogContext.floorId,
            printerId: printer.id,
            y: dialogContext.floorY,
            x: dialogContext.floorX,
          });
        }
      } catch (e) {
        console.warn("Attempt to add printer to floor failed", e);
        captureException(e);
      }
    }

    closeDialog();
  } catch (error) {
    if (error instanceof AxiosError) {
      printerValidationError.value =
        error.response?.data?.error || error.message;
      snackbar.error("Validation Failed", (error as Error).message);
    } else {
      printerValidationError.value = (error as Error).message;
      snackbar.error("Error", (error as Error).message);
    }
  } finally {
    validatingPrinter.value = false;
    forceSavePrinter.value = false;
  }
}

function duplicatePrinter() {
  if (!isValid()) return;

  duplicatingPrinter.value = true;
  printerValidationError.value = null;
  forceSavePrinter.value = false;

  duplicatedFromName.value = formData.value.name || null;
  formData.value.name = "";
  delete formData.value.id;
  isDuplicating.value = true;
  duplicatingPrinter.value = false;
}

function openExperimentalSettings() {
  closeDialog();
  router.push('/settings/experimental');
}

function closeDialog() {
  dialog.closeDialog();
  forceSavePrinter.value = false;
  printerValidationError.value = null;
  showChecksPanel.value = false;
  duplicatingPrinter.value = false;
  isDuplicating.value = false;
  duplicatedFromName.value = null;
  testPrinterStore.clearEvents();
  resetForm();
  copyPasteConnectionString.value = "";
}
</script>
