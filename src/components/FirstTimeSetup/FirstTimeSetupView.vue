<template>
  <v-container fluid>
    <img
      alt="FDM Monster Background"
      class="grid-bg-img align-content-center"
      src="/img/logo.svg"
      style="opacity: 0.08"
    />

    <v-row class="justify-center">
      <v-col cols="12" md="10" lg="8">
        <v-stepper
          v-model="stepper"
          class="bg-grey-darken-4"
        >
          <v-stepper-header>
            <v-stepper-item
              :complete="stepper > 1"
              :value="1"
              title="Introduction"
            />

            <v-divider/>

            <v-stepper-item
              :complete="stepper > 2"
              :value="2"
              title="Login & Registration"
            />

            <v-divider/>

            <v-stepper-item
              :value="3"
              title="What's Next?"
            />
          </v-stepper-header>

          <v-stepper-window v-model="stepper">
            <v-stepper-window-item :value="1">
              <!-- Introduction Header -->
              <div class="d-flex flex-column align-center text-center" style="padding: 60px 40px 40px;">
                <div class="d-flex align-center justify-center mb-4">
                  <img
                    class="rounded-pill"
                    alt="User setting up software"
                    src="/img/OIG.jpg"
                    style="opacity: 0.7"
                    width="80"
                    height="80"
                  />
                  <h1 class="text-h3 ml-4">FDM Monster</h1>
                </div>
                <p class="text-subtitle-1 text-medium-emphasis">
                  Welcome! Let's set up your 3D printing farm management system. <br/>
                  Choose an option below.
                </p>
              </div>

              <!-- Two-column choice layout -->
              <v-row class="px-6 pb-6" align="start">
                <!-- Start Setup Option -->
                <v-col cols="12" md="6">
                  <div class="setup-option-box pa-8">
                    <div class="text-center mb-8">
                      <h2 class="text-h5 mb-2">Start Setup</h2>
                      <p class="text-body-2 text-medium-emphasis">
                        Configure your FDM Monster server step by step with the setup wizard.
                      </p>
                    </div>

                    <v-btn
                      color="primary"
                      size="x-large"
                      block
                      @click="stepper = 2"
                    >
                      <v-icon start>rocket_launch</v-icon>
                      START SETUP
                    </v-btn>
                  </div>
                </v-col>

                <!-- Import Backup Option -->
                <v-col cols="12" md="6">
                  <div class="setup-option-box pa-8" style="overflow: visible;">
                    <div class="text-center mb-6">
                      <h2 class="text-h5 mb-1">Import Backup</h2>
                      <p class="text-body-2 text-medium-emphasis">
                        A .yaml/.yml file is required
                      </p>
                    </div>

                    <div class="mb-4">
                      <v-file-input
                        v-model="yamlFile"
                        accept=".yaml,.yml"
                        label="Select YAML file"
                        variant="outlined"
                        prepend-icon=""
                        density="default"
                        hide-details
                        @update:model-value="validateYamlFile"
                      >
                        <template #prepend-inner>
                          <v-icon>attach_file</v-icon>
                        </template>
                      </v-file-input>
                    </div>

                    <v-progress-linear
                      v-if="validatingYaml"
                      indeterminate
                      color="primary"
                      class="mb-4"
                    />

                    <v-alert
                      v-if="yamlErrorMessage"
                      type="error"
                      variant="tonal"
                      density="compact"
                      class="mb-4"
                      closable
                    >
                      {{ yamlErrorMessage }}
                    </v-alert>

                    <div v-if="yamlImportSummary" class="mb-4">
                      <YamlImportSummary :summary="yamlImportSummary"/>
                    </div>

                    <v-btn
                      :disabled="!yamlImportSummary"
                      color="primary"
                      size="x-large"
                      block
                      class="mb-4"
                      @click="importYaml()"
                    >
                      <v-icon start>upload</v-icon>
                      IMPORT CONFIGURATION
                    </v-btn>

                    <div class="d-flex align-start" style="gap: 8px;">
                      <v-icon size="small" color="info">info</v-icon>
                      <div class="text-caption text-medium-emphasis" style="line-height: 1.4;">
                        This will skip the wizard and restore your configuration.
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>

              <!-- Help Section -->
              <div class="px-6 pb-6">
                <HelpBanner/>
              </div>
            </v-stepper-window-item>

            <v-stepper-window-item :value="2">
              <div class="setup-option-box ma-6 pa-8">
                <div class="d-flex flex-column align-center" style="max-width: 500px; margin: 0 auto;">
                  <h2 class="text-h5 mb-4 text-center">Login Configuration</h2>

                  <v-form v-model="formValid" class="w-100">
                <v-switch
                  v-model="formStep1.loginRequired"
                  label="Enable Login"
                  color="primary"
                  density="compact"
                  hide-details
                />

                <v-alert
                  :type="formStep1.loginRequired ? 'success' : 'warning'"
                  variant="tonal"
                  density="compact"
                  class="mt-2 mb-3"
                >
                  <div class="text-caption">
                    <v-icon size="x-small" class="mr-1">{{ formStep1.loginRequired ? 'check' : 'warning' }}</v-icon>
                    {{ formStep1.loginRequired ? 'Login is required for all users.' : 'No login required. Admin role assumed.' }}
                  </div>
                </v-alert>

                <v-alert
                  v-if="!formStep1.loginRequired"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-3"
                >
                  <div class="text-caption">
                    <v-icon size="x-small" class="mr-1">security</v-icon>
                    Server may be publicly exposed. Carefully evaluate <strong>Enable Login</strong>.
                  </div>
                </v-alert>

                <v-switch
                  v-model="formStep1.registration"
                  label="Enable Registration"
                  color="primary"
                  density="compact"
                  class="mt-3"
                  hide-details
                />

                <v-alert
                  :type="formStep1.registration ? 'info' : 'warning'"
                  variant="tonal"
                  density="compact"
                  class="mt-2 mb-4"
                >
                  <div class="text-caption">
                    <v-icon size="x-small" class="mr-1">{{ formStep1.registration ? 'check' : 'block' }}</v-icon>
                    {{ formStep1.registration ? 'New accounts can be registered with guest role.' : 'Only admin can create accounts.' }}
                  </div>
                </v-alert>

                  <v-divider class="my-6 w-100"/>

                  <h2 class="text-h5 mb-4 text-center">Admin Account</h2>

                  <v-text-field
                  v-model="formStep2.rootUsername"
                  :rules="[(v) => !!v || 'Username is required']"
                  label="Username"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                >
                  <template #prepend-inner>
                    <v-icon size="small">person</v-icon>
                  </template>
                </v-text-field>

                <v-text-field
                  v-model="formStep2.rootPassword"
                  type="password"
                  :rules="[
                    (v) => !!v || 'Password is required',
                    (v) =>
                      (!!v && v?.length >= 8) ||
                      'Password must be at least 8 characters'
                  ]"
                  label="Password"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                >
                  <template #prepend-inner>
                    <v-icon size="small">lock</v-icon>
                  </template>
                </v-text-field>

                <v-text-field
                  v-model="formStep2.rootPassword2"
                  type="password"
                  :rules="[
                    (v) => !!v || 'Please repeat password',
                    (v) => v === formStep2.rootPassword || 'Passwords do not match'
                  ]"
                  label="Repeat Password"
                  variant="outlined"
                  density="compact"
                  class="mb-4"
                >
                  <template #prepend-inner>
                    <v-icon size="small">lock</v-icon>
                  </template>
                </v-text-field>
              </v-form>

                  <v-card-actions class="px-0 mt-4">
                    <v-btn
                      variant="elevated"
                      @click="stepper = 1"
                    >
                      <v-icon start size="small">arrow_back</v-icon>
                      Back
                    </v-btn>
                    <v-spacer/>
                    <v-btn
                      :disabled="!formValid"
                      color="primary"
                      variant="elevated"
                      @click="submitWizard()"
                    >
                      <v-icon class="mr-2" size="small">mdi:mdi-check</v-icon>
                      Submit
                    </v-btn>
                  </v-card-actions>
                </div>
              </div>

              <!-- Help Section -->
              <div class="px-6 pb-6">
                <HelpBanner/>
              </div>
            </v-stepper-window-item>

            <v-stepper-window-item :value="3">
              <div class="setup-option-box ma-6 pa-6">
                <div class="d-flex flex-column align-center text-center">
                <v-icon
                  size="120"
                  color="success"
                  class="mb-4"
                >
                  check_circle
                </v-icon>
                <h2 class="text-h4 mb-2">Setup Completed!</h2>
                <p class="text-subtitle-1 text-medium-emphasis">
                  Your FDM Monster server is now configured and ready to use.
                </p>
              </div>

              <div class="d-flex justify-center mt-8">
                <v-btn
                  color="primary"
                  size="large"
                  @click="continueNext()"
                >
                  Continue to Login
                  <v-icon end>arrow_forward</v-icon>
                </v-btn>
              </div>
              </div>

              <!-- Help Section -->
              <div class="px-6 pb-6">
                <HelpBanner message="Need help?"/>
              </div>
            </v-stepper-window-item>
          </v-stepper-window>
        </v-stepper>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { load } from 'js-yaml'
import { FirstTimeSetupService } from '@/backend/first-time-setup.service'
import { useSnackbar } from '@/shared/snackbar.composable'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'
import HelpBanner from '@/components/Generic/HelpBanner.vue'
import YamlImportSummary, {
  type YamlImportSummary as YamlImportSummaryType
} from '@/components/Generic/YamlImportSummary.vue'

const router = useRouter()
const snackbar = useSnackbar()
const formValid = ref(false)
const authStore = useAuthStore()
const formStep1 = ref({
  loginRequired: true,
  registration: false
})
const formStep2 = ref({
  rootUsername: 'admin',
  rootPassword: '',
  rootPassword2: ''
})
const yamlFile = ref<File | null>(null)
const validatingYaml = ref(false)
const yamlImportSummary = ref<YamlImportSummaryType | null>(null)
const yamlErrorMessage = ref('')

const stepper = ref(1)

onMounted(async () => {
  await authStore.checkAuthenticationRequirements()

  if (authStore.wizardState?.wizardCompleted) {
    snackbar.info('Setup already completed.')
    if (authStore.loginRequired) {
      await router.push({ name: 'Login' })
    } else {
      await router.push({ name: 'Home' })
    }
  }
})

async function submitWizard() {
  if (!formValid.value) {
    snackbar.error('Please fill out all required fields.')
    return
  }

  const formValue = formStep1.value
  const form2Value = formStep2.value
  await FirstTimeSetupService.postFirstTimeSetup({
    loginRequired: formValue.loginRequired,
    registration: formValue.registration,
    rootUsername: form2Value.rootUsername,
    rootPassword: form2Value.rootPassword
  })
  snackbar.openInfoMessage({ title: 'Setup completed' })
  stepper.value = 3
}

async function continueNext() {
  await router.push({ name: 'Login' })
}

async function validateYamlFile() {
  // Clear previous state
  yamlImportSummary.value = null
  yamlErrorMessage.value = ''

  if (!yamlFile.value) {
    yamlErrorMessage.value = 'No file selected'
    yamlImportSummary.value = null
    return
  }

  validatingYaml.value = true

  try {
    const text = await yamlFile.value.text()
    const parsed = load(text) as any

    if (!parsed || typeof parsed !== 'object') {
      yamlErrorMessage.value = 'Invalid YAML file structure'
      yamlImportSummary.value = null
      return
    }

    yamlImportSummary.value = {
      version: parsed.version || 'Unknown',
      databaseType: parsed.databaseType || 'Unknown',
      exportedAt: parsed.exportedAt ? new Date(parsed.exportedAt).toLocaleString() : 'Unknown',
      printersCount: parsed.printers?.length || 0,
      floorsCount: parsed.floors?.length || 0,
      groupsCount: parsed.groups?.length || 0,
      hasSettings: !!parsed.settings,
      usersCount: parsed.users?.length || 0
    }
  } catch (error: any) {
    yamlErrorMessage.value = 'Failed to validate YAML file: ' + error.message
    yamlImportSummary.value = null
  } finally {
    validatingYaml.value = false
  }
}

async function importYaml() {
  if (!yamlFile.value) {
    snackbar.error('Please select a YAML file to import.')
    return
  }

  if (!(yamlFile.value instanceof File)) {
    snackbar.error('Invalid file selected. Please try again.')
    return
  }

  if (yamlFile.value.size === 0) {
    snackbar.error('The selected file is empty.')
    return
  }

  try {
    snackbar.openInfoMessage({
      title: 'Importing configuration...',
      subtitle: 'This may take a moment.'
    })

    await FirstTimeSetupService.postYamlImport(yamlFile.value)

    snackbar.openInfoMessage({
      title: 'Import successful!',
      subtitle: 'Your configuration has been restored.'
    })

    // Check auth requirements and redirect appropriately
    await authStore.checkAuthenticationRequirements()
    if (authStore.loginRequired) {
      await router.push({ name: 'Login' })
    } else {
      await router.push({ name: 'Home' })
    }
  } catch (error) {
    snackbar.error('Failed to import YAML configuration.')
  }
}
</script>
<style scoped>
.setup-option-box {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.grid-bg-img {
  position: fixed;
  height: 100vh;
  top: 50vh;
  width: 600%;
  left: -250%;
  filter: grayscale(100%);
}
</style>
