import { BaseService } from '@/backend/base.service'

export interface ThumbnailInfo {
  index: number
  width: number
  height: number
  format: string
  size: number
}

export interface FileMetadata {
  fileStorageId: string
  fileName: string
  fileFormat: string
  fileSize: number
  fileHash: string
  createdAt: Date
  thumbnails: ThumbnailInfo[]
  metadata?: {
    gcodePrintTimeSeconds?: number
    filamentUsedGrams?: number
    nozzleDiameterMm?: number
    layerHeight?: number
    totalLayers?: number
    [key: string]: any
  }
}

export interface FilesListResponse {
  files: FileMetadata[]
  totalCount: number
}

export class FileStorageService extends BaseService {
  static async listFiles(): Promise<FilesListResponse> {
    return this.get<FilesListResponse>('/api/v2/file-storage')
  }

  static async getFileMetadata(fileStorageId: string): Promise<FileMetadata> {
    const path = `/api/v2/file-storage/${ fileStorageId }`
    return this.get<FileMetadata>(path)
  }

  static async deleteFile(fileStorageId: string): Promise<void> {
    const path = `/api/v2/file-storage/${ fileStorageId }`
    return this.delete(path)
  }

  static async analyzeFile(fileStorageId: string): Promise<{
    message: string
    fileStorageId: string
    metadata: any
    thumbnailCount: number
  }> {
    const path = `/api/v2/file-storage/${ fileStorageId }/analyze`
    return this.post(path, {})
  }

  static async uploadFile(file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    const path = '/api/v2/file-storage/upload'
    const response = await this.postUpload(path, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  static async getThumbnail(fileStorageId: string, index: number = 0): Promise<string> {
    const path = `/api/v2/file-storage/${fileStorageId}/thumbnail/${index}`
    const response = await this.get<{ thumbnailBase64: string }>(path)
    return response.thumbnailBase64
  }
}
