import { useQuery } from "@tanstack/vue-query";
import { PrintJobsService } from "@/backend/print-jobs.service";
import { ComputedRef, Ref } from "vue";

export const jobThumbnailQueryKey = "job-thumbnail";

export const useJobThumbnailQuery = (
  jobId: ComputedRef<number | undefined> | Ref<number | undefined>,
  enabled?: boolean
) => {
  return useQuery({
    queryKey: [jobThumbnailQueryKey, jobId],
    queryFn: async () => {
      if (!jobId.value) return null;

      try {
        const thumbnails = await PrintJobsService.getThumbnails(jobId.value);

        if (!thumbnails || thumbnails.length === 0) {
          return null;
        }

        // Select best thumbnail (prefer ~400x400 or highest available)
        const bestThumbnail = selectBestJobThumbnail(thumbnails);

        if (!bestThumbnail) {
          return null;
        }

        return await PrintJobsService.getThumbnailUrl(jobId.value, bestThumbnail.index);
      } catch (err) {
        console.debug(`Failed to load thumbnail for job ${jobId.value}:`, err);
        return null;
      }
    },
    enabled: !!jobId.value && enabled !== false,
    staleTime: 1000 * 60 * 60, // 1 hour - thumbnails don't change
    retry: false, // Don't retry if thumbnail doesn't exist
  });
};

// Helper function to select the best thumbnail
function selectBestJobThumbnail(thumbnails: any[]) {
  if (!thumbnails || thumbnails.length === 0) return null;

  // Filter out thumbnails that are too small (less than 100 pixels in any dimension)
  const validThumbnails = thumbnails.filter(t => t.width >= 100 && t.height >= 100);

  // If no valid thumbnails, use the largest available
  if (validThumbnails.length === 0) {
    return thumbnails.reduce((largest, current) => {
      const largestPixels = largest.width * largest.height;
      const currentPixels = current.width * current.height;
      return currentPixels > largestPixels ? current : largest;
    }, thumbnails[0]);
  }

  // Target resolution around 400x400 (160000 pixels)
  const targetPixels = 400 * 400;
  const maxReasonablePixels = 800 * 800; // Don't go above 800x800

  let bestThumbnail = validThumbnails[0];
  let bestScore = Infinity;

  for (const thumb of validThumbnails) {
    const pixels = thumb.width * thumb.height;

    // Skip thumbnails that are too large
    if (pixels > maxReasonablePixels) continue;

    // Calculate how close this thumbnail is to our target
    const score = Math.abs(pixels - targetPixels);

    // Select thumbnail with score closest to target
    if (score < bestScore) {
      bestScore = score;
      bestThumbnail = thumb;
    }
  }

  return bestThumbnail;
}

