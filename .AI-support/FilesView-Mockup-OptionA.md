# FilesView Mockup - Option A: Click-Into Navigation

## Layout Description

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│ File Storage                                                                   [Refresh]       │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ Breadcrumb: Home > projects > prints                                          [Search field]  │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ Thumb │ Name              │ Type │ Material │ Temps  │ Plates │ Time │ Filament │ Actions    │
├───────┼───────────────────┼──────┼──────────┼────────┼────────┼──────┼──────────┼────────────┤
│   -   │ 📁 models         │  -   │    -     │   -    │   -    │  -   │    -     │ [...]      │
│   -   │ 📁 prototypes     │  -   │    -     │   -    │   -    │  -   │    -     │ [...]      │
│ [IMG] │ 📄 test-cube.gco  │ 🔧   │  PLA     │ 🔥210° │   1    │ 2.5h │  15.2g   │ [Q][A][V]  │
│ [IMG] │ 📄 benchy.3mf     │ 🔧   │  PETG    │ 🔥230° │   1    │ 4.1h │  28.5g   │ [Q][A][V]  │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Behavior

### Navigation
- **Click on folder row** → Navigate into that folder
- **Breadcrumb links** → Navigate back to parent folders
- **Root view** → Shows all top-level folders and files

### Metadata Columns
Each file row displays:
- **Thumb**: Default thumbnail image (40x40px) or "-" for folders
- **Name**: Folder icon or file icon + name
- **Type**: Printer type logo (OctoPrint, Bambu, etc.) or "-" for folders
- **Material**: Filament type chip or "-"
- **Temps**: Nozzle/bed temps or "-"
- **Plates**: Number of plates or "-"
- **Time**: Print time or "-"
- **Filament**: Grams used or "-"
- **Actions**: Queue, Analyze, View, Delete buttons (folders show folder actions)

### Advantages
- Simple, familiar navigation pattern (like file explorer)
- Clean view - only show current directory contents
- Less cognitive load - focus on one level at a time
- Easy to scan metadata in table format

### Disadvantages
- Can't see full hierarchy at once
- More clicks to navigate deep folders
- No visual context of where files are in relation to siblings
