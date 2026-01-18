import { useQuery } from "@tanstack/vue-query";
import { PrinterFileService } from "@/backend";
import { FileStorageService } from "@/backend/file-storage.service";
import { ComputedRef } from "vue";

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
  thumbID: ComputedRef<number | undefined>,
  enabled?: boolean
) => {
  return useQuery({
    queryKey: [gcodeThumbnailQueryKey, fileId, thumbID],
    queryFn: async () => {
      if (!fileId.value || !thumbID.value) return "";
      return FileStorageService.getThumbnail(fileId.value, thumbID.value).then((r) => r || "");
    },
    enabled: !!fileId && !!thumbID && !!enabled,
  });
};
