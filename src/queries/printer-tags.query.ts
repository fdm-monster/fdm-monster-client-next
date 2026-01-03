import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { PrinterTagService, TagWithPrintersDto } from '@/backend/printer-tag.service'

export const printerTagsQueryKey = 'printerTags'

export const usePrinterTagsQuery = () => {
  return useQuery({
    queryKey: [printerTagsQueryKey],
    queryFn: async (): Promise<TagWithPrintersDto[]> => {
      return await PrinterTagService.getTagsWithPrinters()
    }
  })
}

export const useInvalidatePrinterTags = () => {
  const queryClient = useQueryClient()

  return async () => {
    await queryClient.invalidateQueries({ queryKey: [printerTagsQueryKey] })
  }
}

