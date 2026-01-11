<template>
  <v-card
    class="pa-4"
    elevation="10"
    style="border-radius: 10px"
  >
    <v-card-text>
      <v-form>
        <label> Username </label>
        <v-text-field
          v-model="username"
          :rules="[
            (v) => !!v || 'Username is required',
            (v) =>
              (v?.length ?? 0) >= 3 ||
              'Username must be of length 3 or greater',
            (v) =>
              !v.toLowerCase().includes('admin') ||
              'Username may not contain the word admin',
            (v) =>
              !v.toLowerCase().includes('root') ||
              'Username may not contain the word root',
            (v) =>
              !(v.toLowerCase() === 'demo') ||
              'Username may not equal the word demo'
          ]"
          prepend-icon="person"
          autofocus
          label="Username"
          name="login"
          type="text"
          variant="underlined"
        />
        <v-text-field
          v-model="password"
          :append-inner-icon="showPassword ? 'visibility_off' : 'visibility'"
          @click:append-inner="showPassword = !showPassword"
          :type="showPassword ? 'text' : 'password'"
          :rules="[
            (v) => !!v || 'Password is required',
            (v) =>
              (!!v && v?.length >= 8) ||
              'Password must be of length 8 or greater'
          ]"
          label="Password"
          name="password"
          password
          prepend-icon="lock"
          variant="underlined"
        />
        <v-text-field
          v-model="password2"
          :append-inner-icon="showPassword2 ? 'visibility_off' : 'visibility'"
          @click:append-inner="showPassword2 = !showPassword2"
          :type="showPassword2 ? 'text' : 'password'"
          :rules="[
            (v) => !!v || 'Repeated password is required',
            (v) => v === password || 'Passwords are not equal'
          ]"
          label="Confirm Password"
          name="password2"
          password
          prepend-icon="lock"
          variant="underlined"
          @keyup.enter="formIsDisabled || registerAccount()"
        />
        <v-alert
          v-if="errorMessage"
          class="mt-6"
          color="error"
          density="compact"
          variant="outlined"
        >
          {{ errorMessage }}
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
        @click="registerAccount()"
      >
        Register account
      </v-btn>
    </v-card-actions>
    <v-card-actions>
      <v-btn
        class="pa-4"
        size="lg"
        variant="flat"
        style="width: 100%"
        @click="gotoLogin()"
      >
        <v-icon class="mr-2">arrow_back</v-icon>
        Back to Login
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import { AxiosError } from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'vue-router'
import { useSnackbar } from '@/shared/snackbar.composable'
import { AuthService } from '@/backend/auth.service'
import { RouteNames } from '@/router/route-names'

const authStore = useAuthStore()
const router = useRouter()
const errorMessage = ref('')
const username = ref('')
const showPassword = ref(false)
const showPassword2 = ref(false)
const password = ref('')
const password2 = ref('')
const loading = ref(false)
const snackbar = useSnackbar()

const formIsDisabled = computed(() => {
  return (
    (username.value ?? '')?.length < 3 ||
    (password.value ?? '').length < 3 ||
    password.value !== password2.value
  )
})

onMounted(async () => {
  await authStore.logout()
  await authStore.checkAuthenticationRequirements()
  if (!authStore.registration) {
    snackbar.info('Registration is disabled, please contact your administrator')
    await router.push({
      name: RouteNames.Login
    })
  }
})

async function gotoLogin() {
  return await router.push({ name: RouteNames.Login })
}

async function registerAccount() {
  try {
    loading.value = true
    await AuthService.registerAccount(username.value, password.value)
    loading.value = false
  } catch (e) {
    loading.value = false
    if ((e as AxiosError)?.response?.status === 401) {
      errorMessage.value = 'Invalid credentials'
      return
    }

    snackbar.openErrorMessage({
      title: 'Error registering account',
      subtitle: 'Please test your connection and try again.'
    })

    return
  }
  errorMessage.value = ''

  snackbar.info('Account created, please login')
  await gotoLogin()
}
</script>
