import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { nextTick } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createRouter, createMemoryHistory } from 'vue-router'
import ManageTagsDialog from '@/components/Generic/Dialogs/ManageTagsDialog.vue'
import { PrinterTagService } from '@/backend/printer-tag.service'

// Mock the services
vi.mock('@/backend/printer-tag.service', () => ({
  PrinterTagService: {
    getTagsWithPrinters: vi.fn().mockResolvedValue([
      { id: 1, name: 'Workshop', printers: [] },
      { id: 2, name: 'Office', printers: [] }
    ]),
    createTag: vi.fn().mockResolvedValue({}),
    deleteTag: vi.fn().mockResolvedValue([]),
    updateTagName: vi.fn().mockResolvedValue([]),
    updateTagColor: vi.fn().mockResolvedValue([]),
    addPrinterToTag: vi.fn().mockResolvedValue([]),
    deletePrinterTag: vi.fn().mockResolvedValue([])
  }
}))

vi.mock('@/backend/printers.service', () => ({
  PrintersService: {
    getPrinters: vi.fn().mockResolvedValue([])
  }
}))

vi.mock('@/backend/camera-stream.service', () => ({
  CameraStreamService: {
    listCameraStreams: vi.fn().mockResolvedValue([])
  }
}))

vi.mock('@/shared/dialog.composable', () => ({
  useDialog: vi.fn().mockReturnValue({
    dialogId: 'test-dialog',
    openDialog: vi.fn(),
    closeDialog: vi.fn()
  })
}))

vi.mock('@/shared/snackbar.composable', () => ({
  useSnackbar: vi.fn().mockReturnValue({
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn()
  })
}))

describe('ManageTagsDialog - Tag Rename Functionality', () => {
  let wrapper: any
  let pinia: any
  let queryClient: QueryClient
  let router: any

  beforeEach(() => {
    vi.clearAllMocks()
    pinia = createPinia()
    const vuetify = createVuetify()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/printers-grid', component: { template: '<div>Printers Grid</div>' } },
        { path: '/cameras', component: { template: '<div>Cameras</div>' } }
      ]
    })

    wrapper = mount(ManageTagsDialog, {
      global: {
        plugins: [pinia, vuetify, router, [VueQueryPlugin, { queryClient }]]
      }
    })
  })

  it('should have the updateTagName method available', () => {
    expect(wrapper.vm.updateTagName).toBeDefined()
  })

  it('should have the startEditingTag method available', () => {
    expect(wrapper.vm.startEditingTag).toBeDefined()
  })

  it('should have the cancelEditingTag method available', () => {
    expect(wrapper.vm.cancelEditingTag).toBeDefined()
  })

  it('should set editing state when startEditingTag is called', async () => {
    await wrapper.vm.startEditingTag(1, 'Workshop')

    expect(wrapper.vm.editingTagId).toBe(1)
    expect(wrapper.vm.editingTagName).toBe('Workshop')
  })

  it('should clear editing state when cancelEditingTag is called', async () => {
    await wrapper.vm.startEditingTag(1, 'Workshop')
    await wrapper.vm.cancelEditingTag()

    expect(wrapper.vm.editingTagId).toBeNull()
    expect(wrapper.vm.editingTagName).toBe('')
  })

  it('should call PrinterTagService.updateTagName when updateTagName is called', async () => {
    wrapper.vm.editingTagName = 'New Workshop Name'

    await wrapper.vm.updateTagName(1)

    expect(PrinterTagService.updateTagName).toHaveBeenCalledWith(1, 'New Workshop Name')
  })

  it('should clear editing state after successful tag update', async () => {
    wrapper.vm.editingTagId = 1
    wrapper.vm.editingTagName = 'New Workshop Name'

    await wrapper.vm.updateTagName(1)
    await nextTick()

    expect(wrapper.vm.editingTagId).toBeNull()
    expect(wrapper.vm.editingTagName).toBe('')
  })

  it('should trim tag name before updating', async () => {
    wrapper.vm.editingTagName = '  Trimmed Name  '

    await wrapper.vm.updateTagName(1)

    expect(PrinterTagService.updateTagName).toHaveBeenCalledWith(1, 'Trimmed Name')
  })

  it('should not update tag with empty name', async () => {
    wrapper.vm.editingTagName = '   '

    await wrapper.vm.updateTagName(1)

    expect(PrinterTagService.updateTagName).not.toHaveBeenCalled()
  })
})

