import { useQuery } from "@tanstack/vue-query";
import { FileStorageService, ThumbnailInfo } from "@/backend/file-storage.service";
import { ComputedRef, Ref } from "vue";

export const fileStorageThumbnailQueryKey = "file-storage-thumbnail";

export const useFileStorageThumbnailQuery = (
  fileStorageId: ComputedRef<string | null | undefined> | Ref<string | null | undefined>,
  thumbnails: ComputedRef<ThumbnailInfo[] | undefined> | Ref<ThumbnailInfo[] | undefined>,
  enabled?: boolean
) => {
  return useQuery({
    queryKey: [fileStorageThumbnailQueryKey, fileStorageId],
    queryFn: async () => {
      if (!fileStorageId.value || !thumbnails.value?.length) return null;

      try {
        const bestThumbnail = selectBestThumbnail(thumbnails.value);

        if (!bestThumbnail) {
          return null;
        }

        return await FileStorageService.getThumbnailBase64(fileStorageId.value, bestThumbnail.index);
      } catch (err) {
        console.debug(`Failed to load thumbnail for file ${fileStorageId.value}:`, err);
        return null;
      }
    },
    enabled: !!fileStorageId.value && !!thumbnails.value?.length && enabled !== false,
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

