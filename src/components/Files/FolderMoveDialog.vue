<template>
  <v-dialog
    v-model="isOpen"
    max-width="600"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">drive_file_move</v-icon>
        Move Folder
        <v-spacer />
        <v-btn
          icon="close"
          variant="text"
          @click="closeDialog"
        />
      </v-card-title>

      <v-card-text>
        <div class="mb-4">
          <strong>Folder:</strong> {{ folderPath }}
        </div>

        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          Moving this folder will update paths for {{ fileCount }} file(s)
        </v-alert>

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
              placeholder="e.g. projects or leave empty for root"
              variant="outlined"
              density="comfortable"
              hint="Enter the destination folder path (or leave empty for root)"
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
                  :disabled="isCircularMove(folder)"
                  @click="selectedFolder = folder"
                >
                  <template #prepend>
                    <v-icon>folder</v-icon>
                  </template>
                  <v-list-item-title>{{ folder }}</v-list-item-title>
                  <v-list-item-subtitle v-if="isCircularMove(folder)">
                    Cannot move folder into itself
                  </v-list-item-subtitle>
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
          Move Folder ({{ fileCount }} files)
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { validatePath, getParentPath } from './file-management.utils'

interface Props {
  modelValue: boolean
  folderPath: string
  fileCount: number
  availableFolders: string[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'move', newPath: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const activeTab = ref<'path' | 'select'>('select')
const destinationPath = ref('')
const selectedFolder = ref<string | null>('')
const pathErrorMessage = ref('')

// Initialize when dialog opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    const currentParent = getParentPath(props.folderPath)
    destinationPath.value = currentParent
    selectedFolder.value = currentParent
    activeTab.value = 'select'
    pathErrorMessage.value = ''
  }
})

// Get the folder name (last segment of path)
const folderName = computed(() => {
  const segments = props.folderPath.split('/')
  return segments[segments.length - 1]
})

const previewPath = computed(() => {
  if (!destinationPath.value) {
    return folderName.value
  }
  return `${destinationPath.value}/${folderName.value}`
})

const previewPathFromSelection = computed(() => {
  if (selectedFolder.value === '') {
    return folderName.value
  }
  return `${selectedFolder.value}/${folderName.value}`
})

const finalPath = computed(() => {
  if (activeTab.value === 'path') {
    return destinationPath.value ? `${destinationPath.value}/${folderName.value}` : folderName.value
  } else {
    return selectedFolder.value ? `${selectedFolder.value}/${folderName.value}` : folderName.value
  }
})

// Check if moving to a folder would create a circular reference
const isCircularMove = (targetFolder: string): boolean => {
  // Can't move a folder into itself or into one of its subfolders
  return targetFolder === props.folderPath || targetFolder.startsWith(`${props.folderPath}/`)
}

const canMove = computed(() => {
  const path = finalPath.value

  // Can't move to same location
  if (path === props.folderPath) {
    pathErrorMessage.value = 'Folder is already in this location'
    return false
  }

  // Check for circular move
  if (isCircularMove(path.substring(0, path.lastIndexOf('/')))) {
    pathErrorMessage.value = 'Cannot move folder into itself or its subfolders'
    return false
  }

  // Validate path
  if (!validatePath(path)) {
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
