import { useQuery } from "@tanstack/vue-query";
import { PrintQueueService } from "@/backend/print-queue.service";

export const globalQueueQueryKey = "global-queue";

export const useGlobalQueueQuery = (enabled = true) => {
  return useQuery({
    queryKey: [globalQueueQueryKey],
    queryFn: async () => {
      return await PrintQueueService.getGlobalQueue();
    },
    enabled,
    staleTime: 1000 * 30, // 30 seconds - queue changes frequently
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};

