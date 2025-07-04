<template>
  <v-card>
    <v-toolbar color="primary">
      <v-avatar>
        <v-icon>settings</v-icon>
      </v-avatar>
      <v-toolbar-title> Server Protection Settings </v-toolbar-title>
    </v-toolbar>
    <v-list lines="three">
      <v-list-item>
        <v-list-item-title> Login Required </v-list-item-title>

        <v-list-item-subtitle>
          <v-row>
            <v-col
              cols="12"
              md="2"
            >
              <v-checkbox
                v-model="loginRequired"
                label="Require Login"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn
                color="primary"
                @click="setLoginRequired()"
              >
                save login required setting
              </v-btn>
            </v-col>
          </v-row>
        </v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title> Registration Enabled </v-list-item-title>
        <v-list-item-subtitle>
          <v-row>
            <v-col
              cols="12"
              md="2"
            >
              <v-checkbox
                v-model="registrationEnabled"
                label="Enable Registration"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn
                color="primary"
                @click="setRegistrationEnabled()"
              >
                save registration enabled setting
              </v-btn>
            </v-col>
          </v-row>
        </v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title>
          Login Expiry Settings (advanced)
        </v-list-item-title>

        <v-list-item-subtitle>
          <v-row>
            <v-col
              cols="12"
              md="2"
            >
              <v-text-field
                v-model="jwtExpiresIn"
                :rules="[(val) => !!val && val >= 2 && val <= 120]"
                label="JWT Expiry (minutes)"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              md="2"
            >
              <v-checkbox
                v-model="refreshTokenAttemptsEnabled"
                label="Enable Refresh Token Attempts"
                @update:model-value="onRefreshTokenEnabledChange()"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              md="2"
            >
              <v-text-field
                v-model="refreshTokenAttempts"
                :disabled="!refreshTokenAttemptsEnabled"
                :rules="[(val) => !!val && val >= 1]"
                label="Refresh Token Attempts (disabled: -1, range: 1 to 50)"
                type="number"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              md="2"
            >
              <v-text-field
                v-model="refreshTokenExpiry"
                :rules="[(val) => !!val && val >= 1 && val <= 30]"
                label="Refresh Token Expiry (days)"
              />
            </v-col>
          </v-row>

          <v-alert color="secondary">
            <v-icon>info</v-icon> &nbsp; Be cautious, setting the wrong expiry
            could make you lose access to the server or make your user
            experience highly degraded!
          </v-alert>

          <v-row>
            <v-col>
              <v-btn
                color="primary"
                @click="saveLoginExpirySettings()"
              >
                save login expiry settings
              </v-btn>
              <v-btn
                color="default"
                @click="resetLoginExpirySettingsToDefault()"
              >
                reset to default
              </v-btn>
            </v-col>
          </v-row>
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { SettingsService } from '@/backend'
import { useSnackbar } from '@/shared/snackbar.composable'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'vue-router'
import { RouteNames } from '@/router/route-names'

const router = useRouter()
const snackbar = useSnackbar()
const authStore = useAuthStore()

const ipAddress = ref<string>('')

const loginRequired = ref<boolean>(false)
const registrationEnabled = ref<boolean>(false)

const jwtExpiresIn = ref<number>(3200)
const refreshTokenAttemptsEnabled = ref<boolean>(false)
const refreshTokenAttempts = ref<number>(-1)
const refreshTokenExpiry = ref<number>(14)

async function loadSettings() {
  const settings = await SettingsService.getSettings()
  loginRequired.value = settings.server.loginRequired
  registrationEnabled.value = settings.server.registration

  ipAddress.value = settings.connection?.clientIp ?? '127.0.0.1'

  const sensitiveSettings = await SettingsService.getSettingsSensitive()
  jwtExpiresIn.value = sensitiveSettings.credentials.jwtExpiresIn / 60
  refreshTokenAttemptsEnabled.value =
    sensitiveSettings.credentials.refreshTokenAttempts !== -1
  refreshTokenAttempts.value =
    sensitiveSettings.credentials.refreshTokenAttempts
  refreshTokenExpiry.value =
    sensitiveSettings.credentials.refreshTokenExpiry / 24 / 3600
}

onMounted(async () => {
  await loadSettings()
})

function onRefreshTokenEnabledChange() {
  if (!refreshTokenAttemptsEnabled.value) {
    refreshTokenAttempts.value = -1
  }
}

async function setLoginRequired() {
  const loginRequiredVal = loginRequired.value
  if (
    !loginRequiredVal &&
    !confirm('Disabling login will expose your server. Continue?')
  ) {
    return
  }

  await SettingsService.updateLoginRequiredSettings(loginRequiredVal)

  await authStore.logout(true)

  await authStore.checkAuthenticationRequirements()
  if (!loginRequiredVal) {
    await router.push({ name: RouteNames.Home })
  } else {
    await router.push({ name: RouteNames.Login })
  }
  snackbar.info('Login Required settings updated')
}

async function setRegistrationEnabled() {
  await SettingsService.updateRegistrationEnabledSettings(
    registrationEnabled.value
  )
  await authStore.checkAuthenticationRequirements()
  snackbar.info('Registration settings updated')
}

async function resetLoginExpirySettingsToDefault() {
  jwtExpiresIn.value = 120
  refreshTokenAttemptsEnabled.value = false
  refreshTokenAttempts.value = -1
  refreshTokenExpiry.value = 14
  await saveLoginExpirySettings()
  snackbar.info('Login expiry settings reset to default')
}

async function saveLoginExpirySettings() {
  if (jwtExpiresIn.value < 2 || jwtExpiresIn.value > 120) {
    throw new Error('JWT Expiry must be between 2 and 120 minutes')
  }
  if (
    refreshTokenAttemptsEnabled.value &&
    (refreshTokenAttempts.value < 1 || refreshTokenAttempts.value > 50)
  ) {
    throw new Error('Refresh Token Attempts must be between 1 and 50')
  }
  if (refreshTokenExpiry.value < 1 || refreshTokenExpiry.value > 30) {
    throw new Error('Refresh Token Expiry must be between 1 and 30 days')
  }

  await SettingsService.updateCredentialSettings(
    jwtExpiresIn.value * 60,
    refreshTokenAttempts.value,
    refreshTokenExpiry.value * 24 * 3600
  )
  snackbar.info('Login expiry settings updated')
}
</script>
