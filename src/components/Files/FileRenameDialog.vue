<template>
  <v-dialog
    v-model="isOpen"
    max-width="500"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">edit</v-icon>
        Rename File
        <v-spacer />
        <v-btn
          icon="close"
          variant="text"
          @click="closeDialog"
        />
      </v-card-title>

      <v-card-text>
        <div class="mb-4">
          <strong>Current name:</strong> {{ currentFileName }}
        </div>

        <v-text-field
          v-model="newName"
          label="New file name"
          variant="outlined"
          density="comfortable"
          autofocus
          :error-messages="errorMessage"
          @keyup.enter="handleRename"
        />

        <v-alert
          v-if="warningMessage"
          type="warning"
          variant="tonal"
          density="compact"
          class="mt-2"
        >
          {{ warningMessage }}
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
          :disabled="!isValid"
          @click="handleRename"
        >
          Rename
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { getFileName } from './file-management.utils'

interface Props {
  modelValue: boolean
  currentFilePath: string
  currentFileName: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'rename', newName: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const newName = ref('')
const errorMessage = ref('')
const warningMessage = ref('')

// Initialize with current filename when dialog opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    newName.value = props.currentFileName
    errorMessage.value = ''
    warningMessage.value = ''
  }
})

const isValid = computed(() => {
  if (!newName.value || newName.value.trim() === '') {
    errorMessage.value = 'File name cannot be empty'
    return false
  }

  if (newName.value === props.currentFileName) {
    errorMessage.value = 'New name must be different from current name'
    return false
  }

  // Check for invalid characters
  const invalidChars = /[<>:"|?*]/
  if (invalidChars.test(newName.value)) {
    errorMessage.value = 'File name contains invalid characters'
    return false
  }

  // Check for path separators (not allowed in filename)
  if (newName.value.includes('/') || newName.value.includes('\\')) {
    errorMessage.value = 'File name cannot contain path separators'
    return false
  }

  // Warn if extension changed
  const currentExt = props.currentFileName.split('.').pop()
  const newExt = newName.value.split('.').pop()
  if (currentExt !== newExt) {
    warningMessage.value = 'Warning: File extension has changed'
  } else {
    warningMessage.value = ''
  }

  errorMessage.value = ''
  return true
})

const handleRename = () => {
  if (isValid.value) {
    emit('rename', newName.value)
    closeDialog()
  }
}

const closeDialog = () => {
  isOpen.value = false
}
</script>
