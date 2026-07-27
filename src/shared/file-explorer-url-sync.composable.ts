import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFileExplorer } from '@/shared/file-explorer.composable'
import { usePrinterStore } from '@/store/printer.store'

export function useFileExplorerUrlSync() {
  const route = useRoute()
  const router = useRouter()
  const fileExplorer = useFileExplorer()
  const printersStore = usePrinterStore()

  function parseRoute() {
    const id = Number(route.query.sidenav)
    const path = typeof route.query.path === 'string' ? route.query.path : ''
    return {
      id: Number.isFinite(id) && id > 0 ? id : undefined,
      path,
    }
  }

  function applyRouteToState() {
    const { id, path } = parseRoute()

    if (!id) {
      if (fileExplorer.currentPrinterId.value) {
        fileExplorer.closeFileExplorer()
      }
      return
    }

    const printer = printersStore.printer(id)
    if (!printer) {
      return
    }

    if (fileExplorer.currentPrinterId.value !== id) {
      fileExplorer.openFileExplorer(printer)
    }

    if (path !== fileExplorer.currentPath.value) {
      fileExplorer.setCurrentPath(path)
    }
  }

  let suppressUrlWrite = false

  function writeStateToRoute() {
    if (suppressUrlWrite) {
      return
    }

    const query: Record<string, string | undefined> = { ...route.query } as any
    if (fileExplorer.currentPrinterId.value) {
      query.sidenav = String(fileExplorer.currentPrinterId.value)
      query.path = fileExplorer.currentPath.value || undefined
    } else {
      query.sidenav = undefined
      query.path = undefined
    }

    const sameSidenav = String(route.query.sidenav ?? '') === String(query.sidenav ?? '')
    const samePath = String(route.query.path ?? '') === String(query.path ?? '')
    if (sameSidenav && samePath) {
      return
    }

    router.replace({ query })
  }

  watch(
    [fileExplorer.currentPrinterId, fileExplorer.currentPath],
    writeStateToRoute,
  )

  watch(
    () => [route.query.sidenav, route.query.path] as const,
    () => {
      suppressUrlWrite = true
      try {
        applyRouteToState()
      } finally {
        queueMicrotask(() => {
          suppressUrlWrite = false
        })
      }
    },
  )

  watch(
    () => printersStore.printers.map((p) => p.id).join(','),
    applyRouteToState,
  )

  onMounted(applyRouteToState)
}
