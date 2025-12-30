import { ref, computed } from 'vue'
import { PrinterDto } from '@/models/printers/printer.model'

export interface FileExplorerState {
  isOpen: boolean
  currentPrinterId?: number
  loading: boolean
  error: boolean
  lastLoadedPrinterId?: number
}

const state = ref<FileExplorerState>({
  isOpen: false,
  currentPrinterId: undefined,
  loading: true,
  error: false,
  lastLoadedPrinterId: undefined
})

export function useFileExplorer() {
  const isOpen = computed(() => state.value.isOpen)
  const currentPrinterId = computed(() => state.value.currentPrinterId)
  const loading = computed(() => state.value.loading)
  const error = computed(() => state.value.error)
  const lastLoadedPrinterId = computed(() => state.value.lastLoadedPrinterId)

  const openFileExplorer = (printer: PrinterDto) => {
    // Only update state if it's a different printer or first time opening
    const shouldRefresh = state.value.lastLoadedPrinterId !== printer.id

    state.value.isOpen = true
    state.value.currentPrinterId = printer.id

    if (shouldRefresh) {
      state.value.error = false
      state.value.lastLoadedPrinterId = printer.id
    }
  }

  const closeFileExplorer = () => {
    state.value.isOpen = false
    state.value.currentPrinterId = undefined
    state.value.error = false
    state.value.lastLoadedPrinterId = undefined
  }

  const setLoading = (isLoading: boolean) => {
    state.value.loading = isLoading
  }

  const setError = (hasError: boolean) => {
    state.value.error = hasError
  }

  const resetForPrinter = (printerId: number) => {
    if (state.value.lastLoadedPrinterId === printerId) {
      state.value.error = false
      state.value.loading = true
    }
  }

  return {
    // State
    isOpen,
    currentPrinterId,
    loading,
    error,
    lastLoadedPrinterId,

    // Actions
    openFileExplorer,
    closeFileExplorer,
    setLoading,
    setError,
    resetForPrinter
  }
}
