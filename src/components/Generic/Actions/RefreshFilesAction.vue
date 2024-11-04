<template>
  <v-btn
    color="secondary"
    @click="getFiles()"
  >
    <v-icon>refresh</v-icon>
    <span class="d-none d-lg-inline"> Refresh files </span>
  </v-btn>
</template>

<script lang="ts">
import { usePrinterStore } from '@/store/printer.store'
import { defineComponent, PropType } from 'vue'
import { PrinterDto } from '@/models/printers/printer.model'

export default defineComponent({
  name: 'RefreshFilesAction',
  components: {},
  props: {
    printer: Object as PropType<PrinterDto>
  },
  setup: () => {
    return {
      printersStore: usePrinterStore()
    }
  },
  methods: {
    async getFiles() {
      if (!this.printer) return

      await this.printersStore.loadPrinterFiles(this.printer.id)
    }
  }
})
</script>
