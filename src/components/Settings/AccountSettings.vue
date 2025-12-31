<template>
  <v-card>
    <SettingsToolbar :icon="page.icon" :title="page.title" />
    <v-card-text>
      <v-alert v-if="!loginEnabled" color="primary" variant="tonal" class="mb-4">
        Login is currently disabled. To adjust your username and password,
        please enable that setting at the Server Protection settings page.
        Then log in and visit this page.
      </v-alert>

      <SettingSection title="Change Username" :usecols="false">
        <v-text-field
          v-model="formData.username"
          :disabled="!loginEnabled"
          label="Fill in your username"
        />
        <v-btn
          :disabled="!loginEnabled"
          color="primary"
          class="mt-2"
          @click="changeUsername()"
        >
          Change username
        </v-btn>
      </SettingSection>

      <v-divider />

      <SettingSection title="Change Password" :usecols="false">
        <v-text-field
          v-model="formData.oldPassword"
          :disabled="!loginEnabled"
          placeholder="Old password"
          type="password"
          label="Old Password"
          class="mb-3"
        />
        <v-text-field
          v-model="formData.newPassword"
          :disabled="!loginEnabled"
          placeholder="New password"
          type="password"
          label="New Password"
          class="mb-3"
        />
        <v-text-field
          v-model="formData.repeatPassword"
          :disabled="!loginEnabled"
          placeholder="Repeat new password"
          type="password"
          label="Repeat New Password"
          class="mb-3"
        />
        <v-btn
          :disabled="!loginEnabled"
          color="primary"
          @click="changePassword()"
        >
          Change password
        </v-btn>
      </SettingSection>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { useProfileStore } from '@/store/profile.store'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { UserService } from '@/backend/user.service'
import { useSnackbar } from '@/shared/snackbar.composable'
import { useAuthStore } from '@/store/auth.store'
import { routeToLogin } from '@/router/utils'
import { useSettingsStore } from '@/store/settings.store'
import SettingsToolbar from '@/components/Settings/Shared/SettingsToolbar.vue'
import SettingSection from '@/components/Settings/Shared/SettingSection.vue'
import { settingsPage } from '@/router/setting.constants'

const page = settingsPage['account']
const settingsStore = useSettingsStore()
const profileStore = useProfileStore()
const authStore = useAuthStore()
const router = useRouter()
const snackbar = useSnackbar()
const loginEnabled = ref<boolean>()
const userId = ref<number | null>(null)
const formData = ref<{
  username: string
  oldPassword: string
  newPassword: string
  repeatPassword: string
}>({ username: '', newPassword: '', oldPassword: '', repeatPassword: '' })

onMounted(async () => {
  await settingsStore.loadSettings()
  loginEnabled.value = settingsStore.settings?.server.loginRequired

  await profileStore.getProfile()
  formData.value.username = profileStore.username as string
  userId.value = profileStore.userId
})

async function changeUsername() {
  if (!userId.value?.toString()?.length) {
    snackbar.openErrorMessage({ title: 'User not loaded' })
    return
  }
  await UserService.changeUsername(userId.value, formData.value.username)

  await profileStore.getProfile()
  formData.value.username = profileStore.username as string
  snackbar.openInfoMessage({ title: 'Username changed' })
}

async function changePassword() {
  if (!userId.value?.toString()?.length) {
    snackbar.openErrorMessage({ title: 'User not loaded' })
    return
  }
  if (formData.value.newPassword !== formData.value.repeatPassword) {
    snackbar.openErrorMessage({ title: 'Passwords do not match' })
    return
  }
  await UserService.changePassword(
    userId.value,
    formData.value.oldPassword,
    formData.value.newPassword
  )
  formData.value.oldPassword = ''
  formData.value.newPassword = ''
  formData.value.repeatPassword = ''
  snackbar.openInfoMessage({ title: 'Password changed' })
  await authStore.logout(true)
  await routeToLogin(router)
}
</script>
