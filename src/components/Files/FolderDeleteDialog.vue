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
          color="error"
        >
          delete_forever
        </v-icon>
        Delete Folder
      </v-card-title>

      <v-card-text>
        <v-alert
          type="warning"
          variant="tonal"
          prominent
          class="mb-4"
        >
          <div class="text-h6 mb-2">Warning: This action cannot be undone</div>
          <div>
            This will permanently delete the folder and all its contents.
          </div>
        </v-alert>

        <div class="mb-4">
          <div class="text-subtitle-2 text-medium-emphasis mb-1">Folder to delete:</div>
          <div class="text-h6 font-weight-bold">{{ folderPath || 'Root' }}</div>
        </div>

        <v-card
          variant="outlined"
          class="mb-4"
        >
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon
                color="primary"
                class="mr-2"
              >
                folder
              </v-icon>
              <div>
                <div class="text-body-2 text-medium-emphasis">Folders</div>
                <div class="text-h6">{{ folderCount }}</div>
              </div>
              <v-spacer />
              <v-divider
                vertical
                class="mx-4"
              />
              <v-icon
                color="primary"
                class="mr-2"
              >
                insert_drive_file
              </v-icon>
              <div>
                <div class="text-body-2 text-medium-emphasis">Files</div>
                <div class="text-h6">{{ fileCount }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-text-field
          v-model="confirmText"
          label="Type 'DELETE' to confirm"
          variant="outlined"
          density="comfortable"
          :error-messages="errorMessage"
          @keyup.enter="deleteFolder"
        />
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
          color="error"
          variant="elevated"
          @click="deleteFolder"
          :loading="loading"
          :disabled="confirmText !== 'DELETE'"
        >
          <v-icon start>delete</v-icon>
          Delete Folder
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
  show: boolean;
  folderPath: string;
  fileCount: number;
  folderCount: number;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'delete'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const confirmText = ref('');
const errorMessage = ref('');
const loading = ref(false);

const localShow = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
});

watch(() => props.show, (newVal) => {
  if (newVal) {
    // Reset state when dialog opens
    confirmText.value = '';
    errorMessage.value = '';
    loading.value = false;
  }
});

function deleteFolder() {
  if (confirmText.value !== 'DELETE') {
    errorMessage.value = "Please type 'DELETE' to confirm";
    return;
  }

  emit('delete');
}

function cancel() {
  emit('update:show', false);
}
</script>

<style scoped>
/* No custom styles needed */
</style>
