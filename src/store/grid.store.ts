import { defineStore } from 'pinia'

interface State {
  selectedTagFilter: number[]
  selectedPrinterTypeFilter: number[]
}
export const useGridStore = defineStore('GridStore', {
  state: (): State => ({
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
