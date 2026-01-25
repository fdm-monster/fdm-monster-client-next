<template>
  <div
    class="thumbnail-container"
    :class="{ clickable: thumbnailUrl }"
    @click="handleClick"
  >
    <v-img
      v-if="thumbnailUrl"
      :src="thumbnailUrl"
      alt="Job thumbnail"
      class="thumbnail-image"
    >
      <div class="thumbnail-overlay">
        <v-icon color="white" size="x-small">zoom_in</v-icon>
      </div>
    </v-img>
    <div v-else-if="!isLoading && !thumbnailUrl" class="thumbnail-placeholder">
      <v-icon size="small" color="grey-darken-1">image_not_supported</v-icon>
    </div>
    <v-progress-circular
      v-else
      indeterminate
      size="24"
      width="2"
      color="primary"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useFileStorageThumbnailQuery } from '@/queries/file-storage-thumbnail.query'
import { useDialog } from '@/shared/dialog.composable'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import type { ThumbnailInfo } from '@/backend/file-storage.service'

const props = defineProps<{
  fileStorageId: string | null
  thumbnails: ThumbnailInfo[]
}>()

const fileStorageIdRef = computed(() => props.fileStorageId)
const thumbnailsRef = computed(() => props.thumbnails)
const { data: thumbnailUrl, isLoading } = useFileStorageThumbnailQuery(fileStorageIdRef, thumbnailsRef)

const thumbnailViewerDialog = useDialog(DialogName.JobThumbnailViewer)

const handleClick = () => {
  if (thumbnailUrl.value && props.fileStorageId) {
    thumbnailViewerDialog.openDialog({ fileStorageId: props.fileStorageId, thumbnails: props.thumbnails })
  }
}
</script>

<style scoped>
.thumbnail-container {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  position: relative;
}

.thumbnail-container.clickable {
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.thumbnail-container.clickable:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
  display: block;
}

.thumbnail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.2s;
}

.thumbnail-container.clickable:hover .thumbnail-overlay {
  opacity: 1;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--v-theme-surface-variant), 0.2);
  border-radius: 8px;
}
</style>

