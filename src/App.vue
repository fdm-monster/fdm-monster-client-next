<template>
  <v-app>
    <AppInfoSnackbar />
    <AppErrorSnackbar />
    <AppProgressSnackbar />

    <NavigationBar
      v-if="
        !appLoaderStore.loading &&
        ((authStore.hasAuthToken && !authStore.isLoginExpired) ||
        !authStore.loginRequired)
      "
    />
    <TopBar
      v-if="
        !appLoaderStore.loading &&
        ((authStore.hasAuthToken && !authStore.isLoginExpired) ||
        !authStore.loginRequired)
      "
    />

    <AppLoader>
      <v-main>
        <router-view />
      </v-main>
    </AppLoader>

    <AddOrUpdatePrinterDialog />
    <AddOrUpdateCameraStreamDialog />
    <AddOrUpdateFloorDialog />
    <CreateUserDialog />
    <GridSettingsDialog />
    <PrinterMaintenanceDialog />
    <OctoFarmImportDialog />
    <YamlImportExportDialog />
    <FileExplorerSideNav />
    <BatchReprintDialog />
    <PrinterControlDialog />
    <JsonViewerDialog />
  </v-app>
</template>

<script lang="ts" setup>
import { onMounted, watch } from 'vue'
import { useUploadsStore } from './store/uploads.store'
import { uploadProgressTest } from './utils/test.util'
import { useAuthStore } from './store/auth.store'
import { useOverlayStore } from './store/overlay.store'
import AppLoader from './AppLoader.vue'

const uploadsStore = useUploadsStore()
const authStore = useAuthStore()
const appLoaderStore = useOverlayStore()

const queuedUploads = uploadsStore.queuedUploads

watch(queuedUploads, async () => {
  await uploadsStore.handleNextUpload()
})

onMounted(() => {
  console.debug(
    `App.vue mounted. Logged in: ${ authStore.hasAuthToken }, Expired: ${ authStore.isLoginExpired }`
  )
  uploadProgressTest(false)
})
</script>

<style>
/* Used to improve Vuetify tooltips: increased contrast and legibility */
.v-tooltip > .v-overlay__content {
  transition-duration: 75ms !important;
  background-color: #232323;
  color: white;
  border: 1px solid white;
}

/* Fix the main app height calculation as 100dvh or 100vh seem to wrong (on Edge for Desktop) */
.v-application__wrap {
  min-height: calc(100vh - 1px) !important;
}
</style>
