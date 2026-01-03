export interface ExportYamlModel {
  exportPrinters: boolean
  exportTags: boolean
  exportFloorGrid: boolean
  exportFloors: boolean
  exportSettings: boolean
  exportUsers: boolean
  // Used to determine import strategy
  printerComparisonStrategiesByPriority: string[]
  floorComparisonStrategiesByPriority: string
  // Helpful reference
  notes?: string
}
