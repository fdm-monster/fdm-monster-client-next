<template>
  <v-snackbar
    v-model="snackbarOpened"
    absolute
    location="bottom"
    :color="isWarning ? 'warning darken-2' : 'success'"
    class="ma-3 elevation-24"
    rounded="pill"
    :timeout="timeout"
    style="z-index: 1000"
    multi-line
  >
    <v-row>
      <v-col cols="2">
        <v-btn icon="info" />
      </v-col>
      <v-col
        cols="8"
        class="d-flex align-center flex-row"
      >
        <div>
          <span class="font-weight-bold text-button">
            {{ infoTitle }}
          </span>
          <div v-if="infoSubtitle?.length">
            {{ infoSubtitle }}
          </div>
        </div>
      </v-col>
      <v-col cols="2">
        <v-btn
          icon="close"
          @click="snackbarOpened = false"
        />
      </v-col>
    </v-row>
  </v-snackbar>
</template>
<script lang="ts" setup>
import { InfoMessage, useSnackbar } from '@/shared/snackbar.composable'
import { onMounted, ref } from 'vue'

const snackbar = useSnackbar()
const snackbarOpened = ref(false)
const infoTitle = ref('')
const infoSubtitle = ref('')
const timeout = ref(2000)
const isWarning = ref(false)

onMounted(() => {
  snackbar.onInfoMessage((data: InfoMessage) => {
    infoTitle.value = data.title
    infoSubtitle.value = data.subtitle ?? ''
    isWarning.value = data.warning ?? false
    timeout.value = data.timeout ?? 2000
    snackbarOpened.value = true
  })
})
</script>
