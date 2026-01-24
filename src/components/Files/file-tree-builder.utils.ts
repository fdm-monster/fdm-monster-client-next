// Tree building utilities for FilesView
// Created by Claude on 2026.01.24

import { FileMetadata } from '@/backend/file-storage.service'

export interface FileTreeNode {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  depth: number
  file?: FileMetadata
  children?: FileTreeNode[]
  expanded?: boolean
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
    // edited by claude on 2026.01.24.14.55
    // Use the path from metadata (check common field names), default to fileName if not present
    const filePath = file.metadata?.path || file.metadata?._path || file.metadata?._originalFileName || file.fileName
    // End of Claude's edit
    const parts = filePath.split('/')
    let currentPath = ''
    let currentLevel = root

    // Build folder hierarchy
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      currentPath = currentPath ? `${currentPath}/${part}` : part

      if (!folderMap.has(currentPath)) {
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
      } else {
        currentLevel = folderMap.get(currentPath)!.children!
      }
    }

    // Add file node
    const fileName = parts[parts.length - 1]
    const fileNode: FileTreeNode = {
      id: file.fileStorageId,
      name: fileName,
      type: 'file',
      path: filePath,
      depth: parts.length - 1,
      file
    }
    currentLevel.push(fileNode)
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
