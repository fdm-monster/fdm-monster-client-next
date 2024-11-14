<template>
  <v-snackbar
    v-model="snackbarOpened"
    :timeout="snackbarTimeout"
    absolute
    location="bottom"
    class="ml-16 mb-16 ma-3 elevation-24"
    color="error-darken-1"
    rounded="pill"
    multi-line
    style="z-index: 1000"
    width="450"
  >
    <v-row>
      <v-col cols="2">
        <v-btn icon="error" />
      </v-col>
      <v-col
        class="d-flex align-center flex-row"
        cols="8"
      >
        <div>
          <span class="font-weight-bold text-button">
            {{ snackbarTitle }}
          </span>
          <div v-if="snackbarSubtitle?.length">
            {{ snackbarSubtitle }}
          </div>
        </div>
      </v-col>

      <v-col cols="1">
        <v-btn
          icon="close"
          @click="snackbarOpened = false"
        />
      </v-col>
    </v-row>
  </v-snackbar>
</template>
<script lang="ts" setup>
import { ErrorMessage, useSnackbar } from '@/shared/snackbar.composable'
import { onMounted, ref } from 'vue'

const snackbar = useSnackbar()
const snackbarTimeout = ref(-1)
const snackbarOpened = ref(false)
const snackbarTitle = ref('')
const snackbarSubtitle = ref('')

onMounted(() => {
  snackbar.onErrorMessage((data: ErrorMessage) => {
    snackbarTitle.value = data.title
    snackbarSubtitle.value = data.subtitle ?? ''
    snackbarOpened.value = true
    snackbarTimeout.value = data.timeout ?? 10000
  })
})
</script>
