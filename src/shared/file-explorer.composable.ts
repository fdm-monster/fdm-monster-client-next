import { ref, computed } from 'vue'
import { PrinterDto } from '@/models/printers/printer.model'

export interface FileExplorerState {
  isOpen: boolean
  currentPrinterId?: number
  loading: boolean
  error: boolean
  lastLoadedPrinterId?: number
  currentPath: string
}

const state = ref<FileExplorerState>({
  isOpen: false,
  currentPrinterId: undefined,
  loading: true,
  error: false,
  lastLoadedPrinterId: undefined,
  currentPath: ''
})

export function useFileExplorer() {
  const isOpen = computed(() => state.value.isOpen)
  const currentPrinterId = computed(() => state.value.currentPrinterId)
  const loading = computed(() => state.value.loading)
  const error = computed(() => state.value.error)
  const lastLoadedPrinterId = computed(() => state.value.lastLoadedPrinterId)
  const currentPath = computed(() => state.value.currentPath)

  const openFileExplorer = (printer: PrinterDto) => {
    // Only update state if it's a different printer or first time opening
    const shouldRefresh = state.value.lastLoadedPrinterId !== printer.id

    state.value.isOpen = true
    state.value.currentPrinterId = printer.id

    if (shouldRefresh) {
      state.value.error = false
      state.value.lastLoadedPrinterId = printer.id
      state.value.currentPath = ''
    }
  }

  const closeFileExplorer = () => {
    state.value.isOpen = false
    state.value.currentPrinterId = undefined
    state.value.error = false
    state.value.lastLoadedPrinterId = undefined
    state.value.currentPath = ''
  }

  const setLoading = (isLoading: boolean) => {
    state.value.loading = isLoading
  }

  const setError = (hasError: boolean) => {
    state.value.error = hasError
  }

  const setCurrentPath = (path: string) => {
    state.value.currentPath = path
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
    currentPath,

    // Actions
    openFileExplorer,
    closeFileExplorer,
    setLoading,
    setError,
    setCurrentPath,
    resetForPrinter
  }
}
