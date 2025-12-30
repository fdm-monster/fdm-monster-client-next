import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import OctoFarmImportDialog from '@/components/Generic/Dialogs/OctoFarmImportDialog.vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { nextTick } from 'vue'

vi.mock('@/shared/dialog.composable', () => ({
  useDialog: () => ({
    dialogId: 'import-octofarm-dialog',
    closeDialog: vi.fn()
  })
}))

vi.mock('@/backend', () => ({
  PrintersService: {
    batchImportPrinters: vi.fn().mockResolvedValue({ data: [] })
  }
}))

import { PrintersService } from '@/backend'
import { VStepperVertical, VStepperVerticalItem } from "vuetify/labs/components";
const mockBatchImport = PrintersService.batchImportPrinters as any

const testData = {
  databases: [[
    {
      _id: '1',
      disabled: false,
      apikey: 'KEY1',
      printerURL: 'http://192.168.1.100',
      settingsAppearance: { name: 'Ender 3' }
    },
    {
      _id: '2',
      disabled: false,
      apikey: 'KEY2',
      printerURL: 'http://192.168.1.101',
      settingsAppearance: { name: 'Prusa MK3S' }
    }
  ]]
}

describe('OctoFarm Import Dialog', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mount(OctoFarmImportDialog, {
      global: {
        plugins: [createVuetify({
          components: {
            VStepperVerticalItem,
            VStepperVertical
          }
        }), createPinia()]
      }
    })
  })

  const uploadFile = async (data: any) => {
    wrapper.vm.importFile = {
      text: vi.fn().mockResolvedValue(JSON.stringify(data))
    } as unknown as File
    await wrapper.vm.clickValidateAndNext()
    await nextTick()
  }

  it('validates and transforms OctoFarm export data', async () => {
    await uploadFile(testData)

    expect(wrapper.vm.validationStatus).toBe(true)
    expect(wrapper.vm.numPrinters).toBe(2)
    expect(wrapper.vm.stepProgress).toBe(2)
    expect(wrapper.vm.committedPrinters[0]).toMatchObject({
      name: 'Ender 3',
      printerURL: 'http://192.168.1.100',
      apiKey: 'KEY1',
      enabled: true
    })
  })

  it('submits selected printers to backend', async () => {
    await uploadFile(testData)

    await wrapper.vm.submit()
    await nextTick()

    expect(mockBatchImport).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Ender 3', apiKey: 'KEY1' }),
      expect.objectContaining({ name: 'Prusa MK3S', apiKey: 'KEY2' })
    ])
    expect(wrapper.vm.importCompletedSuccessfully).toBe(true)
  })

  it('submits only selected printers', async () => {
    await uploadFile(testData)

    wrapper.vm.selectedPrinters = [0]
    await wrapper.vm.submit()

    const calls = mockBatchImport.mock.calls[0][0]
    expect(calls).toHaveLength(1)
    expect(calls[0].name).toBe('Ender 3')
  })

  it('handles submit errors', async () => {
    mockBatchImport.mockRejectedValueOnce(new Error('Network error'))
    await uploadFile(testData)

    await wrapper.vm.submit()

    expect(wrapper.vm.importCompletedSuccessfully).toBe(false)
    expect(wrapper.vm.errorMessage).toBe('An error occurred')
  })
})
