import { BaseService } from '@/backend/base.service'
import * as string_decoder from 'node:string_decoder'

export interface FileMetadata {
  fileStorageId: string
  fileName: string
  fileFormat: string
  fileSize: number
  fileHash: string
  createdAt: Date
  thumbnailCount: number
  thumbnailsUrl?: string | null
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
  /**
   * Get all stored files
   */
  static async listFiles(): Promise<FilesListResponse> {

    return this.get<FilesListResponse>('/api/v2/file-storage')
  }

  /**
   * Get file metadata
   */
  static async getFileMetadata(fileStorageId: string): Promise<FileMetadata> {
    const path = `/api/v2/file-storage/${fileStorageId}`
    return this.get<FileMetadata>(path)
  }

  /**
   * Delete a stored file
   */
  static async deleteFile(fileStorageId: string): Promise<void> {
    const path = `/api/v2/file-storage/${fileStorageId}`
    return this.delete(path)
  }

  static async analyzeFile(fileStorageId: string): Promise<{
    message: string
    fileStorageId: string
    metadata: any
    thumbnailCount: number
  }> {
    const path = `/api/v2/file-storage/${fileStorageId}/analyze`
    return this.post(path, {})
  }

  /**
   * Get thumbnail URL
   */
  static getThumbnailUrl(fileStorageId: string, index: number = 0): string {
    return `/api/v2/file-storage/${fileStorageId}/thumbnail/${index}`
  }

  /**
   * Upload a file to storage
   */
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

  /**
   * Get a specific Gcode file thumbnail
   */
  static async getGcodeThumbnail(fileId:string, thumbId: number) {
    const path = `/api/v2/file-storage/${fileId}/thumbnail/${thumbId}`;
    const response = await this.get<{
      //id: string
      thumbnailBase64: string
    }>(path)

    return response.thumbnailBase64
  }
}

