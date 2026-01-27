<template>
  <v-dialog
    v-model="isOpen"
    max-width="600"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">drive_file_move</v-icon>
        Move File
        <v-spacer />
        <v-btn
          icon="close"
          variant="text"
          @click="closeDialog"
        />
      </v-card-title>

      <v-card-text>
        <div class="mb-4">
          <strong>File:</strong> {{ currentFileName }}
        </div>
        <!-- edited by claude on 2026.01.24.18.54 - use currentFileName prop directly -->

        <v-tabs
          v-model="activeTab"
          class="mb-4"
        >
          <v-tab value="path">Enter Path</v-tab>
          <v-tab value="select">Select Folder</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <!-- Manual Path Entry Tab -->
          <v-window-item value="path">
            <v-text-field
              v-model="destinationPath"
              label="Destination path"
              placeholder="e.g. projects/prints"
              variant="outlined"
              density="comfortable"
              hint="Enter the destination folder path (without filename)"
              persistent-hint
              :error-messages="pathErrorMessage"
              @keyup.enter="handleMove"
            >
              <template #append-inner>
                <v-btn
                  icon="clear"
                  size="x-small"
                  variant="text"
                  @click="destinationPath = ''"
                />
              </template>
            </v-text-field>

            <v-alert
              v-if="destinationPath"
              type="info"
              variant="tonal"
              density="compact"
              class="mt-2"
            >
              <strong>New path:</strong> {{ previewPath }}
            </v-alert>
          </v-window-item>

          <!-- Folder Selection Tab -->
          <v-window-item value="select">
            <v-card
              variant="outlined"
              class="folder-list"
            >
              <v-list density="compact">
                <v-list-item
                  :active="selectedFolder === ''"
                  @click="selectedFolder = ''"
                >
                  <template #prepend>
                    <v-icon>home</v-icon>
                  </template>
                  <v-list-item-title>Root Folder</v-list-item-title>
                </v-list-item>

                <v-list-item
                  v-for="folder in availableFolders"
                  :key="folder"
                  :active="selectedFolder === folder"
                  @click="selectedFolder = folder"
                >
                  <template #prepend>
                    <v-icon>folder</v-icon>
                  </template>
                  <v-list-item-title>{{ folder }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>

            <v-alert
              v-if="selectedFolder !== null"
              type="info"
              variant="tonal"
              density="compact"
              class="mt-2"
            >
              <strong>New path:</strong> {{ previewPathFromSelection }}
            </v-alert>
          </v-window-item>
        </v-window>
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
          :disabled="!canMove"
          @click="handleMove"
        >
          Move File
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
// edited by claude on 2026.01.24.18.52
import { ref, computed, watch } from 'vue'
import { validatePath } from './file-management.utils'

interface Props {
  modelValue: boolean
  currentFolderPath: string  // Current folder path from metadata._path
  currentFileName: string    // Current filename
  availableFolders: string[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'move', newFolderPath: string): void  // Emit just the folder path
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const activeTab = ref<'path' | 'select'>('select')
const destinationPath = ref('')
const selectedFolder = ref<string>('') // edited by claude on 2026.01.24.19.12 - changed from string | null to string
const pathErrorMessage = ref('')

// Initialize when dialog opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    destinationPath.value = props.currentFolderPath
    selectedFolder.value = props.currentFolderPath
    activeTab.value = 'select'
    pathErrorMessage.value = ''
  }
})

const previewPath = computed(() => {
  if (!destinationPath.value) {
    return props.currentFileName
  }
  return `${destinationPath.value}/${props.currentFileName}`
})

const previewPathFromSelection = computed(() => {
  if (selectedFolder.value === '') {
    return props.currentFileName
  }
  return `${selectedFolder.value}/${props.currentFileName}`
})

const finalPath = computed(() => {
  // edited by claude on 2026.01.24.19.13
  if (activeTab.value === 'path') {
    return destinationPath.value
  } else {
    return selectedFolder.value
  }
  // End of Claude's edit
})

const canMove = computed(() => {
  const newPath = finalPath.value

  // Can't move to same location
  if (newPath === props.currentFolderPath) {
    pathErrorMessage.value = 'File is already in this location'
    return false
  }

  // Validate path
  if (!validatePath(newPath)) {
    pathErrorMessage.value = 'Invalid destination path'
    return false
  }

  pathErrorMessage.value = ''
  return true
})

const handleMove = () => {
  if (canMove.value) {
    emit('move', finalPath.value)
    closeDialog()
  }
}
// End of Claude's edit

const closeDialog = () => {
  isOpen.value = false
}
</script>

<style scoped>
.folder-list {
  max-height: 300px;
  overflow-y: auto;
}
</style>
