import { useQuery } from "@tanstack/vue-query";
import { PrinterFileService } from "@/backend";
import { ComputedRef } from "vue";
import { FileStorageService } from '@/backend/file-storage.service'

export const thumbnailQueryKey = "thumbnail";
export const gcodeThumbnailQueryKey = "gcodeThumbnail";

export const useThumbnailQuery = (
  printerId: ComputedRef<number | undefined>,
  enabled?: boolean
) => {
  return useQuery({
    queryKey: [thumbnailQueryKey, printerId],
    queryFn: async () => {
      if (!printerId.value) return "";
      return PrinterFileService.getThumbnail(printerId.value).then((r) => r.thumbnailBase64 || "");
    },
    enabled: !!printerId && !!enabled,
  });
};

export const useGcodeThumbnailQuery = (
  fileId: ComputedRef<string | undefined>,
  thumbId: number
) => {
  return useQuery({
    queryKey: [gcodeThumbnailQueryKey, 'gcodeThumbnail-${fileId}-${thumbId}'],
    queryFn: async () => {
      if (!fileId.value) return "";
      return FileStorageService.getGcodeThumbnail(fileId.value, thumbId).then((r ) => r.toString() || "" );
    }
  })
}
