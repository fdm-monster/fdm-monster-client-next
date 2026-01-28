<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="800"
  >
    <v-card v-if="file">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">description</v-icon>
        File Details
        <v-spacer />
        <v-btn
          icon="close"
          variant="text"
          @click="$emit('update:modelValue', false)"
        />
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <h3 class="text-h6 mb-3">File Information</h3>
            <div class="mb-2">
              <strong>Name:</strong>
              {{ file.metadata?._originalFileName || file.fileName }}
            </div>
            <div class="mb-2">
              <strong>Format:</strong>
              {{ file.fileFormat.toUpperCase() }}
            </div>
            <div class="mb-2">
              <strong>Size:</strong>
              {{ formatFileSize(file.fileSize) }}
            </div>
            <div class="mb-2">
              <strong>Hash:</strong> <code>{{ file.fileHash }}</code>
            </div>
            <div class="mb-2">
              <strong>Storage ID:</strong>
              <code>{{ file.fileStorageId }}</code>
            </div>
            <div class="mb-2">
              <strong>Created:</strong>
              {{ formatDate(file.createdAt) }}
            </div>
          </v-col>

          <v-col
            cols="12"
            md="6"
          >
            <h3 class="text-h6 mb-3">Print Metadata</h3>
            <div v-if="file.metadata">
              <div
                v-if="file.metadata.gcodePrintTimeSeconds"
                class="mb-2"
              >
                <strong>Print Time:</strong>
                {{ formatDuration(file.metadata.gcodePrintTimeSeconds) }}
              </div>
              <div
                v-if="file.metadata.filamentUsedGrams"
                class="mb-2"
              >
                <strong>Filament:</strong>
                {{ file.metadata.filamentUsedGrams.toFixed(1) }}g
              </div>
              <div
                v-if="file.metadata.nozzleDiameterMm"
                class="mb-2"
              >
                <strong>Nozzle Diameter:</strong>
                {{ file.metadata.nozzleDiameterMm }}mm
              </div>
              <div
                v-if="file.metadata.layerHeight"
                class="mb-2"
              >
                <strong>Layer Height:</strong>
                {{ file.metadata.layerHeight }}mm
              </div>
              <div
                v-if="file.metadata.totalLayers"
                class="mb-2"
              >
                <strong>Total Layers:</strong>
                {{ file.metadata.totalLayers }}
              </div>
            </div>
            <div
              v-else
              class="text-medium-emphasis"
            >
              No metadata available
            </div>
          </v-col>

          <v-col
            v-if="file.thumbnails?.length > 0"
            cols="12"
          >
            <h3 class="text-h6 mb-3">
              Thumbnails ({{ file.thumbnails.length }})
            </h3>
            <div class="d-flex flex-wrap ga-2">
              <v-img
                v-for="(thumb, i) in file.thumbnails"
                :key="i"
                :src="getThumbnailUrl(file.fileStorageId, thumb.index)"
                width="150"
                height="150"
                cover
                class="rounded"
              />
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { FileMetadata } from '@/backend/file-storage.service'
import { FileStorageService } from '@/backend/file-storage.service'
import { formatFileSize } from '@/utils/file-size.util'
import { formatDate, formatDuration } from '@/utils/date-time.utils'

interface Props {
  modelValue: boolean
  file: FileMetadata | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

defineProps<Props>()
defineEmits<Emits>()

const thumbnailCache = ref<Map<string, string>>(new Map())

const getThumbnailUrl = (fileStorageId: string, index: number = 0): string => {
  const cacheKey = `${fileStorageId}-${index}`
  if (thumbnailCache.value.has(cacheKey)) {
    return thumbnailCache.value.get(cacheKey)!
  }
  FileStorageService.getThumbnailBase64(fileStorageId, index)
    .then((base64) => {
      thumbnailCache.value.set(cacheKey, base64)
    })
    .catch(() => {})
  return ''
}
</script>