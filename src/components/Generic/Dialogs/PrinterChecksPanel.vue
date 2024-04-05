<template>
  <v-col :cols="cols">
    <strong>Checks:</strong>
    <v-alert v-for="(item, index) of getEvents()" :key="index" :type="item.color" dense>
      <small>{{ item.label }} {{ item.text }}</small>
    </v-alert>
  </v-col>
</template>

<script lang="ts" setup>

import {useTestPrinterStore} from "../../../store/test-printer.store"

const errorCol = "error"
const successCol = "success"
const testPrinterStore = useTestPrinterStore()
const cols = ref(4)

function getEvents() {
  return testPrinterStore.getEvents().map((e) => {
    return {
      label: e.event,
      text: e.payload,
      color: e.failure ? errorCol : successCol,
    }
  })
}
</script>
