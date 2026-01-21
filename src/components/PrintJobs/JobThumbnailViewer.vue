<template>
  <v-dialog v-model="isOpen" max-width="900px" @update:model-value="handleDialogClose">
    <v-card class="thumbnail-viewer-card">
      <v-card-title class="d-flex align-center bg-primary text-on-primary pa-3">
        <v-icon class="mr-2">image</v-icon>
        <span class="text-subtitle-1">Job Thumbnail</span>
        <v-spacer />
        <v-chip
          v-if="thumbnails.length > 1"
          size="small"
          variant="flat"
          color="primary-darken-1"
          class="mr-2"
        >
          {{ currentIndex + 1 }} / {{ thumbnails.length }}
        </v-chip>
        <v-btn icon variant="text" @click="close" color="on-primary" size="small">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-0 position-relative">
        <div v-if="loading" class="thumbnail-loading-container">
          <v-progress-circular indeterminate size="64" color="primary" />
        </div>

        <div v-else-if="thumbnails.length === 0" class="thumbnail-empty-container">
          <v-icon size="64" color="grey">image_not_supported</v-icon>
          <p class="text-body-1 text-medium-emphasis mt-3">No thumbnails available</p>
        </div>

        <div v-else class="thumbnail-image-container">
          <img
            :src="currentThumbnailUrl"
            :alt="`Thumbnail ${currentIndex + 1}`"
            class="thumbnail-main-image"
          />

          <!-- Navigation Arrows -->
          <v-btn
            v-if="thumbnails.length > 1"
            icon
            size="large"
            class="nav-arrow nav-arrow-left"
            color="white"
            elevation="4"
            @click="previousThumbnail"
            :disabled="currentIndex === 0"
          >
            <v-icon size="large">chevron_left</v-icon>
          </v-btn>

          <v-btn
            v-if="thumbnails.length > 1"
            icon
            size="large"
            class="nav-arrow nav-arrow-right"
            color="white"
            elevation="4"
            @click="nextThumbnail"
            :disabled="currentIndex === thumbnails.length - 1"
          >
            <v-icon size="large">chevron_right</v-icon>
          </v-btn>
        </div>

        <!-- Thumbnail Info -->
        <div v-if="currentThumbnail" class="thumbnail-info pa-3">
          <v-row dense>
            <v-col cols="auto">
              <span class="text-caption text-medium-emphasis">Resolution:</span>
              <span class="text-body-2 ml-1">{{ currentThumbnail.width }}x{{ currentThumbnail.height }}</span>
            </v-col>
            <v-col cols="auto">
              <span class="text-caption text-medium-emphasis">Format:</span>
              <span class="text-body-2 ml-1">{{ currentThumbnail.format?.toUpperCase() || 'Unknown' }}</span>
            </v-col>
            <v-col cols="auto">
              <span class="text-caption text-medium-emphasis">Size:</span>
              <span class="text-body-2 ml-1">{{ formatBytes(currentThumbnail.size) }}</span>
            </v-col>
          </v-row>
        </div>
      </v-card-text>

      <!-- Thumbnail Carousel for multiple images -->
      <v-card-actions v-if="thumbnails.length > 1" class="thumbnail-carousel pa-2">
        <div class="d-flex gap-2 overflow-x-auto pa-2">
          <div
            v-for="(thumb, index) in thumbnails"
            :key="thumb.index"
            class="thumbnail-carousel-item"
            :class="{ active: index === currentIndex }"
            @click="currentIndex = index"
          >
            <v-img
              :src="getThumbnailUrl(thumb.index)"
              :alt="`Thumbnail ${index + 1}`"
              width="60"
              height="60"
              cover
              class="thumbnail-carousel-image"
            />
          </div>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { FileStorageService, type ThumbnailInfo } from '@/backend/file-storage.service'
import { useDialog } from '@/shared/dialog.composable'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'

const thumbnailViewerDialog = useDialog(DialogName.JobThumbnailViewer)

const isOpen = computed(() => thumbnailViewerDialog.isDialogOpened())
const context = computed(() => thumbnailViewerDialog.context())

const thumbnails = ref<ThumbnailInfo[]>([])
const thumbnailUrls = ref<Map<number, string>>(new Map())
const currentIndex = ref(0)
const loading = ref(false)
const fileStorageId = ref<string | null>(null)

// Load thumbnails when dialog opens
watch(() => context.value?.fileStorageId, async (newFileStorageId) => {
  if (newFileStorageId && isOpen.value) {
    fileStorageId.value = newFileStorageId
    await loadThumbnails(newFileStorageId, context.value?.thumbnails || [])
  }
}, { immediate: true })

watch(isOpen, (value) => {
  if (!value) {
    // Reset state when dialog closes
    thumbnails.value = []
    thumbnailUrls.value.clear()
    currentIndex.value = 0
    fileStorageId.value = null
  }
})

const currentThumbnail = computed(() => {
  return thumbnails.value[currentIndex.value] || null
})

const currentThumbnailUrl = computed(() => {
  if (!currentThumbnail.value) return ''
  return thumbnailUrls.value.get(currentThumbnail.value.index) || ''
})

const loadThumbnails = async (storageId: string, thumbsList: ThumbnailInfo[]) => {
  loading.value = true
  try {
    // Sort thumbnails by resolution (highest first)
    const sortedThumbs = [...thumbsList].sort((a, b) => {
      const aPixels = a.width * a.height
      const bPixels = b.width * b.height
      return bPixels - aPixels
    })

    thumbnails.value = sortedThumbs
    currentIndex.value = 0

    // Load URLs for all thumbnails
    thumbnailUrls.value.clear()
    for (const thumb of sortedThumbs) {
      const url = await FileStorageService.getThumbnail(storageId, thumb.index)
      thumbnailUrls.value.set(thumb.index, url)
    }
  } catch (err) {
    console.error('Failed to load thumbnails:', err)
    thumbnails.value = []
    thumbnailUrls.value.clear()
  } finally {
    loading.value = false
  }
}

const getThumbnailUrl = (index: number): string => {
  return thumbnailUrls.value.get(index) || ''
}

const nextThumbnail = () => {
  if (currentIndex.value < thumbnails.value.length - 1) {
    currentIndex.value++
  }
}

const previousThumbnail = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const close = () => {
  thumbnailViewerDialog.closeDialog()
}

const handleDialogClose = (value: boolean) => {
  if (!value) {
    close()
  }
}

const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}
</script>

<style scoped>
.thumbnail-viewer-card {
  background-color: rgb(var(--v-theme-surface));
}

.thumbnail-loading-container,
.thumbnail-empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 48px;
}

.thumbnail-image-container {
  position: relative;
  min-height: 400px;
  max-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.05);
  overflow: auto;
}

.thumbnail-main-image {
  max-width: 100%;
  max-height: 70vh;
  height: auto;
  width: auto;
  display: block;
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  opacity: 0.9;
  transition: opacity 0.2s;
}

.nav-arrow:hover {
  opacity: 1;
}

.nav-arrow-left {
  left: 16px;
}

.nav-arrow-right {
  right: 16px;
}

.thumbnail-info {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.thumbnail-carousel {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background-color: rgba(var(--v-theme-surface-variant), 0.2);
}

.thumbnail-carousel .d-flex {
  gap: 8px;
}

.thumbnail-carousel-item {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 8px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.thumbnail-carousel-item:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
}

.thumbnail-carousel-item.active {
  border-color: rgb(var(--v-theme-primary));
}

.thumbnail-carousel-image {
  border-radius: 6px;
}

:deep(.v-card-title) {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}
</style>
