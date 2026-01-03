<template>
  <v-card>
    <v-card-text>
      <SettingSection
        v-if="settingsStore.settings?.timeout"
        title="API Timeout"
        tooltip="Set the server default REST API timeout in milliseconds."
      >
        <v-text-field
          v-model="settingsStore.settings.timeout.apiTimeout"
          label="Connection Timeout"
          min="0"
          type="number"
          @change="updateTimeoutSettings"
        />
        <v-progress-circular
          v-if="loading.timeoutSettings"
          class="ml-2"
          indeterminate
          size="30"
          width="4"
        />
      </SettingSection>

      <SettingSection
        v-if="settingsStore.settings?.timeout"
        title="Upload Timeout"
        tooltip="Set the server REST API file upload timeout in milliseconds."
      >
        <v-text-field
          v-model="settingsStore.settings.timeout.apiUploadTimeout"
          label="Upload Timeout"
          min="0"
          type="number"
          @change="updateTimeoutSettings"
        />
        <v-progress-circular
          v-if="loading.timeoutSettings"
          class="ml-2"
          indeterminate
          size="30"
          width="4"
        />
      </SettingSection>

      <v-divider />

      <SettingSection
        title="Clean File References"
        tooltip="Clear out file references without removing them from OctoPrint."
      >
        <v-btn
          color="primary"
          @click="purgeFiles()"
        >
          Purge File References
        </v-btn>
        <v-progress-circular
          v-if="loading.purgeFiles"
          class="ml-2"
          indeterminate
          size="30"
          width="4"
        />
      </SettingSection>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { PrinterFileService } from "@/backend";
import { useSnackbar } from "@/shared/snackbar.composable";
import { useSettingsStore } from "@/store/settings.store";
import SettingsToolbar from "@/components/Settings/Shared/SettingsToolbar.vue";
import SettingSection from "@/components/Settings/Shared/SettingSection.vue";
import { settingsPage } from "@/router/setting.constants";

const page = settingsPage["printer"];

const settingsStore = useSettingsStore();
const snackbar = useSnackbar();

const loading = ref({
  timeoutSettings: false,
  purgeFiles: false,
});

async function updateTimeoutSettings() {
  settingsStore.settings!.timeout.apiTimeout = Number.parseInt(settingsStore.settings!.timeout.apiTimeout.toString());
  settingsStore.settings!.timeout.apiUploadTimeout = Number.parseInt(settingsStore.settings!.timeout.apiUploadTimeout.toString());
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
</script>
