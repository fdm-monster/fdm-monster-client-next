import { useQuery } from "@tanstack/vue-query";
import { FileStorageService, ThumbnailInfo } from "@/backend/file-storage.service";
import { ComputedRef, Ref, computed } from "vue";

export const fileStorageThumbnailQueryKey = "file-storage-thumbnail";

export const useFileStorageThumbnailQuery = (
  fileStorageId: ComputedRef<string | null | undefined> | Ref<string | null | undefined>,
  thumbnails: ComputedRef<ThumbnailInfo[] | undefined> | Ref<ThumbnailInfo[] | undefined>,
  predeterminedThumbnailIndex?: ComputedRef<number | undefined> | Ref<number | undefined>,
  enabled?: boolean
) => {
  const thumbnailIndexToFetch = computed(() => {
    if (predeterminedThumbnailIndex?.value !== undefined && predeterminedThumbnailIndex.value !== null) {
      return predeterminedThumbnailIndex.value;
    }

    if (!thumbnails.value?.length) {
      return null;
    }

    const bestThumbnail = selectBestThumbnail(thumbnails.value);
    return bestThumbnail?.index ?? null;
  });

  return useQuery({
    queryKey: [fileStorageThumbnailQueryKey, fileStorageId, thumbnailIndexToFetch],
    queryFn: async () => {
      if (!fileStorageId.value || thumbnailIndexToFetch.value === null) {
        return null;
      }

      try {
        return await FileStorageService.getThumbnailBase64(fileStorageId.value, thumbnailIndexToFetch.value);
      } catch (err) {
        console.debug(`Failed to load thumbnail for file ${ fileStorageId.value }:`, err);
        return null;
      }
    },
    enabled: !!fileStorageId.value && !!thumbnailIndexToFetch.value && enabled !== false,
    staleTime: 1000 * 60 * 60,
    retry: false,
  });
};

export function selectBestThumbnail(thumbnails: ThumbnailInfo[]) {
  if (!thumbnails || thumbnails.length === 0) {
    return null;
  }

  const validThumbnails = thumbnails.filter(t => t.width >= 100 && t.height >= 100);

  if (validThumbnails.length === 0) {
    return thumbnails.reduce((largest, current) => {
      const largestPixels = largest.width * largest.height;
      const currentPixels = current.width * current.height;
      return currentPixels > largestPixels ? current : largest;
    }, thumbnails[0]);
  }

  const targetPixels = 400 * 400;
  const maxReasonablePixels = 800 * 800;

  let bestThumbnail = validThumbnails[0];
  let bestScore = Infinity;

  for (const thumb of validThumbnails) {
    const pixels = thumb.width * thumb.height;

    if (pixels > maxReasonablePixels) continue;
    const score = Math.abs(pixels - targetPixels);

    if (score < bestScore) {
      bestScore = score;
      bestThumbnail = thumb;
    }
  }

  return bestThumbnail;
}

