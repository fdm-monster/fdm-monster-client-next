import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { PrintQueueService, GlobalQueueResponse } from "@/backend/print-queue.service";

export const globalQueueQueryKey = "global-queue";

interface PlateView {
  jobId: number;
  fileName: string;
  skuCount: number;
  totalQueued: number;
  printers: Array<{
    printerId: number;
    printerName: string | undefined;
    queuePosition: number;
  }>;
}

interface GlobalQueuePlateView {
  totalJobs: number;
  totalPlates: number;
  plates: PlateView[];
}

function transformToPlateView(response: GlobalQueueResponse): GlobalQueuePlateView {
  // Group items by fileName to create plate view
  const plateMap = new Map<string, PlateView>();

  response.items.forEach((item) => {
    if (!plateMap.has(item.fileName)) {
      plateMap.set(item.fileName, {
        jobId: item.jobId,
        fileName: item.fileName,
        skuCount: 1,
        totalQueued: 0,
        printers: [],
      });
    }

    const plate = plateMap.get(item.fileName)!;
    plate.totalQueued++;
    plate.printers.push({
      printerId: item.printerId,
      printerName: item.printerName,
      queuePosition: item.queuePosition,
    });
  });

  const plates = Array.from(plateMap.values());

  return {
    totalJobs: response.totalCount,
    totalPlates: plates.length,
    plates,
  };
}

export const useGlobalQueueQuery = (enabled = true) => {
  return useQuery({
    queryKey: [globalQueueQueryKey],
    queryFn: async () => {
      const response = await PrintQueueService.getGlobalQueue();
      return transformToPlateView(response);
    },
    enabled,
    staleTime: 1000 * 30, // 30 seconds - queue changes frequently
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};

export const useInvalidateGlobalQueue = () => {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: [globalQueueQueryKey] });
  };
};

