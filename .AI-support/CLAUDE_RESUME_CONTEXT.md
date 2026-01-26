# Claude Code Standards & Resume Context

**Last Updated**: 2026-01-25
**Project**: fdm-monster-client-next
**Branch**: tree-view-file-manager
**Framework**: Vue 3 + Vuetify 3 + TypeScript (Composition API)

---

## CODE FORMATTING & STYLE RULES

### 1. Edit Documentation (MANDATORY)
All code modifications must be marked with timestamps:

```typescript
// Single-line edit:
const foo = bar; // edited by claude on YYYY.MM.DD.HH.MM

// Multi-line edit:
function example() {
  // edited by claude on YYYY.MM.DD.HH.MM
  const a = 1;
  const b = 2;
  return a + b;
  // End of Claude's edit
}
```

### 2. File Organization
- **New functions**: Create separate files in the same directory
- **Utilities**: Use `*.utils.ts` suffix
- **Composables**: Use `*.composable.ts` suffix
- **Components**: PascalCase `.vue` files

### 3. Code Style
- TypeScript with strict typing
- Composition API (setup script)
- Explicit imports (no wildcards)
- Destructure composables: `const { executeOperation } = useFileOperationFeedback()`

---

## PROJECT CONTEXT

### Current Implementation: Tree View File Manager

**Status**: Phase 3 Complete (File & Folder Moving)
**Goal**: Replace flat file list with hierarchical tree view for 3D printer file management

#### Virtual File System
- Files stored as OID-based blobs with JSON metadata
- Paths stored in `fileName` field
- Path resolution priority:
  ```typescript
  metadata.path || metadata._path || metadata._originalFileName || fileName
  ```

#### Tree Structure
- Custom CSS Grid-based tree table
- Replaced v-data-table for better control
- Hierarchical folders with expand/collapse
- Metadata columns aligned with files

---

## IMPLEMENTATION PHASES

- ✅ **Phase 1**: UI Feedback System
- ✅ **Phase 2**: Basic Rename
- ✅ **Phase 3**: File & Folder Moving
- ✅ **Phase 4**: Folder Operations (rename, create, delete) - **JUST COMPLETED**
- ✅ **Phase 5**: Drag & Drop

---

## KEY FILES & ARCHITECTURE

### Core Utilities
| File | Purpose |
|------|---------|
| `file-tree-builder.utils.ts` | Tree building, flattening, expand/collapse |
| `file-management.utils.ts` | File/folder operations (move, rename, validate) |
| `file-operations-feedback.composable.ts` | Reusable feedback system |

### Components
| Component | Purpose |
|-----------|---------|
| `FilesView.vue` | Main tree view component |
| `FileOperationLoadingOverlay.vue` | Loading overlay for operations |
| `FileRenameDialog.vue` | File rename dialog |
| `FileMoveDialog.vue` | File move dialog (2 tabs: manual + select) |
| `FolderMoveDialog.vue` | Folder move with circular prevention |
| `FolderRenameDialog.vue` | Folder rename dialog |
| `CreateFolderDialog.vue` | Create new folder dialog |
| `FolderDeleteDialog.vue` | Delete folder confirmation dialog |

### Key Functions Reference

**File Operations** (`file-management.utils.ts`):
- `renameFile(fileStorageId, currentPath, newName)` - Rename single file
- `moveFile(fileStorageId, newPath)` - Move single file
- `moveFolder(oldPath, newPath, allFiles)` - Move folder + all contents
- `renameFolder(oldPath, newName, allFiles)` - Rename folder + update all child paths
- `createFolder(folderPath)` - Create empty virtual directory
- `deleteFolder(folderPath, allFiles, markerId?)` - Delete folder + all contents
- `validatePath(path)` - Validate path (allows empty string for root)

**Tree Operations** (`file-tree-builder.utils.ts`):
- `buildFileTree(files)` - Build hierarchical tree from flat file list
- `flattenTree(nodes)` - Flatten tree to array
- `toggleNodeExpansion(nodes, nodeId)` - Toggle folder open/closed
- `expandAllNodes(nodes)` / `collapseAllNodes(nodes)` - Bulk operations

**Feedback System** (`file-operations-feedback.composable.ts`):
- `executeOperation(type, loadingMsg, successMsg, operation)` - Run with feedback
- `completeOperation(successMsg)` - Mark success
- `failOperation(error)` - Handle errors

---

## BACKEND INTEGRATION

### File Update Endpoint
**Endpoint**: `PATCH /api/v2/file-storage/:fileStorageId`
**Updates**: `fileName` and/or `metadata` fields
**Service**: `FileStorageService.updateFileMetadata()`

### Virtual Directory Endpoints (Phase 4)
**Create**: `POST /api/v2/file-storage/virtual-directories`
- Body: `{ path: "folder/path" }`
- Returns: `{ markerId, path }`

**Delete**: `DELETE /api/v2/file-storage/virtual-directories/:markerId`
- Removes empty folder marker

**List**: `GET /api/v2/file-storage/virtual-directories`
- Returns all empty virtual directories

**Tree**: `GET /api/v2/file-storage/directory-tree`
- Returns complete hierarchical tree structure

---

## ISSUES RESOLVED

| Issue | Location | Solution |
|-------|----------|----------|
| `snackbar.success` not a function | `file-operations-feedback.composable.ts:45` | Changed to `snackbar.info()` |
| Thumbnail display broken | `FilesView.vue:168-191` | Changed to `thumbnails?.length > 0` |
| Root path disabled | `file-management.utils.ts:130-132` | Allow empty string in validatePath() |
| Hidden rename function | `FilesView.vue:323-353` | Created file management submenu |
| Folders can't be moved | Multiple files | Implemented FolderMoveDialog |

---

## NEXT STEPS

All phases complete! Ready for comprehensive testing:

1. **Test Phase 4 Features**
   - Create new folder (root and nested) ✅
   - Create subfolder from folder menu ✅
   - Rename folder and verify all child paths update
   - Delete folder with confirmation ✅
   - Verify empty folder persistence ✅

2. **Known Issues / Future Enhancements**
   - **File Move Dialog**: "Select Folder" dropdown only shows top-level directories, not nested folders
     - Current location: `FilesView.vue:1164-1173` (`availableFoldersForMove` computed)
     - Shows all folders but may need hierarchical display for better UX
     - Note: This was recently fixed to show virtual directories, but nested folder display could be improved
   - Batch operations (multi-select)
   - Copy/duplicate files
   - Folder sorting options
   - Search within folders
   - Tree expansion state preservation across operations

---

## RESPONSE GUIDELINES

### Verbosity
- **Concise**: 1-4 lines for simple tasks
- **Direct**: No unnecessary preamble/postamble
- **Complete**: Provide all necessary information
- Match detail level to task complexity

### Examples
```
User: what files are in src/?
Assistant: [runs ls] foo.c, bar.c, baz.c

User: which file contains foo implementation?
Assistant: src/foo.c
```

### Tool Usage
- Use TodoWrite for complex tasks (3+ steps)
- Batch independent tool calls in single message
- Prefer specialized tools over bash (Read vs cat, Edit vs sed)
- Never use bash/comments to communicate with user

### Code References
Reference code with `file:line` format:
```
Clients are marked as failed in connectToServer() at src/services/process.ts:712
```

---

## ENVIRONMENT

- **Working Dir**: `/Users/jaysen/git/fdm-monster-client-next`
- **Branch**: `tree-view-file-manager`
- **Main Branch**: `main`
- **Platform**: macOS (Darwin 24.6.0)
- **Model**: Claude Sonnet 4.5

---

## GIT STATUS (Current)

```
Current branch: tree-view-file-manager
Main branch: main

Staged:
R  CHAT_RESUME_2026-01-24.md -> .AI-support/CHAT_RESUME_2026-01-24.md
R  src/components/Files/FilesView-Mockup-OptionA.md -> .AI-support/FilesView-Mockup-OptionA.md
R  src/components/Files/FilesView-Mockup-OptionB.md -> .AI-support/FilesView-Mockup-OptionB.md
R  src/components/Files/IMPLEMENTATION_STATUS.md -> .AI-support/IMPLEMENTATION_STATUS.md

Recent commits:
- 8bd057e: Fix merge conflict syntax errors
- fb0d5a6: Merge main into tree-view-file-manager
- efcb1ec: Merge PR #1470 (gcode thumbnails)
```

---

## RESUME CHECKLIST

When resuming work:

1. ✅ Read this document
2. ✅ Check git status and recent commits
3. ✅ Ask user for current needs/test results
4. ✅ Follow code formatting rules (timestamped comments)
5. ✅ Use TodoWrite for multi-step tasks
6. ✅ Keep responses concise
7. ✅ Update documentation as phases complete

---

## SPECIAL INSTRUCTIONS

### Security
- Assist with defensive security only
- Refuse malicious code requests
- No credential harvesting tools

### Proactiveness
- Only be proactive when user requests action
- Answer questions before taking actions
- Don't surprise user with unrequested changes

### Professional Objectivity
- Prioritize technical accuracy over validation
- Correct errors objectively
- Investigate uncertainty before confirming beliefs
