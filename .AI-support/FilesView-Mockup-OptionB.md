# FilesView Mockup - Option B: Collapsible Tree Navigation

## Layout Description

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ File Storage                                                                      [Refresh]        │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   [Search field]   │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Thumb │ Name                    │ Type │ Material │ Temps  │ Plates │ Time │ Filament │ Actions   │
├───────┼─────────────────────────┼──────┼──────────┼────────┼────────┼──────┼──────────┼───────────┤
│   -   │ ▼ 📁 projects           │  -   │    -     │   -    │   -    │  -   │    -     │ [...]     │
│   -   │   ▼ 📁 prints           │  -   │    -     │   -    │   -    │  -   │    -     │ [...]     │
│ [IMG] │     📄 test-cube.gco    │ 🔧   │  PLA     │ 🔥210° │   1    │ 2.5h │  15.2g   │ [Q][A][V] │
│ [IMG] │     📄 benchy.3mf       │ 🔧   │  PETG    │ 🔥230° │   1    │ 4.1h │  28.5g   │ [Q][A][V] │
│   -   │   ▶ 📁 models           │  -   │    -     │   -    │   -    │  -   │    -     │ [...]     │
│   -   │ ▶ 📁 prototypes         │  -   │    -     │   -    │   -    │  -   │    -     │ [...]     │
│ [IMG] │ 📄 calibration.gcode    │ 🔧   │  ABS     │ 🔥245° │   1    │ 1.2h │  8.1g    │ [Q][A][V] │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Behavior

### Navigation
- **Click folder chevron (▶/▼)** → Expand/collapse folder
- **Tree indentation** → Shows hierarchy visually
- **Multiple folders expanded** → Can see multiple branches at once

### Metadata Columns
Each file row displays (same as Option A):
- **Thumb**: Default thumbnail image (40x40px) or "-" for folders
- **Name**: Chevron (for folders) + icon + name (indented by depth)
- **Type**: Printer type logo or "-" for folders
- **Material**: Filament type chip or "-"
- **Temps**: Nozzle/bed temps or "-"
- **Plates**: Number of plates or "-"
- **Time**: Print time or "-"
- **Filament**: Grams used or "-"
- **Actions**: Queue, Analyze, View, Delete buttons (folders show folder actions)

### Additional Features
- **Expand/Collapse All** button (top right)
- **Remember expansion state** (localStorage)
- **Drag & drop to move** files between folders (future enhancement)

### Advantages
- See full hierarchy at a glance
- Quick access to any file without changing view
- Visual context of file organization
- Easy to reorganize with drag & drop (future)
- Similar to FileExplorerSideNav (consistency)

### Disadvantages
- Can become visually cluttered with many nested folders
- Harder to scan when many folders are expanded
- Name column needs extra width for indentation
- More complex scrolling behavior
