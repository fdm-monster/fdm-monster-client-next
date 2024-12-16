<template>
  <v-app>
    <AppInfoSnackbar />
    <AppErrorSnackbar />
    <AppProgressSnackbar />

    <NavigationBar
      v-if="
        (authStore.hasAuthToken && !authStore.isLoginExpired) ||
        !authStore.loginRequired
      "
    />
    <TopBar
      v-if="
        (authStore.hasAuthToken && !authStore.isLoginExpired) ||
        !authStore.loginRequired
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
  </v-app>
</template>

<script lang="ts" setup>
import { onMounted, watch } from 'vue'
import { useUploadsStore } from './store/uploads.store'
import { uploadProgressTest } from './utils/test.util'
import { useAuthStore } from './store/auth.store'
import AppLoader from './AppLoader.vue'
import { hideSplashScreen } from '@/plugins/dev-splashscreen/runtime'

const uploadsStore = useUploadsStore()
const authStore = useAuthStore()

const queuedUploads = uploadsStore.queuedUploads

watch(queuedUploads, async () => {
  await uploadsStore.handleNextUpload()
})

onMounted(() => {
  hideSplashScreen()
  console.debug(
    `App.vue mounted. Logged in: ${authStore.hasAuthToken}, Expired: ${authStore.isLoginExpired}`
  )
  uploadProgressTest(false)
})
</script>

<style>
.v-tooltip > .v-overlay__content {
  transition-duration: 75ms !important;
  background-color: #232323;
  color: white;
  border: 1px solid white;
}
</style>
