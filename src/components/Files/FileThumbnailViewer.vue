<template>
  <v-dialog v-model="isOpen" max-width="900px" @update:model-value="handleDialogClose">
    <v-card class="thumbnail-viewer-card">
      <v-card-title class="d-flex align-center bg-primary text-on-primary pa-3">
        <v-icon class="mr-2">image</v-icon>
        <span class="text-subtitle-1">File Thumbnail</span>
        <v-spacer/>
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
            v-if="currentThumbnailUrl"
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
              <span class="text-body-2 ml-1">{{ formatFileSize(currentThumbnail.size) }}</span>
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
import { computed, ref, watch } from 'vue'
import type { ThumbnailInfo } from '@/backend/file-storage.service'
import { useDialog } from '@/shared/dialog.composable'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import { formatFileSize } from "@/utils/file-size.util"
import { useFileStorageThumbnailQuery, fileStorageThumbnailQueryKey } from '@/queries/file-storage-thumbnail.query'
import { useQueryClient } from '@tanstack/vue-query'
import { FileStorageService } from '@/backend/file-storage.service'

const thumbnailViewerDialog = useDialog(DialogName.JobThumbnailViewer)
const queryClient = useQueryClient()

const isOpen = computed(() => thumbnailViewerDialog.isDialogOpened())
const context = computed(() => thumbnailViewerDialog.context())

const thumbnails = ref<ThumbnailInfo[]>([])
const currentIndex = ref(0)
const fileStorageId = ref<string | null>(null)
const carouselThumbnailUrls = ref<Map<number, string>>(new Map())
const loading = ref(false)

const currentThumbnailIndex = computed(() => {
  const thumb = thumbnails.value[currentIndex.value]
  return thumb?.index
})

const fileStorageIdComputed = computed(() => fileStorageId.value)
const thumbnailsComputed = computed(() => thumbnails.value)
const currentThumbnailIndexComputed = computed(() => currentThumbnailIndex.value)

const { data: currentThumbnailUrl, isLoading: loading } = useFileStorageThumbnailQuery(
  fileStorageIdComputed,
  thumbnailsComputed,
  currentThumbnailIndexComputed,
  isOpen.value
)

watch(isOpen, (value) => {
  if (value && context.value?.fileStorageId) {
    fileStorageId.value = context.value.fileStorageId
    const thumbsList = context.value.thumbnails || []

    thumbnails.value = [...thumbsList].sort((a, b) => {
      const aPixels = a.width * a.height
      const bPixels = b.width * b.height
      return bPixels - aPixels
    })
    currentIndex.value = 0
  } else if (!value) {
watch(isOpen, async (value) => {
  if (value && context.value?.fileStorageId) {
    fileStorageId.value = context.value.fileStorageId
    await loadThumbnails(context.value.fileStorageId, context.value.thumbnails || [])
  } else if (!value) {
    thumbnails.value = []
    currentIndex.value = 0
    fileStorageId.value = null
  }
})

const currentThumbnail = computed(() => {
  return thumbnails.value[currentIndex.value] || null
})


watch([thumbnails, fileStorageId, isOpen], async () => {
  if (!fileStorageId.value || thumbnails.value.length === 0 || !isOpen.value) {
    carouselThumbnailUrls.value.clear()
    return
  }

const loadThumbnails = async (storageId: string, thumbsList: ThumbnailInfo[]) => {
  loading.value = true
  try {
    const sortedThumbs = [...thumbsList].sort((a, b) => {
      const aPixels = a.width * a.height
      const bPixels = b.width * b.height
      return bPixels - aPixels
    })
    thumbnails.value = sortedThumbs
    currentIndex.value = 0

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

carouselThumbnailUrls.value.clear()
await Promise.all(thumbnails.value.map(thumb => loadThumbnail(thumb)))

const getThumbnailUrl = (index: number): string => {
  return carouselThumbnailUrls.value.get(index) || ''
}

const nextThumbnail = () => {
  if (currentIndex.value >= thumbnails.value.length - 1) {
    return
  }

  currentIndex.value++
}

const previousThumbnail = () => {
  if (currentIndex.value <= 0) {
    return
  }

  currentIndex.value--
}

const close = () => {
  thumbnailViewerDialog.closeDialog()
}

const handleDialogClose = (value: boolean) => {
  if (value) {
    return
  }

  close()
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
</style>
