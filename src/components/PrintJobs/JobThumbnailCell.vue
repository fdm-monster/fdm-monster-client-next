<template>
  <div class="thumbnail-container">
    <v-img
      v-if="thumbnailUrl"
      :src="thumbnailUrl"
      alt="Job thumbnail"
      class="thumbnail-image"
    />
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
import { useJobThumbnailQuery } from '@/queries/job-thumbnail.query'

const props = defineProps<{
  jobId: number
}>()

const jobIdRef = computed(() => props.jobId)
const { data: thumbnailUrl, isLoading } = useJobThumbnailQuery(jobIdRef)
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
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
  display: block;
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

