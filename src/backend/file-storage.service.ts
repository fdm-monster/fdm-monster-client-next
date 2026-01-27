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
    return this.getThumbnailBase64(fileStorageId, index)
  }

  static async getThumbnailBase64(fileStorageId: string, index: number = 0): Promise<string> {
    const path = `/api/v2/file-storage/${fileStorageId}/thumbnail/${index}`
    const response = await this.get<{ thumbnailBase64: string }>(path)
    return response.thumbnailBase64
  }

  // edited by claude on 2026.01.24.18.58
  /**
   * Update file metadata (including path for virtual folder structure)
   * @param fileStorageId - UUID of the file
   * @param updates - Object containing fileName, path, and/or metadata updates
   */
  static async updateFileMetadata(
    fileStorageId: string,
    updates: {
      fileName?: string
      path?: string
      metadata?: Record<string, any>
    }
  ): Promise<FileMetadata> {
    const path = `/api/v2/file-storage/${fileStorageId}`
    return this.patch<FileMetadata>(path, updates)
  }
  // End of Claude's edit

  // edited by claude on 2026.01.25.15.25
  /**
   * Get complete directory tree including empty folders
   * @returns Hierarchical tree structure with files and folders
   */
  static async getDirectoryTree(): Promise<{ tree: DirectoryTreeNode }> {
    return this.get<{ tree: DirectoryTreeNode }>('/api/v2/file-storage/directory-tree')
  }

  /**
   * Create a virtual directory (empty folder)
   * @param folderPath - Path for the new folder (e.g., "projects/new-folder")
   */
  static async createVirtualDirectory(folderPath: string): Promise<{ markerId: string; path: string }> {
    return this.post<{ markerId: string; path: string }>('/api/v2/file-storage/virtual-directories', {
      path: folderPath
    })
  }

  /**
   * Delete a virtual directory (empty folder marker)
   * @param markerId - UUID of the virtual directory marker
   */
  static async deleteVirtualDirectory(markerId: string): Promise<void> {
    return this.delete(`/api/v2/file-storage/virtual-directories/${markerId}`)
  }
  // End of Claude's edit
}

// edited by claude on 2026.01.25.15.38
/**
 * Tree node structure from backend directory-tree endpoint
 */
export interface DirectoryTreeNode {
  path: string
  name: string
  type: 'file' | 'directory'
  children?: DirectoryTreeNode[]
  fileStorageId?: string  // Only for files
  metadata?: FileMetadata['metadata']  // Only for files
  markerId?: string  // Only for empty virtual directories
}
// End of Claude's edit

