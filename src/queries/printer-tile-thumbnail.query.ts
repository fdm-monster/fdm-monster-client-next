import { useQuery } from "@tanstack/vue-query";
import { PrinterRemoteFileService } from "@/backend";
import { ComputedRef } from "vue";

export const printerTileThumbnailQueryKey = "printer-tile-thumbnail";

export const usePrinterTileThumbnailQuery = (
  printerId: ComputedRef<number | undefined>,
  enabled?: boolean
) => {
  return useQuery({
    queryKey: [printerTileThumbnailQueryKey, printerId],
    queryFn: async () => {
      if (!printerId.value) return "";
      return PrinterRemoteFileService.getThumbnail(printerId.value)
        .then((r) => r.thumbnailBase64 || "");
    },
    enabled: !!printerId && !!enabled,
  });
};
