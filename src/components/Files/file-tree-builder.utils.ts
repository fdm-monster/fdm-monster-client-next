// Tree building utilities for FilesView
// Created by Claude on 2026.01.24

import { FileMetadata, DirectoryTreeNode } from '@/backend/file-storage.service'

export interface FileTreeNode {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  depth: number
  file?: FileMetadata
  children?: FileTreeNode[]
  expanded?: boolean
  markerId?: string // edited by claude on 2026.01.25.14.50 - For empty virtual directories
  fileCount?: number // edited by claude on 2026.01.25.14.50 - Number of files in folder
}

/**
 * Builds a hierarchical tree structure from a flat list of files based on their path metadata
 * @param files - Array of FileMetadata objects with path information
 * @returns Array of root-level FileTreeNode objects
 */
export function buildFileTree(files: FileMetadata[]): FileTreeNode[] {
  const root: FileTreeNode[] = []
  const folderMap = new Map<string, FileTreeNode>()

  files.forEach((file) => {
    // edited by claude on 2026.01.24.19.05
    // Use metadata._path for folder structure and _originalFileName for display
    let folderPath = file.metadata?._path || '' // e.g., "projects/boats" or "" for root
    let originalFileName = file.metadata?._originalFileName || file.fileName

    // If _originalFileName contains a path, extract it
    if (originalFileName.includes('/')) {
      const lastSlashIndex = originalFileName.lastIndexOf('/')
      const pathFromFileName = originalFileName.substring(0, lastSlashIndex)
      const justFileName = originalFileName.substring(lastSlashIndex + 1)

      // If _path is empty but _originalFileName has a path, use it
      if (!folderPath) {
        folderPath = pathFromFileName
      }
      originalFileName = justFileName
    }

    let currentPath = ''
    let currentLevel = root

    // Build folder hierarchy from _path
    if (folderPath) {
      const folderParts = folderPath.split('/')
      for (let i = 0; i < folderParts.length; i++) {
        const part = folderParts[i]
        currentPath = currentPath ? `${currentPath}/${part}` : part

        if (folderMap.has(currentPath)) {
          currentLevel = folderMap.get(currentPath)!.children!
        } else {
          const folderNode: FileTreeNode = {
            id: `folder-${currentPath}`,
            name: part,
            type: 'folder',
            path: currentPath,
            depth: i,
            children: [],
            expanded: false
          }
          folderMap.set(currentPath, folderNode)
          currentLevel.push(folderNode)
          currentLevel = folderNode.children!
        }
      }
    }

    // Add file node
    const fullPath = folderPath ? `${folderPath}/${originalFileName}` : originalFileName
    const fileNode: FileTreeNode = {
      id: file.fileStorageId,
      name: originalFileName,
      type: 'file',
      path: fullPath,
      depth: folderPath ? folderPath.split('/').length : 0,
      file
    }
    currentLevel.push(fileNode)
    // End of Claude's edit
  })

  // Sort: folders first, then alphabetically
  sortTreeNodes(root)

  return root
}

/**
 * Recursively sorts tree nodes: folders first, then alphabetically by name
 * @param nodes - Array of FileTreeNode objects to sort
 */
function sortTreeNodes(nodes: FileTreeNode[]) {
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  nodes.forEach(node => {
    if (node.children) sortTreeNodes(node.children)
  })
}

/**
 * Flattens a tree structure into a list while respecting expansion state
 * @param nodes - Array of root FileTreeNode objects
 * @returns Flattened array of visible nodes
 */
export function flattenTree(nodes: FileTreeNode[]): FileTreeNode[] {
  const result: FileTreeNode[] = []

  function traverse(nodeList: FileTreeNode[]) {
    nodeList.forEach(node => {
      result.push(node)
      if (node.type === 'folder' && node.expanded && node.children) {
        traverse(node.children)
      }
    })
  }

  traverse(nodes)
  return result
}

/**
 * Toggles the expanded state of a folder node
 * @param nodes - Array of tree nodes
 * @param nodeId - ID of the node to toggle
 * @returns Updated array of tree nodes
 */
export function toggleNodeExpansion(nodes: FileTreeNode[], nodeId: string): FileTreeNode[] {
  return nodes.map(node => {
    if (node.id === nodeId) {
      return { ...node, expanded: !node.expanded }
    }
    if (node.children) {
      return { ...node, children: toggleNodeExpansion(node.children, nodeId) }
    }
    return node
  })
}

/**
 * Expands all folder nodes in the tree
 * @param nodes - Array of tree nodes
 * @returns Updated array with all folders expanded
 */
export function expandAllNodes(nodes: FileTreeNode[]): FileTreeNode[] {
  return nodes.map(node => {
    if (node.type === 'folder') {
      return {
        ...node,
        expanded: true,
        children: node.children ? expandAllNodes(node.children) : []
      }
    }
    return node
  })
}

/**
 * Collapses all folder nodes in the tree
 * @param nodes - Array of tree nodes
 * @returns Updated array with all folders collapsed
 */
export function collapseAllNodes(nodes: FileTreeNode[]): FileTreeNode[] {
  return nodes.map(node => {
    if (node.type === 'folder') {
      return {
        ...node,
        expanded: false,
        children: node.children ? collapseAllNodes(node.children) : []
      }
    }
    return node
  })
}

/**
 * Converts backend DirectoryTreeNode to frontend FileTreeNode format
 * @param backendNode - Node from backend directory-tree endpoint
 * @param depth - Current depth in tree (0 for root)
 * @returns Converted FileTreeNode
 */
// edited by claude on 2026.01.25.15.28
export function convertBackendTreeNode(backendNode: DirectoryTreeNode, depth: number = 0): FileTreeNode {
  const isDirectory = backendNode.type === 'directory'

  const node: FileTreeNode = {
    id: isDirectory ? `folder-${backendNode.path}` : backendNode.fileStorageId!,
    name: backendNode.name,
    type: isDirectory ? 'folder' : 'file',
    path: backendNode.path,
    depth,
    expanded: false
  }

  // For directories, convert children
  if (isDirectory && backendNode.children) {
    node.children = backendNode.children.map(child =>
      convertBackendTreeNode(child, depth + 1)
    )
    node.fileCount = countFilesInNode(node)
    // edited by claude on 2026.01.25.15.39 - Extract markerId for empty virtual directories
    if (backendNode.markerId) {
      node.markerId = backendNode.markerId
    }
    // End of Claude's edit
  }

  // For files, create FileMetadata object from backend data
  if (!isDirectory && backendNode.fileStorageId) {
    node.file = {
      fileStorageId: backendNode.fileStorageId,
      fileName: backendNode.name,
      fileFormat: backendNode.name.split('.').pop() || '',
      fileSize: backendNode.metadata?.fileSize || 0,
      fileHash: backendNode.metadata?.fileHash || '',
      createdAt: backendNode.metadata?.createdAt || new Date(),
      thumbnails: backendNode.metadata?.thumbnails || [],
      metadata: backendNode.metadata
    } as FileMetadata
  }

  return node
}

/**
 * Converts backend tree root to array of FileTreeNodes
 * @param backendTree - Tree from backend directory-tree endpoint
 * @returns Array of root-level FileTreeNodes
 */
export function convertBackendTree(backendTree: DirectoryTreeNode): FileTreeNode[] {
  // Backend returns a root node with children
  // We want to return the children as the root array
  if (backendTree.children) {
    return backendTree.children.map(child => convertBackendTreeNode(child, 0))
  }
  return []
}

/**
 * Counts total number of files in a tree node (recursive)
 */
function countFilesInNode(node: FileTreeNode): number {
  let count = 0
  if (node.type === 'file') {
    return 1
  }
  if (node.children) {
    for (const child of node.children) {
      count += countFilesInNode(child)
    }
  }
  return count
}
// End of Claude's edit
