<template>
  <v-card>
    <v-card-text>
      <SettingSection
        title="API Keys"
        tooltip="Long-lived bearer credentials for external scripts, dashboards, and automations. Each key carries its own role assignment — keys are not user impersonation."
        :usecols="false"
      >
        <v-alert v-if="!isAdmin && profileLoaded" color="warning" variant="tonal" density="compact" class="mb-2">
          <div class="text-body-2">
            <strong>Admin role required.</strong> Only users with the ADMIN role can create or manage API keys.
          </div>
        </v-alert>

        <template v-else-if="isAdmin">
          <v-alert color="info" variant="tonal" class="mb-4" density="compact">
            <div class="text-body-2">
              Send the token as <strong>Authorization: Bearer &lt;token&gt;</strong> on any request. Each key is shown
              <strong>once</strong> at creation — copy it then; it cannot be recovered later. Keys are scoped by the
              roles you assign at creation.
            </div>
          </v-alert>

          <v-alert
            v-if="!loginRequiredEnabled && loginRequiredChecked"
            color="warning"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            <div class="text-body-2">
              <strong>Login is currently disabled</strong> in Server Protection settings. API keys are an authenticated
              feature and cannot be created until login is enabled.
              <router-link to="/settings/server-protection" class="text-primary">Go to Server Protection →</router-link>
            </div>
          </v-alert>

          <v-divider class="mb-4" />

          <div class="text-subtitle-2 mb-2">Create new API key</div>

          <v-row class="mb-2" no-gutters>
            <v-col cols="12" md="5" class="pr-md-2 mb-2 mb-md-0">
              <v-text-field
                v-model="newKeyLabel"
                label="Label (e.g. 'home-dashboard')"
                density="compact"
                variant="outlined"
                hide-details
                maxlength="80"
                counter="80"
                :disabled="isCreating || !loginRequiredEnabled"
              />
            </v-col>
            <v-col cols="12" md="5" class="pr-md-2 mb-2 mb-md-0">
              <v-select
                v-model="newKeyRoleIds"
                :items="availableRoles"
                item-title="name"
                item-value="id"
                label="Roles"
                multiple
                chips
                density="compact"
                variant="outlined"
                hide-details
                :disabled="isCreating || !loginRequiredEnabled"
              />
            </v-col>
            <v-col cols="12" md="2" class="d-flex align-center">
              <v-btn
                color="primary"
                variant="elevated"
                prepend-icon="add"
                :disabled="!canCreate"
                :loading="isCreating"
                block
                @click="createKey"
              >
                Create
              </v-btn>
            </v-col>
          </v-row>

          <v-alert v-if="errorMessage" color="error" variant="tonal" class="mb-3" density="compact">
            {{ errorMessage }}
          </v-alert>

          <v-divider class="my-4" />

          <div class="text-subtitle-2 mb-2">Existing keys</div>

          <div v-if="isLoading" class="d-flex align-center my-4">
            <v-progress-circular indeterminate size="24" width="3" class="mr-2" />
            <span>Loading API keys…</span>
          </div>

          <v-table v-else-if="keys.length" density="compact">
            <thead>
              <tr>
                <th scope="col" class="text-left">Label</th>
                <th scope="col" class="text-left">Prefix</th>
                <th scope="col" class="text-left">Roles</th>
                <th scope="col" class="text-left">Created</th>
                <th scope="col" class="text-left">Last used</th>
                <th scope="col" class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="key in keys" :key="key.id">
                <td>{{ key.label }}</td>
                <td style="font-family: monospace;">fdmm_pat_{{ key.prefix.slice(0, 6) }}…</td>
                <td>
                  <v-chip
                    v-for="role in key.roles"
                    :key="role"
                    size="x-small"
                    variant="tonal"
                    color="primary"
                    class="mr-1"
                  >
                    {{ role }}
                  </v-chip>
                </td>
                <td>{{ formatDate(key.createdAt) }}</td>
                <td>{{ key.lastUsedAt ? formatDate(key.lastUsedAt) : '—' }}</td>
                <td class="text-right">
                  <v-btn
                    size="small"
                    variant="text"
                    color="error"
                    prepend-icon="delete"
                    :loading="deletingId === key.id"
                    @click="confirmDelete(key)"
                  >
                    Delete
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>

          <v-alert v-else color="warning" variant="tonal" density="compact" class="text-center">
            No API keys yet. Create one above to give an external script or dashboard programmatic access.
          </v-alert>
        </template>
      </SettingSection>
    </v-card-text>

    <!-- One-time token reveal -->
    <v-dialog v-model="showCreatedDialog" max-width="640" persistent>
      <v-card>
        <v-card-title>API key created</v-card-title>
        <v-card-text>
          <v-alert color="warning" variant="tonal" class="mb-4" density="compact">
            <strong>Copy this token now.</strong> It will not be shown again. If you lose it, delete this key and
            create a new one.
          </v-alert>

          <div class="d-flex align-center">
            <v-text-field
              v-model="createdToken"
              readonly
              variant="outlined"
              density="compact"
              hide-details
              style="font-family: monospace;"
            />
            <v-btn
              icon
              variant="tonal"
              color="primary"
              class="ml-2"
              :title="copied ? 'Copied!' : 'Copy to clipboard'"
              @click="copyToken"
            >
              <v-icon>{{ copied ? 'check' : 'content_copy' }}</v-icon>
            </v-btn>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="elevated" @click="dismissCreatedDialog">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirmation -->
    <v-dialog v-model="showDeleteDialog" max-width="450">
      <v-card>
        <v-card-title>Delete API key?</v-card-title>
        <v-card-text>
          Deleting <strong>{{ keyToDelete?.label }}</strong> immediately invalidates the token. Any external software
          using it will start receiving 401 responses. This cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteKey">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ApiKeyService, SettingsService, UserService } from '@/backend'
import SettingSection from '@/components/Settings/Shared/SettingSection.vue'
import type { ApiKeyDto } from '@/models/api-key/api-key.dto'
import type { Role } from '@/models/user.model'
import { useProfileStore } from '@/store/profile.store'

const profileStore = useProfileStore()

const keys = ref<ApiKeyDto[]>([])
const availableRoles = ref<Role[]>([])
const newKeyLabel = ref('')
const newKeyRoleIds = ref<number[]>([])
const isLoading = ref(true)
const isCreating = ref(false)
const deletingId = ref<number | null>(null)
const errorMessage = ref<string | null>(null)
const showCreatedDialog = ref(false)
const createdToken = ref('')
const copied = ref(false)
const showDeleteDialog = ref(false)
const keyToDelete = ref<ApiKeyDto | null>(null)
const profileLoaded = ref(false)
const loginRequiredEnabled = ref(false)
const loginRequiredChecked = ref(false)

const isAdmin = computed(() => profileStore.isAdmin)

const canCreate = computed(
  () =>
    !!newKeyLabel.value.trim().length &&
    newKeyRoleIds.value.length > 0 &&
    !isCreating.value &&
    loginRequiredEnabled.value,
)

async function loadProfile() {
  try {
    await profileStore.getProfile()
  } catch (error) {
    console.error('Failed to load profile:', error)
  } finally {
    profileLoaded.value = true
  }
}

async function loadLoginRequired() {
  try {
    const settings = await SettingsService.getSettings()
    loginRequiredEnabled.value = settings.server.loginRequired
  } catch (error) {
    console.error('Failed to load loginRequired setting:', error)
  } finally {
    loginRequiredChecked.value = true
  }
}

async function loadRoles() {
  try {
    availableRoles.value = await UserService.listRoles()
    // Default selection — the user's current roles. They can untick to narrow.
    newKeyRoleIds.value = availableRoles.value
      .filter((r) => profileStore.roles.includes(r.name))
      .map((r) => r.id)
  } catch (error) {
    console.error('Failed to load roles:', error)
  }
}

async function loadKeys() {
  isLoading.value = true
  errorMessage.value = null
  try {
    keys.value = await ApiKeyService.list()
  } catch (error) {
    errorMessage.value = (error as Error)?.message ?? 'Failed to load API keys'
  } finally {
    isLoading.value = false
  }
}

async function createKey() {
  if (!canCreate.value) return
  isCreating.value = true
  errorMessage.value = null
  try {
    const created = await ApiKeyService.create(newKeyLabel.value.trim(), newKeyRoleIds.value)
    createdToken.value = created.token
    showCreatedDialog.value = true
    newKeyLabel.value = ''
    // Reset role selection to defaults
    newKeyRoleIds.value = availableRoles.value
      .filter((r) => profileStore.roles.includes(r.name))
      .map((r) => r.id)
    await loadKeys()
  } catch (error) {
    errorMessage.value = (error as Error)?.message ?? 'Failed to create API key'
  } finally {
    isCreating.value = false
  }
}

function confirmDelete(key: ApiKeyDto) {
  keyToDelete.value = key
  showDeleteDialog.value = true
}

async function deleteKey() {
  const key = keyToDelete.value
  showDeleteDialog.value = false
  if (!key) return
  deletingId.value = key.id
  errorMessage.value = null
  try {
    await ApiKeyService.deleteKey(key.id)
    await loadKeys()
  } catch (error) {
    errorMessage.value = (error as Error)?.message ?? 'Failed to delete API key'
  } finally {
    deletingId.value = null
    keyToDelete.value = null
  }
}

async function copyToken() {
  if (!createdToken.value) return
  try {
    await navigator.clipboard.writeText(createdToken.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy token:', error)
  }
}

function dismissCreatedDialog() {
  showCreatedDialog.value = false
  // Wipe the cleartext token from component state; no recovery path on the
  // server, so we shouldn't keep it in memory either.
  createdToken.value = ''
  copied.value = false
}

function formatDate(value: string | Date | null) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return String(value)
  }
}

onMounted(async () => {
  await loadProfile()
  await loadLoginRequired()
  if (isAdmin.value && loginRequiredEnabled.value) {
    await Promise.all([loadRoles(), loadKeys()])
  } else {
    isLoading.value = false
  }
})
</script>
