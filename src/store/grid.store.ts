import { defineStore } from 'pinia'

interface State {
  gridEditMode: boolean
  selectedTagFilter: number[]
  selectedPrinterTypeFilter: number[]
}
export const useGridStore = defineStore('GridStore', {
  state: (): State => ({
    gridEditMode: false,
    selectedTagFilter: [],
    selectedPrinterTypeFilter: []
  }),
  actions: {
    setTagFilter(tagIds: number[]) {
      this.selectedTagFilter = tagIds
    },
    setPrinterTypeFilter(typeIds: number[]) {
      this.selectedPrinterTypeFilter = typeIds
    }
  }
})
