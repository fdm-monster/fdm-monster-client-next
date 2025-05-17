<template>
  <v-card>
    <v-toolbar color="primary">
      <v-avatar>
        <v-icon>settings</v-icon>
      </v-avatar>
      <v-toolbar-title> Printer Settings </v-toolbar-title>
    </v-toolbar>
    <v-list lines="three">
      <v-list-item>
        <v-list-item-title> Pre-upload file cleanup </v-list-item-title>
        <v-list-item-subtitle>
          Automatically cleanup old files to ensure the SD card has enough
          space.
          <br />
          <v-checkbox
            v-model="fileHandlingSettings.autoRemoveOldFilesBeforeUpload"
            label="Remove old file before upload"
          />
          <v-text-field
            v-model="fileHandlingSettings.autoRemoveOldFilesCriteriumDays"
            :disabled="!fileHandlingSettings.autoRemoveOldFilesBeforeUpload"
            label="Amount of days to keep files"
            min="0"
            variant="outlined"
            type="number"
          />
          <v-checkbox
            v-model="fileHandlingSettings.autoRemoveOldFilesAtBoot"
            label="Remove old files when (re)booting the server"
          />
          <v-btn
            color="primary"
            @click="setFileCleanSettings()"
          >
            save file clean settings
          </v-btn>
        </v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title> Connection Timeout </v-list-item-title>
        <v-list-item-subtitle v-if="settingsStore.settings?.timeout">
          Set the server default REST API timeout in milliseconds.
          <v-text-field
            v-model="settingsStore.settings.timeout.apiTimeout"
            label="Connection Timeout"
            min="0"
            variant="outlined"
            type="number"
          />
          <v-btn
            color="primary"
            @click="updateTimeoutSettings()"
          >
            save connection timeout
          </v-btn>
        </v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title> Upload Timeout </v-list-item-title>
        <v-list-item-subtitle v-if="settingsStore.settings?.timeout">
          Set the server REST API file upload timeout in milliseconds.
          <v-text-field
            v-model="settingsStore.settings.timeout.apiUploadTimeout"
            label="Upload Timeout"
            min="0"
            variant="outlined"
            type="number"
          />
          <v-btn
            color="primary"
            @click="updateTimeoutSettings()"
          >
            save upload timeout
          </v-btn>
        </v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title> Clean file references </v-list-item-title>
        <v-list-item-subtitle>
          Clear out the file references for all printers - this does not remove
          them from OctoPrint!
          <br />
          <v-btn
            color="primary"
            @click="purgeFiles()"
          >
            Purge file references
          </v-btn>
        </v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title>
          Disable inefficient GCode analysis
        </v-list-item-title>
        <v-list-item-subtitle>
          Disable GCode analysis on all printers at once, preventing CPU
          intensive and inaccurate time/size estimates.
          <br />
          <v-btn
            color="primary"
            @click="bulkDisableGCodeAnalysis()"
          >
            Bulk disable GCode Analysis
          </v-btn>
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { PrinterFileService, SettingsService } from "@/backend";
import { PrinterSettingsService } from "@/backend/printer-settings.service";
import { usePrinterStateStore } from "@/store/printer-state.store";
import { useSnackbar } from "@/shared/snackbar.composable";
import { useSettingsStore } from "@/store/settings.store";

const settingsStore = useSettingsStore();
const printerStateStore = usePrinterStateStore();
const snackbar = useSnackbar();

const fileHandlingSettings = ref({
  autoRemoveOldFilesBeforeUpload: false,
  autoRemoveOldFilesAtBoot: false,
  autoRemoveOldFilesCriteriumDays: 7,
});

const loading = ref({
  fileCleanSettings: false,
  timeoutSettings: false,
  purgeFiles: false,
  bulkDisableGCodeAnalysis: false,
});

onMounted(async () => {
  const settings = await SettingsService.getSettings();
  fileHandlingSettings.value = settings.printerFileClean;
});

async function updateTimeoutSettings() {
  settingsStore.settings!.timeout.apiTimeout = parseInt(settingsStore.settings!.timeout.apiTimeout.toString());
  settingsStore.settings!.timeout.apiUploadTimeout = parseInt(settingsStore.settings!.timeout.apiUploadTimeout.toString());
  if (!settingsStore.settings?.timeout?.apiTimeout) {
    snackbar.error("Timeout not set");
    return;
  }
  if (settingsStore.settings.timeout.apiTimeout < 1000) {
    snackbar.error("Timeout is too low - please set it to at least 1000 milliseconds");
    settingsStore.settings.timeout.apiTimeout = 1000;
  }
  if (settingsStore.settings.timeout.apiUploadTimeout < 10000) {
    snackbar.error("Upload timeout is too low - please set it to at least 10000 milliseconds");
    settingsStore.settings.timeout.apiUploadTimeout = 10000;
  } else {
    loading.value.timeoutSettings = true;
    try {
      await settingsStore.updateTimeoutSettings(settingsStore.settings.timeout);
      snackbar.info("Timeout settings updated");
    } finally {
      loading.value.timeoutSettings = false;
    }
  }
}

async function setFileCleanSettings() {
  loading.value.fileCleanSettings = true;
  try {
    const serverSettings = await SettingsService.setFileCleanSettings(fileHandlingSettings.value);
    fileHandlingSettings.value = serverSettings.printerFileClean;
    snackbar.openInfoMessage({
      title: `Successfully saved file cleanup settings`,
    });
  } finally {
    loading.value.fileCleanSettings = false;
  }
}

async function purgeFiles() {
  loading.value.purgeFiles = true;
  try {
    await PrinterFileService.purgeFiles();
    snackbar.openInfoMessage({
      title: `Successfully purged all references to printer files!`,
    });
  } finally {
    loading.value.purgeFiles = false;
  }
}

async function bulkDisableGCodeAnalysis() {
  loading.value.bulkDisableGCodeAnalysis = true;
  try {
    const printers = printerStateStore.onlinePrinters;
    for (const printer of Object.values(printers)) {
      await PrinterSettingsService.setGCodeAnalysis(printer.id, false);
    }
    snackbar.openInfoMessage({
      title: `Finished disabling GCode analysis for ${printers.length} online printers.`,
    });
  } finally {
    loading.value.bulkDisableGCodeAnalysis = false;
  }
}
</script>
