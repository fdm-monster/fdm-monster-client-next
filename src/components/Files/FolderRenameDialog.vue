<template>
  <v-dialog
    v-model="isOpen"
    max-width="500"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">edit</v-icon>
        Rename Folder
        <v-spacer />
        <v-btn
          icon="close"
          variant="text"
          @click="closeDialog"
        />
      </v-card-title>

      <v-card-text>
        <div class="mb-4">
          <strong>Current folder:</strong> {{ currentFolderName }}
        </div>

        <v-text-field
          v-model="newFolderName"
          label="New folder name"
          variant="outlined"
          density="comfortable"
          placeholder="Enter new folder name"
          :error-messages="errorMessage"
          @keyup.enter="handleRename"
          autofocus
        >
          <template #append-inner>
            <v-btn
              icon="clear"
              size="x-small"
              variant="text"
              @click="newFolderName = ''"
            />
          </template>
        </v-text-field>

        <v-alert
          v-if="fileCount > 0"
          type="info"
          variant="tonal"
          density="compact"
          class="mt-2"
        >
          This will update paths for {{ fileCount }} file(s)
        </v-alert>

        <v-alert
          v-if="newFolderName && previewPath"
          type="info"
          variant="tonal"
          density="compact"
          class="mt-2"
        >
          <strong>New path:</strong> {{ previewPath }}
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
          :disabled="!canRename"
          @click="handleRename"
        >
          Rename Folder
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { validateFileName, getParentPath } from './file-management.utils'

interface Props {
  modelValue: boolean
  currentFolderPath: string
  currentFolderName: string
  fileCount: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'rename', newFolderName: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const newFolderName = ref('')
const errorMessage = ref('')

// Initialize when dialog opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    newFolderName.value = props.currentFolderName
    errorMessage.value = ''
  }
})

const previewPath = computed(() => {
  if (!newFolderName.value) return ''

  const parentPath = getParentPath(props.currentFolderPath)
  return parentPath ? `${parentPath}/${newFolderName.value}` : newFolderName.value
})

const canRename = computed(() => {
  const name = newFolderName.value.trim()

  // Must have a name
  if (!name) {
    errorMessage.value = 'Folder name cannot be empty'
    return false
  }

  // Can't be same as current name
  if (name === props.currentFolderName) {
    errorMessage.value = 'Please enter a different name'
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

const handleRename = () => {
  if (canRename.value) {
    emit('rename', newFolderName.value.trim())
    closeDialog()
  }
}

const closeDialog = () => {
  isOpen.value = false
}
</script>
