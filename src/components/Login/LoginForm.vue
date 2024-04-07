<template>
  <v-card
    class="pa-4"
    elevation="10"
    style="border-radius: 10px">
    <v-card-text>
      <v-form>
        <label>
          Username
        </label>
        <v-text-field
          v-model="username"
          autofocus
          name="login"
          placeholder="Username"
          prepend-icon="mdi-account"
          type="text"
          variant="underlined"
          @keyup.enter="formIsDisabled || login()" />
        <v-text-field
          id="password"
          v-model="password"
          :append-icon="showPassword ? 'visibility_off' : 'visibility'"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          name="password"
          password
          prepend-icon="lock"
          variant="underlined"
          @click:append="showPassword = !showPassword"
          @keyup.enter="formIsDisabled || login()" />
        <v-alert
          v-if="errorMessage"
          class="mt-6"
          color="error"
          density="compact"
          variant="outlined">
          {{ errorMessage }}
        </v-alert>
        <v-alert
          v-if="authStore.lastLogoutReason"
          class="mt-6"
          color="error-darken-1"
          density="compact"
          variant="outlined">
          Reason for automatic logout: {{ authStore.lastLogoutReason }}
        </v-alert>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn
        :loading="loading"
        class="pa-4"
        color="primary"
        size="lg"
        variant="flat"
        style="width: 100%"
        @click="login()">
        Login
      </v-btn>
    </v-card-actions>
    <v-card-actions>
      <v-btn
        :disabled="!authStore.registration"
        class="pa-4"
        size="lg"
        variant="flat"
        style="width: 100%"
        @click="gotoRegistration()">
        Register new account {{ authStore.registration ? "" : "(not enabled)" }}
        <v-icon
          class="pl-5"
          icon="right" />
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useEventBus} from '@vueuse/core'
import {AxiosError} from 'axios'
import {useAuthStore} from '@/store/auth.store'
import {useSnackbar} from '@/shared/snackbar.composable'
import {RouteNames} from '@/router/route-names'
import {AUTH_ERROR_REASON, convertAuthErrorReason} from '@/shared/auth.constants'

const authStore = useAuthStore()
const errorMessage = ref('')
const username = ref('')
const showPassword = ref(false)
const password = ref('')
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const loginEvent = useEventBus('auth:login')
const snackbar = useSnackbar()

const formIsDisabled = computed(() => {
  return (username.value ?? '')?.length < 3 || (password.value ?? '').length < 3
})

onMounted(async () => {
  authStore.loadTokens()
  await authStore.checkAuthenticationRequirements()
  if (authStore.loginRequired === false) {
    // As AppLoader might not trigger, we trigger it ourselves
    console.debug('LoginView, no login required, redirecting to', route.query.redirect, 'or home')
    loginEvent.emit(true)
    return await routeToRedirect()
  }
  if (!authStore.hasRefreshToken) {
    return
  }

  // Check if login is already valid, if so route away safely
  const success = await authStore.verifyOrRefreshLoginOnceOrLogout()
  if (success) {
    await routeToRedirect()
  }
})

async function gotoRegistration() {
  return await router.push({name: RouteNames.Registration})
}

async function login() {
  try {
    loading.value = true
    await authStore.login(username.value, password.value)
    authStore.lastLogoutReason = null
    password.value = ''
    loading.value = false
  } catch (e) {
    loading.value = false
    if ((e as AxiosError)?.response?.status === 401) {
      password.value = ''

      const reasonCode: keyof typeof AUTH_ERROR_REASON = ((e as AxiosError)?.response?.data as any)
        ?.reasonCode
      const convertedReason = convertAuthErrorReason(reasonCode)
      if (reasonCode === AUTH_ERROR_REASON.AccountNotVerified) {
        snackbar.error(
          convertedReason,
          'Please ask your administrator to verify your account and try again.'
        )
      } else if (reasonCode === AUTH_ERROR_REASON.PasswordChangeRequired) {
        snackbar.error(
          convertedReason,
          'Your password needs to be changed. This feature is sadly not finished'
        )
      }

      errorMessage.value = convertedReason
      return
    }

    snackbar.openErrorMessage({
      title: 'Error logging in',
      subtitle: 'Please test your connection and try again.',
    })
    errorMessage.value = 'Error logging in - status code ' + (e as AxiosError)?.response?.status
    password.value = ''

    return
  }

  errorMessage.value = ''

  // Trigger AppLoader
  loginEvent.emit(true)

  return await routeToRedirect()
}

async function routeToRedirect() {
  const routePath = route.query.redirect
  if (!routePath) {
    console.debug('[LoginForm] Redirecting to home')
    await router.push({name: RouteNames.Home})
    return
  } else {
    console.debug('[LoginForm] Redirecting to ', routePath)
    await router.push({
      path: routePath as string,
    })
    return
  }
}
</script>
