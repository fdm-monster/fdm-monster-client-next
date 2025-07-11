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
        <h4>Printer type</h4>
        <v-item-group
          v-model="formData.printerType"
          mandatory
        >
          <v-container>
            <v-row>
              <v-col
                v-for="item of serviceTypes"
                :key="item.name"
                cols="4"
                md="4"
              >
                <v-item v-slot="{ isSelected, toggle }">
                  <v-card
                    :color="isSelected ? 'primary' : 'blue-grey darken-4'"
                    class="d-flex align-center justify-center elevation-8"
                    height="60px"
                    width="225px"
                    @click="toggle"
                  >
                    <v-img
                      :height="item.height"
                      :src="item.logo"
                      max-width="100px"
                      width="125px"
                    />
                    <v-scroll-y-transition>
                      <h3 class="ml-3 align-center">{{ item.name }}</h3>
                    </v-scroll-y-transition>
                  </v-card>
                </v-item>
              </v-col>
            </v-row>
          </v-container>
        </v-item-group>

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
                  ? 'API Key (unsupported)'
                  : 'API Key (required)*'
              "
              persistent-hint
              required
            />

            <v-text-field
              v-if="formData.printerType === PrusaLinkType"
              v-model="formData.username"
              class="ma-1"
              hint="Username (often 'maker')"
              label="Username"
              persistent-hint
              required
            />

            <v-text-field
              v-if="formData.printerType === PrusaLinkType"
              v-model="formData.password"
              class="ma-1"
              hint="Password (visit your printer settings)"
              label="Password"
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
          color="primary"
        >
          {{ printerValidationError }}
          <v-checkbox
            v-model="forceSavePrinter"
            color="warning"
            label="Force save"
          />
        </v-alert>
        <v-alert
          v-if="validatingPrinter"
          class="my-3"
        >
          Validating printer
          <v-progress-circular indeterminate />
        </v-alert>
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
import { inject } from "vue";
import { generateInitials, newRandomNamePair } from "@/shared/noun-adjectives.data";
import { usePrinterStore } from "@/store/printer.store";
import { PrintersService } from "@/backend";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useTestPrinterStore } from "@/store/test-printer.store";
import { CreatePrinter, getDefaultCreatePrinter } from "@/models/printers/crud/create-printer.model";
import { useDialog } from "@/shared/dialog.composable";
import { AppConstants } from "@/shared/app.constants";
import { useSnackbar } from "@/shared/snackbar.composable";
import { AxiosError } from "axios";
import { useFeatureStore } from "@/store/features.store";
import klipperLogoSvg from "@/assets/klipper-logo.svg";
import octoPrintTentacleSvg from "@/assets/octoprint-tentacle.svg";
import prusaLinkLogoSvg from "@/assets/prusa-link-logo.svg";
import {
  getServiceName,
  isMoonrakerType, isPrusaLinkType,
  MoonrakerType,
  OctoPrintType,
  PrusaLinkType,
} from "@/utils/printer-type.utils";

const dialog = useDialog(DialogName.AddOrUpdatePrinterDialog);
const printersStore = usePrinterStore();
const testPrinterStore = useTestPrinterStore();
const featureStore = useFeatureStore();
const appConstants = inject("appConstants") as AppConstants;
const snackbar = useSnackbar();

const printerValidationError = ref<null | string>(null);
const validatingPrinter = ref(false);
const forceSavePrinter = ref(false);
const showChecksPanel = ref(false);
const copyPasteConnectionString = ref("");
const formData = ref(getDefaultCreatePrinter());

const serviceTypes = computed(() => {
  if (featureStore.hasFeature("multiplePrinterServices")) {
    const feature = featureStore.getFeature<{ types: string[] }>(
      "multiplePrinterServices",
    );
    const hasKlipperSupport = feature?.subFeatures?.types?.includes("klipper");
    const hasPrusaLinkSupport = feature?.subFeatures?.types?.includes("prusaLink");

    return [
      {
        name: getServiceName(OctoPrintType),
        logo: octoPrintTentacleSvg,
        height: "60px",
      },
      ...(hasKlipperSupport ? [{
        name: getServiceName(MoonrakerType),
        logo: klipperLogoSvg,
        height: "60px",
      }] : []),
      ...(hasPrusaLinkSupport ? [{
        name: getServiceName(PrusaLinkType),
        logo: prusaLinkLogoSvg,
        height: "20px",
      }] : []),
    ];
  }

  return [
    {
      name: "OctoPrint",
      logo: octoPrintTentacleSvg,
      height: "75px",
    },
  ];
});

const printerId = computed(() => {
  return printersStore.updateDialogPrinter?.id;
});

onMounted(async () => {
  if (printerId.value) {
    const crudeData = printersStore.printer(printerId.value) as CreatePrinter;
    formData.value = PrintersService.convertPrinterToCreateForm(crudeData);
  }
});

watch(printerId, (val) => {
  if (!val) return;
  const printer = printersStore.printer(val) as CreatePrinter;
  formData.value = PrintersService.convertPrinterToCreateForm(printer);
});

const storedPrinter = computed(() => {
  return printersStore.updateDialogPrinter;
});

const isUpdating = computed(() => {
  return !!storedPrinter.value;
});

const submitButtonText = computed(() => {
  return isUpdating ? "Save" : "Create";
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
  if (isPrusaLinkType(form.printerType)) {
    return form.printerURL?.length && form.name?.length && form.username?.length && form.password?.length;
  }
  return form.printerURL?.length && form.name?.length && form.apiKey?.length;
};

async function createPrinter(newPrinterData: CreatePrinter) {
  await printersStore.createPrinter(newPrinterData, forceSavePrinter.value);
  snackbar.openInfoMessage({
    title: `Printer ${newPrinterData.name} created`,
  });
}

async function updatePrinter(updatedPrinter: CreatePrinter) {
  const printerId = updatedPrinter.id;

  await printersStore.updatePrinter(
    {
      printerId: printerId as string,
      updatedPrinter,
    },
    forceSavePrinter.value,
  );

  snackbar.openInfoMessage({
    title: `Printer ${updatedPrinter.name} updated`,
  });
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
    formData.value.printerURL += "https://";
  }

  const createdPrinter = formData.value as CreatePrinter;

  if (isMoonrakerType(createdPrinter.printerType) || isPrusaLinkType(createdPrinter.printerType)) {
    createdPrinter.apiKey = "";
  }

  try {
    if (isUpdating.value) {
      await updatePrinter(createdPrinter);
    } else {
      await createPrinter(createdPrinter);
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

async function duplicatePrinter() {
  formData.value.name = newRandomNamePair();
  printersStore.updateDialogPrinter = undefined;
  printerValidationError.value = null;
  forceSavePrinter.value = false;
  printerValidationError.value = null;
}

function closeDialog() {
  dialog.closeDialog();
  forceSavePrinter.value = false;
  printerValidationError.value = null;
  showChecksPanel.value = false;
  testPrinterStore.clearEvents();
  resetForm();
  printersStore.updateDialogPrinter = undefined;
  copyPasteConnectionString.value = "";
}
</script>
