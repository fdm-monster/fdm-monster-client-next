import { defineStore } from 'pinia'

export type GridSortMode = 'position' | 'name'

interface State {
  selectedTagFilter: number[]
  selectedPrinterTypeFilter: number[]
  sortMode: GridSortMode
}
export const useGridStore = defineStore('GridStore', {
  state: (): State => ({
    selectedTagFilter: [],
    selectedPrinterTypeFilter: [],
    sortMode: 'position'
  }),
  actions: {
    setTagFilter(tagIds: number[]) {
      this.selectedTagFilter = tagIds
    },
    setPrinterTypeFilter(typeIds: number[]) {
      this.selectedPrinterTypeFilter = typeIds
    },
    setSortMode(mode: GridSortMode) {
      this.sortMode = mode
    },
    toggleSortMode() {
      this.sortMode = this.sortMode === 'position' ? 'name' : 'position'
    }
  }
})
