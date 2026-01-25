<template>
  <v-dialog
    v-model="isOpen"
    max-width="500"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">create_new_folder</v-icon>
        Create New Folder
        <v-spacer />
        <v-btn
          icon="close"
          variant="text"
          @click="closeDialog"
        />
      </v-card-title>

      <v-card-text>
        <div v-if="parentPath" class="mb-4">
          <strong>Location:</strong> {{ parentPath || 'Root' }}
        </div>

        <v-text-field
          v-model="folderName"
          label="Folder name"
          variant="outlined"
          density="comfortable"
          placeholder="Enter folder name"
          :error-messages="errorMessage"
          @keyup.enter="handleCreate"
          autofocus
        >
          <template #append-inner>
            <v-btn
              icon="clear"
              size="x-small"
              variant="text"
              @click="folderName = ''"
            />
          </template>
        </v-text-field>

        <v-alert
          v-if="folderName && previewPath"
          type="info"
          variant="tonal"
          density="compact"
          class="mt-2"
        >
          <strong>New folder path:</strong> {{ previewPath }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="grey"
          variant="text"
          @click="closeDialog"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :disabled="!canCreate"
          @click="handleCreate"
        >
          Create Folder
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { validateFileName } from './file-management.utils'

interface Props {
  modelValue: boolean
  parentPath: string  // Path where the new folder will be created (empty string for root)
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'create', folderPath: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const folderName = ref('')
const errorMessage = ref('')

// Initialize when dialog opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    folderName.value = ''
    errorMessage.value = ''
  }
})

const previewPath = computed(() => {
  if (!folderName.value) return ''

  return props.parentPath
    ? `${props.parentPath}/${folderName.value}`
    : folderName.value
})

const canCreate = computed(() => {
  const name = folderName.value.trim()

  // Must have a name
  if (!name) {
    errorMessage.value = 'Folder name cannot be empty'
    return false
  }

  // Validate folder name (no path separators, no invalid chars)
  if (!validateFileName(name)) {
    errorMessage.value = 'Invalid folder name (no special characters or path separators)'
    return false
  }

  errorMessage.value = ''
  return true
})

const handleCreate = () => {
  if (canCreate.value) {
    emit('create', previewPath.value)
    closeDialog()
  }
}

const closeDialog = () => {
  isOpen.value = false
}
</script>
