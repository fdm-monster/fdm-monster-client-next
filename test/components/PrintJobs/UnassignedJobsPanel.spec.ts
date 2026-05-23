import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import UnassignedJobsPanel from '@/components/PrintJobs/UnassignedJobsPanel.vue'

vi.mock('@/backend/print-job.service', () => ({
  PrintJobService: { searchJobs: vi.fn(), deleteJob: vi.fn() }
}))
vi.mock('@/shared/snackbar.composable', () => ({
  useSnackbar: () => ({ info: vi.fn(), error: vi.fn() })
}))

import { PrintJobService } from '@/backend/print-job.service'

const searchJobsMock = PrintJobService.searchJobs as any
const deleteJobMock = PrintJobService.deleteJob as any

// A mix the panel must filter: only printer-less PENDING jobs are "unassigned"
const jobs = [
  {
    id: 1,
    printerId: null,
    status: 'PENDING',
    fileName: 'unassigned-a.gcode',
    fileStorageId: 'fs-a',
    statusReason: 'matches both a printer and a tag',
    metadata: { routingTarget: 'voron' }
  },
  {
    id: 2,
    printerId: null,
    status: 'PENDING',
    fileName: 'unassigned-b.gcode',
    fileStorageId: 'fs-b',
    statusReason: null,
    metadata: { routingTarget: 'fleet' }
  },
  { id: 3, printerId: 7, status: 'QUEUED', fileName: 'queued.gcode', fileStorageId: 'fs-c', statusReason: null, metadata: null },
  { id: 4, printerId: null, status: 'COMPLETED', fileName: 'done.gcode', fileStorageId: 'fs-d', statusReason: null, metadata: null }
]

function mountPanel(): any {
  return mount(UnassignedJobsPanel, {
    global: {
      plugins: [
        createVuetify(),
        createPinia(),
        [VueQueryPlugin, { queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }) }]
      ],
      // jsdom lacks the overlay APIs Vuetify's VDialog wires up on mount
      stubs: { RouteJobDialog: true, VDialog: true }
    }
  })
}

describe('UnassignedJobsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    searchJobsMock.mockResolvedValue(jobs)
    deleteJobMock.mockResolvedValue({ message: 'Job deleted' })
  })

  it('lists only printer-less PENDING jobs', async () => {
    const wrapper = mountPanel()
    await flushPromises()
    await flushPromises()

    expect(wrapper.vm.unassignedJobs.map((j: any) => j.id)).toEqual([1, 2])
  })

  it('shows the job status reason when present', async () => {
    const wrapper = mountPanel()
    await flushPromises()
    await flushPromises()

    expect(wrapper.text()).toContain('unassigned-a.gcode')
    expect(wrapper.text()).toContain('matches both a printer and a tag')
  })

  it('opens the route dialog for the chosen job', async () => {
    const wrapper = mountPanel()
    await flushPromises()
    await flushPromises()

    wrapper.vm.openRouteDialog(jobs[1])
    expect(wrapper.vm.dialogOpen).toBe(true)
    expect(wrapper.vm.activeJob).toEqual(jobs[1])
  })

  it('dismisses a single job via DELETE /print-jobs/:id (file kept)', async () => {
    const wrapper = mountPanel()
    await flushPromises()
    await flushPromises()

    await wrapper.vm.dismissJob(jobs[0])
    await flushPromises()

    expect(deleteJobMock).toHaveBeenCalledTimes(1)
    expect(deleteJobMock).toHaveBeenCalledWith(1)
  })

  it('toggleSelect adds and removes job ids from selectedIds', async () => {
    const wrapper = mountPanel()
    await flushPromises()
    await flushPromises()

    wrapper.vm.toggleSelect(1)
    expect(wrapper.vm.selectedIds.has(1)).toBe(true)
    expect(wrapper.vm.someSelected).toBe(true)

    wrapper.vm.toggleSelect(2)
    expect([...wrapper.vm.selectedIds].sort()).toEqual([1, 2])

    wrapper.vm.toggleSelect(1)
    expect(wrapper.vm.selectedIds.has(1)).toBe(false)
    expect([...wrapper.vm.selectedIds]).toEqual([2])
  })

  it('Dismiss selected deletes only the chosen subset', async () => {
    const wrapper = mountPanel()
    await flushPromises()
    await flushPromises()

    wrapper.vm.toggleSelect(2)
    wrapper.vm.openDismissConfirm([...wrapper.vm.selectedIds])
    await wrapper.vm.confirmDismiss()
    await flushPromises()

    expect(deleteJobMock).toHaveBeenCalledTimes(1)
    expect(deleteJobMock).toHaveBeenCalledWith(2)
    expect(wrapper.vm.selectedIds.has(2)).toBe(false)
    expect(wrapper.vm.confirmDismissOpen).toBe(false)
  })

  it('Dismiss all targets every unassigned job', async () => {
    const wrapper = mountPanel()
    await flushPromises()
    await flushPromises()

    wrapper.vm.openDismissConfirm(wrapper.vm.unassignedJobs.map((j: any) => j.id))
    await wrapper.vm.confirmDismiss()
    await flushPromises()

    expect(deleteJobMock).toHaveBeenCalledTimes(2)
    expect(deleteJobMock.mock.calls.map((c: any[]) => c[0]).sort()).toEqual([1, 2])
    expect(wrapper.vm.confirmDismissOpen).toBe(false)
  })

  it('keeps selection of jobs whose delete call rejected', async () => {
    deleteJobMock
      .mockResolvedValueOnce({ message: 'ok' })
      .mockRejectedValueOnce(new Error('boom'))
    const wrapper = mountPanel()
    await flushPromises()
    await flushPromises()

    wrapper.vm.toggleSelect(1)
    wrapper.vm.toggleSelect(2)
    wrapper.vm.openDismissConfirm([1, 2])
    await wrapper.vm.confirmDismiss()
    await flushPromises()

    expect(deleteJobMock).toHaveBeenCalledTimes(2)
    // The successful one (id=1) is cleared; the rejected one (id=2) stays selected
    expect(wrapper.vm.selectedIds.has(1)).toBe(false)
    expect(wrapper.vm.selectedIds.has(2)).toBe(true)
    expect(wrapper.vm.dismissing).toBe(false)
  })

  it('drops selection entries whose job is no longer unassigned', async () => {
    const wrapper = mountPanel()
    await flushPromises()
    await flushPromises()

    wrapper.vm.toggleSelect(1)
    wrapper.vm.toggleSelect(2)

    // Simulate id=1 being routed away (no longer printer-less PENDING)
    searchJobsMock.mockResolvedValue([
      { ...jobs[0], printerId: 9, status: 'QUEUED' },
      jobs[1]
    ])
    await wrapper.vm.$.appContext.config.globalProperties // touch reactivity
    await wrapper.vm.refetch?.()
    await flushPromises()
    await flushPromises()

    expect(wrapper.vm.selectedIds.has(1)).toBe(false)
    expect(wrapper.vm.selectedIds.has(2)).toBe(true)
  })
})
