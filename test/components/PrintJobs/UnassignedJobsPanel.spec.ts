import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import UnassignedJobsPanel from '@/components/PrintJobs/UnassignedJobsPanel.vue'

vi.mock('@/backend/print-job.service', () => ({
  PrintJobService: { searchJobs: vi.fn() }
}))

import { PrintJobService } from '@/backend/print-job.service'

const searchJobsMock = PrintJobService.searchJobs as any

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
      stubs: { RouteJobDialog: true }
    }
  })
}

describe('UnassignedJobsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    searchJobsMock.mockResolvedValue(jobs)
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
})
