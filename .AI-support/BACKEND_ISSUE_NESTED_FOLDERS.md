# Backend Issue: Nested Virtual Directory Creation

## Problem Description

When creating a nested virtual directory path like "a/b/c" via a single POST request to `/api/v2/file-storage/virtual-directories`, the backend currently only creates a single virtual directory marker for the **leaf folder** ("c"), but not for the intermediate folders ("a" and "a/b").

## Current Behavior

**Request:**
```json
POST /api/v2/file-storage/virtual-directories
{
  "path": "a/b/c"
}
```

**Response:**
```json
{
  "message": "Virtual directory created",
  "markerId": "c81e888a-0839-439d-8526-752a076b0daa",
  "path": "a/b/c"
}
```

**Directory Tree Result:**
```json
{
  "path": "a",
  "name": "a",
  "type": "directory",
  "children": [{
    "path": "a/b",
    "name": "b",
    "type": "directory",
    "children": [{
      "path": "a/b/c",
      "name": "c",
      "type": "directory",
      "markerId": "c81e888a-0839-439d-8526-752a076b0daa"  // Only leaf has markerId
    }]
  }]
}
```

## Expected Behavior

When creating nested path "a/b/c", the backend should create virtual directory markers for **ALL** intermediate folders, not just the leaf:

**Expected Directory Tree Result:**
```json
{
  "path": "a",
  "name": "a",
  "type": "directory",
  "markerId": "uuid-for-a",  // Should have markerId
  "children": [{
    "path": "a/b",
    "name": "b",
    "type": "directory",
    "markerId": "uuid-for-a-b",  // Should have markerId
    "children": [{
      "path": "a/b/c",
      "name": "c",
      "type": "directory",
      "markerId": "c81e888a-0839-439d-8526-752a076b0daa"  // Has markerId
    }]
  }]
}
```

## Impact on Frontend

Without markerIds for intermediate folders:

1. **Incorrect folder counts**: When deleting "a", the UI shows "0 folders" instead of "2 folders" (b and c)
2. **Incomplete deletion**: Deleting "a" only removes the file and "c" marker, leaving empty "a" and "a/b" folders
3. **Inconsistent state**: Folders appear in the tree but have no backing virtual directory markers

## API Documentation Conflict

The documentation at `/Users/jaysen/git/fdm-monster/.AI-support/VIRTUAL_DIRECTORY_API.md` line 177 states:

> **"Creating 'a/b/c' automatically creates parent directories in tree"**

This suggests the backend should handle nested creation properly, but currently it only creates the leaf marker.

## Requested Fix

Please update the POST `/api/v2/file-storage/virtual-directories` endpoint to:

1. Split the input path into segments (e.g., "a/b/c" → ["a", "b", "c"])
2. Create virtual directory markers for each intermediate path:
   - Create marker for "a"
   - Create marker for "a/b"
   - Create marker for "a/b/c"
3. Return the markerId of the deepest folder (or optionally return all created markerIds)

## Implementation Suggestion

```typescript
// Pseudocode for backend fix
async function createVirtualDirectory(path: string) {
  const segments = path.split('/').filter(s => s.length > 0)
  const markerIds = []

  for (let i = 0; i < segments.length; i++) {
    const currentPath = segments.slice(0, i + 1).join('/')

    // Check if marker already exists for this path
    const existing = await findVirtualDirectory(currentPath)
    if (!existing) {
      const markerId = await createMarkerFile(currentPath)
      markerIds.push({ path: currentPath, markerId })
    }
  }

  // Return the deepest folder's markerId
  return markerIds[markerIds.length - 1]
}
```

## Testing

After implementing the fix, test with:

1. Create "a/b/c" via single POST request
2. Call GET `/api/v2/file-storage/directory-tree`
3. Verify all three folders have markerIds:
   - "a" has markerId
   - "a/b" has markerId
   - "a/b/c" has markerId
4. Delete "a" and verify all three markers are cleaned up

## Frontend Workaround

I've implemented a frontend workaround that splits nested paths and makes sequential POST requests for each level. However, this is inefficient and creates unnecessary network overhead. The proper fix should be in the backend to match the documented behavior.

---

**Priority**: Medium
**Affects**: Nested folder creation, deletion, and folder counting
**Frontend workaround**: Implemented in `file-management.utils.ts` line 48-69
