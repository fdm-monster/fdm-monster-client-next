// File management utilities for moving and renaming files
// Created by Claude on 2026.01.24

import { FileStorageService } from '@/backend/file-storage.service'

/**
 * Moves a file to a new path by updating metadata._path
 * @param fileStorageId - The storage ID of the file to move
 * @param newPath - The new folder path (e.g., "projects/boats" or "" for root)
 * @returns Promise that resolves when the file is moved
 */
export async function moveFile(fileStorageId: string, newPath: string): Promise<void> {
  // edited by claude on 2026.01.24.18.42
  if (!validatePath(newPath)) {
    throw new Error(`Invalid path: ${newPath}`)
  }

  await FileStorageService.updateFileMetadata(fileStorageId, {
    path: newPath
  })
  // End of Claude's edit
}

/**
 * Renames a file by updating its fileName field
 * @param fileStorageId - The storage ID of the file to rename
 * @param newName - The new name for the file (just the filename, not the full path)
 * @returns Promise that resolves when the file is renamed
 */
export async function renameFile(fileStorageId: string, newName: string): Promise<void> {
  // edited by claude on 2026.01.24.18.42
  if (!validateFileName(newName)) {
    throw new Error(`Invalid filename: ${newName}`)
  }

  await FileStorageService.updateFileMetadata(fileStorageId, {
    fileName: newName
  })
  // End of Claude's edit
}

/**
 * Creates a new folder in the virtual path structure
 * Backend now handles nested paths automatically, creating all intermediate folders
 * @param folderPath - The path for the new folder (e.g., "projects/new-folder" or "a/b/c")
 * @returns Promise that resolves with the markerId when the folder is created
 */
export async function createFolder(folderPath: string): Promise<{ markerId: string; path: string }> {
  // edited by claude on 2026.01.25.17.15
  if (!validatePath(folderPath)) {
    throw new Error(`Invalid folder path: ${folderPath}`)
  }

  // Backend now creates all intermediate folders automatically when given nested path
  return await FileStorageService.createVirtualDirectory(folderPath)
  // End of Claude's edit
}

/**
 * Moves a folder and all its contents to a new path
 * @param oldFolderPath - The current path of the folder
 * @param newFolderPath - The new path for the folder
 * @param allFiles - Array of all file metadata to search for files in this folder
 * @returns Promise that resolves when all files in the folder are moved
 */
export async function moveFolder(
  oldFolderPath: string,
  newFolderPath: string,
  allFiles: Array<{ fileStorageId: string; fileName: string; metadata?: { _path?: string } }>
): Promise<void> {
  // edited by claude on 2026.01.24.18.44
  if (!validatePath(newFolderPath)) {
    throw new Error(`Invalid folder path: ${newFolderPath}`)
  }

  // Find all files in the old folder (and subfolders) using metadata._path
  const filesToMove = allFiles.filter(file => {
    const filePath = file.metadata?._path || ''
    return filePath === oldFolderPath || filePath.startsWith(`${oldFolderPath}/`)
  })

  // Update each file's path
  const movePromises = filesToMove.map(file => {
    const currentPath = file.metadata?._path || ''
    let newPath: string

    if (currentPath === oldFolderPath) {
      // File is directly in the folder being moved
      newPath = newFolderPath
    } else {
      // File is in a subfolder - preserve relative structure
      const relativePath = currentPath.substring(oldFolderPath.length + 1)
      newPath = `${newFolderPath}/${relativePath}`
    }

    return moveFile(file.fileStorageId, newPath)
  })

  await Promise.all(movePromises)
  // End of Claude's edit
}

/**
 * Renames a folder by updating all file paths within it
 * @param oldFolderPath - The current path of the folder
 * @param newFolderName - The new name for the folder (just the folder name, not full path)
 * @param allFiles - Array of all file metadata to search for files in this folder
 * @returns Promise that resolves when all files in the folder are updated
 */
export async function renameFolder(
  oldFolderPath: string,
  newFolderName: string,
  allFiles: Array<{ fileStorageId: string; fileName: string }>
): Promise<void> {
  // edited by claude on 2026.01.24.15.22
  const parentPath = getParentPath(oldFolderPath)
  const newFolderPath = parentPath ? `${parentPath}/${newFolderName}` : newFolderName

  if (!validatePath(newFolderPath)) {
    throw new Error(`Invalid folder name: ${newFolderName}`)
  }

  // Use moveFolder to handle the rename (rename is just a move within the same parent)
  await moveFolder(oldFolderPath, newFolderPath, allFiles)
  // End of Claude's edit
}

/**
 * Validates a file or folder path
 * @param path - The path to validate
 * @returns True if the path is valid, false otherwise
 */
export function validatePath(path: string): boolean {
  // edited by claude on 2026.01.24.16.30
  // Basic path validation rules:
  // - Empty string is valid (represents root)
  // - No leading or trailing slashes
  // - No empty segments (double slashes)
  // - No special characters except alphanumeric, dash, underscore, dot, and slash
  if (path === '') {
    return true // Empty path is valid (root folder)
  }
  if (path.startsWith('/') || path.endsWith('/')) {
    return false
  }

  const segments = path.split('/')
  if (segments.some(segment => !segment || segment.trim() === '')) {
    return false
  }

  // Allow alphanumeric, dash, underscore, dot, and space in path segments
  const validPathRegex = /^[a-zA-Z0-9-_. ]+$/
  return segments.every(segment => validPathRegex.test(segment))
}

/**
 * Validates a filename (without path)
 * @param fileName - The filename to validate
 * @returns True if the filename is valid, false otherwise
 */
export function validateFileName(fileName: string): boolean {
  // edited by claude on 2026.01.24.18.46
  // Basic filename validation:
  // - Not empty
  // - No path separators
  // - Only safe characters
  if (!fileName || fileName.includes('/') || fileName.includes('\\')) {
    return false
  }

  // Allow alphanumeric, dash, underscore, dot, and space
  const validFileNameRegex = /^[a-zA-Z0-9-_. ]+$/
  return validFileNameRegex.test(fileName)
  // End of Claude's edit
}

/**
 * Gets the parent path from a full path
 * @param path - The full path
 * @returns The parent path, or empty string if at root
 */
export function getParentPath(path: string): string {
  const parts = path.split('/')
  if (parts.length <= 1) {
    return ''
  }
  return parts.slice(0, -1).join('/')
}

/**
 * Gets the filename from a full path
 * @param path - The full path
 * @returns The filename (last segment of the path)
 */
export function getFileName(path: string): string {
  const parts = path.split('/')
  return parts.at(-1)?.toString() || ''
}

/**
 * Deletes a folder and all its contents
 * @param folderPath - The path of the folder to delete
 * @param allFiles - Array of all file metadata to search for files in this folder
 * @param allFolders - Array of all folder nodes to find subdirectory markerIds
 * @param markerId - Optional marker ID for empty virtual directories
 * @returns Promise that resolves when the folder and all files are deleted
 */
export async function deleteFolder(
  folderPath: string,
  allFiles: Array<{ fileStorageId: string; fileName: string; metadata?: { _path?: string } }>,
  allFolders: Array<{ path: string; markerId?: string }>,
  markerId?: string
): Promise<void> {
  // edited by claude on 2026.01.25.16.22
  // Find all files in this folder (and subfolders)
  const filesToDelete = allFiles.filter(file => {
    const filePath = file.metadata?._path || ''
    return filePath === folderPath || filePath.startsWith(`${folderPath}/`)
  })

  // Find all subdirectories with markerIds that need to be deleted
  const foldersToDelete = allFolders.filter(folder => {
    return (folder.path === folderPath || folder.path.startsWith(`${folderPath}/`)) && folder.markerId
  })

  // Delete all files in the folder
  const fileDeletePromises = filesToDelete.map(file =>
    FileStorageService.deleteFile(file.fileStorageId)
  )

  await Promise.all(fileDeletePromises)

  // Delete all virtual directory markers (including subdirectories)
  const folderDeletePromises = foldersToDelete.map(folder =>
    FileStorageService.deleteVirtualDirectory(folder.markerId!)
  )

  await Promise.all(folderDeletePromises)
  // End of Claude's edit
}
