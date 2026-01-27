<template>
  <v-dialog
    v-model="localShow"
    max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon
          start
          color="primary"
        >
          create_new_folder
        </v-icon>
        Create New Folder
      </v-card-title>

      <v-card-text>
        <v-text-field
          v-model="folderPath"
          label="Folder Path"
          placeholder="e.g., projects/new-folder"
          variant="outlined"
          density="comfortable"
          autofocus
          :error-messages="errorMessage"
          hint="Use forward slashes (/) for nested folders. Leave empty to create in root."
          persistent-hint
          @keyup.enter="createFolder"
        >
          <template #prepend-inner>
            <v-icon>folder</v-icon>
          </template>
        </v-text-field>

        <v-alert
          v-if="currentPath"
          type="info"
          variant="tonal"
          density="compact"
          class="mt-4"
        >
          Creating in: <strong>{{ currentPath || 'Root' }}</strong>
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="cancel"
          :disabled="loading"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="createFolder"
          :loading="loading"
          :disabled="!folderPath.trim()"
        >
          <v-icon start>add</v-icon>
          Create Folder
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
  show: boolean;
  currentPath?: string;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'create', path: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  currentPath: ''
});

const emit = defineEmits<Emits>();

const folderPath = ref('');
const errorMessage = ref('');
const loading = ref(false);

const localShow = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
});

watch(() => props.show, (newVal) => {
  if (newVal) {
    // Reset state when dialog opens
    folderPath.value = '';
    errorMessage.value = '';
    loading.value = false;
  }
});

function validateFolderPath(path: string): boolean {
  errorMessage.value = '';

  const trimmed = path.trim();
  if (!trimmed) {
    errorMessage.value = 'Folder path cannot be empty';
    return false;
  }

  // Check for invalid characters
  if (/[<>:"|?*\\]/.test(trimmed)) {
    errorMessage.value = 'Path contains invalid characters';
    return false;
  }

  // Check for double slashes
  if (trimmed.includes('//')) {
    errorMessage.value = 'Path cannot contain double slashes';
    return false;
  }

  // Check for leading/trailing slashes
  if (trimmed.startsWith('/') || trimmed.endsWith('/')) {
    errorMessage.value = 'Path cannot start or end with a slash';
    return false;
  }

  return true;
}

function createFolder() {
  if (!validateFolderPath(folderPath.value)) {
    return;
  }

  const fullPath = props.currentPath
    ? `${props.currentPath}/${folderPath.value.trim()}`
    : folderPath.value.trim();

  emit('create', fullPath);
}

function cancel() {
  emit('update:show', false);
}
</script>

<style scoped>
/* No custom styles needed */
</style>
