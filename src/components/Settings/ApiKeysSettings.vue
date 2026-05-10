<template>
  <v-card>
    <v-card-text>
      <SettingSection
        title="API Keys"
        tooltip="Long-lived bearer credentials for external scripts, dashboards, and automations. Keys inherit your role and permissions."
        :usecols="false"
      >
        <v-alert color="info" variant="tonal" class="mb-4" density="compact">
          <div class="text-body-2">
            Use API keys instead of your password to grant external software access to FDM Monster. Send the key as
            <strong>Authorization: Bearer &lt;token&gt;</strong> on any request. Each key is shown
            <strong>once</strong> at creation — copy it then; it cannot be recovered later.
          </div>
        </v-alert>

        <div class="d-flex align-center mb-3">
          <v-text-field
            v-model="newKeyLabel"
            label="Label (e.g. 'home-dashboard')"
            density="compact"
            hide-details
            variant="outlined"
            maxlength="80"
            counter="80"
            style="max-width: 360px;"
            :disabled="isCreating"
            @keyup.enter="createKey"
          />
          <v-btn
            class="ml-2"
            color="primary"
            variant="elevated"
            prepend-icon="add"
            :disabled="!newKeyLabel.trim().length || isCreating"
            :loading="isCreating"
            @click="createKey"
          >
            Create API key
          </v-btn>
        </div>

        <v-alert v-if="errorMessage" color="error" variant="tonal" class="mb-3" density="compact">
          {{ errorMessage }}
        </v-alert>

        <div v-if="isLoading" class="d-flex align-center my-4">
          <v-progress-circular indeterminate size="24" width="3" class="mr-2" />
          <span>Loading API keys…</span>
        </div>

        <template v-else-if="keys.length">
          <div class="d-flex align-center mb-2">
            <span class="text-caption text-medium-emphasis">
              {{ activeKeyCount }} active{{ revokedKeyCount > 0 ? `, ${revokedKeyCount} revoked` : '' }}
            </span>
            <v-spacer />
            <v-checkbox
              v-if="revokedKeyCount > 0"
              v-model="showRevoked"
              :label="`Show revoked (${revokedKeyCount})`"
              density="compact"
              hide-details
            />
          </div>

          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left">Label</th>
                <th class="text-left">Prefix</th>
                <th class="text-left">Created</th>
                <th class="text-left">Last used</th>
                <th class="text-left">Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="key in visibleKeys" :key="key.id">
                <td>{{ key.label }}</td>
                <td style="font-family: monospace;">fdmm_pat_{{ key.prefix.slice(0, 6) }}…</td>
                <td>{{ formatDate(key.createdAt) }}</td>
                <td>{{ key.lastUsedAt ? formatDate(key.lastUsedAt) : '—' }}</td>
                <td>
                  <v-chip v-if="key.revokedAt" size="x-small" color="error" variant="tonal">Revoked</v-chip>
                  <v-chip v-else size="x-small" color="success" variant="tonal">Active</v-chip>
                </td>
                <td class="text-right">
                  <v-btn
                    v-if="!key.revokedAt"
                    size="small"
                    variant="text"
                    color="error"
                    prepend-icon="delete"
                    :loading="revokingId === key.id"
                    @click="confirmRevoke(key)"
                  >
                    Revoke
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>

          <v-alert v-if="!visibleKeys.length" color="info" variant="tonal" density="compact" class="text-center mt-3">
            All your keys are revoked. Toggle "Show revoked" above to view them.
          </v-alert>
        </template>

        <v-alert v-else color="warning" variant="tonal" density="compact" class="text-center">
          No API keys yet. Create one above to give an external script or dashboard programmatic access.
        </v-alert>
      </SettingSection>
    </v-card-text>

    <!-- One-time token reveal dialog -->
    <v-dialog v-model="showCreatedDialog" max-width="600" persistent>
      <v-card>
        <v-card-title>API key created</v-card-title>
        <v-card-text>
          <v-alert color="warning" variant="tonal" class="mb-4" density="compact">
            <strong>Copy this token now.</strong> It will not be shown again. If you lose it, revoke this key and
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

    <!-- Revoke confirmation -->
    <v-dialog v-model="showRevokeDialog" max-width="450">
      <v-card>
        <v-card-title>Revoke API key?</v-card-title>
        <v-card-text>
          Revoking <strong>{{ keyToRevoke?.label }}</strong> immediately invalidates the token. Any external software
          using it will start receiving 401 responses. This cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showRevokeDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="revokeKey">Revoke</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ApiKeyService } from '@/backend'
import SettingSection from '@/components/Settings/Shared/SettingSection.vue'
import type { ApiKeyDto } from '@/models/api-key/api-key.dto'

const keys = ref<ApiKeyDto[]>([])
const newKeyLabel = ref('')
const isLoading = ref(true)
const isCreating = ref(false)
const revokingId = ref<number | null>(null)
const errorMessage = ref<string | null>(null)
const showCreatedDialog = ref(false)
const createdToken = ref('')
const copied = ref(false)
const showRevokeDialog = ref(false)
const keyToRevoke = ref<ApiKeyDto | null>(null)
const showRevoked = ref(false)

// Active rows always show; revoked rows only when the toggle is on. Revoked
// entries are kept around for the audit trail (operators can correlate
// `fdmm_pat_<prefix>` hits in request logs back to the key that minted them).
const activeKeyCount = computed(() => keys.value.filter((k) => !k.revokedAt).length)
const revokedKeyCount = computed(() => keys.value.filter((k) => !!k.revokedAt).length)
const visibleKeys = computed(() =>
  keys.value.filter((k) => !k.revokedAt || showRevoked.value),
)

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
  const label = newKeyLabel.value.trim()
  if (!label.length) return
  isCreating.value = true
  errorMessage.value = null
  try {
    const created = await ApiKeyService.create(label)
    createdToken.value = created.token
    showCreatedDialog.value = true
    newKeyLabel.value = ''
    await loadKeys()
  } catch (error) {
    errorMessage.value = (error as Error)?.message ?? 'Failed to create API key'
  } finally {
    isCreating.value = false
  }
}

function confirmRevoke(key: ApiKeyDto) {
  keyToRevoke.value = key
  showRevokeDialog.value = true
}

async function revokeKey() {
  const key = keyToRevoke.value
  showRevokeDialog.value = false
  if (!key) return
  revokingId.value = key.id
  errorMessage.value = null
  try {
    await ApiKeyService.revoke(key.id)
    await loadKeys()
  } catch (error) {
    errorMessage.value = (error as Error)?.message ?? 'Failed to revoke API key'
  } finally {
    revokingId.value = null
    keyToRevoke.value = null
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
    console.error('Failed to copy token to clipboard:', error)
  }
}

function dismissCreatedDialog() {
  showCreatedDialog.value = false
  // Wipe the token from memory once the user dismisses the dialog — there's
  // no recovery path on the server, so we shouldn't keep it lying around in
  // component state either.
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

onMounted(loadKeys)
</script>
