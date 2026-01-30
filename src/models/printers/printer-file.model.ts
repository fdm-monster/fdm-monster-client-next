export interface FileDto {
  path: string
  size: number | null
  date: number | null
  dir: boolean
}

export interface ClearedFilesResult {
  failedFiles: FileDto[]
  succeededFiles: FileDto[]
}
