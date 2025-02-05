<template>
  <v-card>
    <v-toolbar color="primary">
      <v-avatar>
        <v-icon>settings</v-icon>
      </v-avatar>
      <v-toolbar-title> OctoPrint Settings </v-toolbar-title>
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
          The connection timeout is the amount of time in milliseconds that the
          server will wait for OctoPrint to respond before giving up
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

<script lang="ts">
import { defineComponent } from 'vue'
import { PrinterFileService, SettingsService } from '@/backend'
import { PrinterSettingsService } from '@/backend/printer-settings.service'
import { FileCleanSettings } from '@/models/settings/printer-file-clean-settings.model'
import { usePrinterStore } from '@/store/printer.store'
import { usePrinterStateStore } from '@/store/printer-state.store'
import { useSnackbar } from '@/shared/snackbar.composable'
import { useSettingsStore } from '@/store/settings.store'

interface Data {
  fileHandlingSettings: FileCleanSettings
}

export default defineComponent({
  name: 'FdmSettings',

  props: {},
  setup: () => {
    return {
      settingsStore: useSettingsStore(),
      printersStore: usePrinterStore(),
      snackbar: useSnackbar(),
      printerStateStore: usePrinterStateStore()
    }
  },
  data: (): Data => ({
    fileHandlingSettings: {
      autoRemoveOldFilesBeforeUpload: false,
      autoRemoveOldFilesAtBoot: false,
      autoRemoveOldFilesCriteriumDays: 7
    }
  }),

  computed: {},

  watch: {},

  async created() {
    const settings = await SettingsService.getSettings()
    this.fileHandlingSettings = settings.printerFileClean
  },

  mounted() {},
  methods: {
    async updateTimeoutSettings() {
      if (!this.settingsStore.settings?.timeout?.apiTimeout) {
        this.snackbar.error('Timeout not set')
        return
      }
      if (this.settingsStore.settings.timeout.apiTimeout < 1000) {
        this.snackbar.error(
          'Timeout is too low - please set it to at least 1000 milliseconds'
        )
      } else {
        await this.settingsStore.updateTimeoutSettings(
          this.settingsStore.settings?.timeout
        )
        this.snackbar.info('Timeout settings updated')
      }
    },

    async setFileCleanSettings() {
      const serverSettings = await SettingsService.setFileCleanSettings(
        this.fileHandlingSettings
      )
      this.fileHandlingSettings = serverSettings.printerFileClean
    },

    async purgeFiles() {
      await PrinterFileService.purgeFiles()

      this.snackbar.openInfoMessage({
        title: 'Successfully purged all references to printer files!'
      })
    },

    async bulkDisableGCodeAnalysis() {
      const printers = this.printerStateStore.onlinePrinters
      this.snackbar.openInfoMessage({
        title: `Trying to disable gcode analysis for ${printers.length} online printers.`
      })
      for (const printer of Object.values(printers)) {
        await PrinterSettingsService.setGCodeAnalysis(printer.id, false)
      }
      this.snackbar.openInfoMessage({
        title: `Finished disabling gcode analysis for ${printers.length} online printers.`
      })
    }
  }
})
</script>
