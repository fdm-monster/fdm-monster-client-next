import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createVuetify } from 'vuetify'
import RouteJobDialog from '@/components/PrintJobs/RouteJobDialog.vue'
import { usePrinterStore } from '@/store/printer.store'

vi.mock('@/backend/routing.service', () => ({
  RoutingService: { resolve: vi.fn() }
}))
vi.mock('@/backend/print-queue.service', () => ({
  PrintQueueService: { addToQueue: vi.fn() }
}))
vi.mock('@/shared/snackbar.composable', () => ({
  useSnackbar: () => ({ info: vi.fn(), error: vi.fn() })
}))
vi.mock('@/queries/global-queue.query', () => ({
  useInvalidateGlobalQueue: () => vi.fn()
}))

import { RoutingService } from '@/backend/routing.service'
import { PrintQueueService } from '@/backend/print-queue.service'

const resolveMock = RoutingService.resolve as any
const addToQueueMock = PrintQueueService.addToQueue as any

const printers = [
  { id: 3, name: 'Prusa Mini 1' },
  { id: 4, name: 'Prusa Mini 2' },
  { id: 5, name: 'Voron' }
]
const job = { id: 42, fileName: 'part.gcode', fileStorageId: 'fs-1' }

let pinia: ReturnType<typeof createPinia>

function mountDialog(): any {
  return mount(RouteJobDialog, {
    props: { modelValue: false, job: job as any },
    global: {
      plugins: [createVuetify(), pinia],
      // Stub the dialog shell — jsdom lacks the overlay APIs; the routing
      // logic under test lives in the component, not the rendered overlay.
      stubs: { VDialog: true }
    }
  })
}

describe('RouteJobDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    pinia = createPinia()
    setActivePinia(pinia)
    usePrinterStore().$patch({ printers: printers as any })
  })

  it('narrows the printer choice to a tag\'s member printers', async () => {
    resolveMock.mockResolvedValue({
      routingTarget: 'fleet',
      kind: 'tag',
      matchedName: 'fleet',
      printerIds: [3, 4]
    })
    const wrapper = mountDialog()
    await wrapper.setProps({ modelValue: true })
    await flushPromises()

    expect(resolveMock).toHaveBeenCalledWith('fs-1')
    expect(wrapper.vm.resolution.kind).toBe('tag')
    expect(wrapper.vm.candidatePrinters.map((p: any) => p.id)).toEqual([3, 4])
  })

  it('offers every printer for an ambiguous target', async () => {
    resolveMock.mockResolvedValue({
      routingTarget: 'voron',
      kind: 'ambiguous',
      matchedName: 'voron',
      printerIds: []
    })
    const wrapper = mountDialog()
    await wrapper.setProps({ modelValue: true })
    await flushPromises()

    expect(wrapper.vm.resolution.kind).toBe('ambiguous')
    expect(wrapper.vm.candidatePrinters.map((p: any) => p.id)).toEqual([3, 4, 5])
  })

  it('routes the job to the selected printer and closes', async () => {
    const wrapper = mountDialog()
    wrapper.vm.selectedPrinterId = 4
    await wrapper.vm.routeJob()

    expect(addToQueueMock).toHaveBeenCalledWith(4, 42)
    expect(wrapper.emitted('routed')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
  })

  it('does nothing when no printer is selected', async () => {
    const wrapper = mountDialog()
    await wrapper.vm.routeJob()

    expect(addToQueueMock).not.toHaveBeenCalled()
    expect(wrapper.emitted('routed')).toBeFalsy()
  })

  it('keeps the dialog open and does not emit routed when queueing fails', async () => {
    addToQueueMock.mockRejectedValueOnce(new Error('network'))
    const wrapper = mountDialog()
    wrapper.vm.selectedPrinterId = 4
    await wrapper.vm.routeJob()

    expect(wrapper.emitted('routed')).toBeFalsy()
    expect(wrapper.vm.routing).toBe(false)
  })
})
