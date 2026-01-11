# Screenshot Test Coverage

This document tracks which views and components are covered by screenshot tests.

## Authentication & Onboarding

### First Time Setup
- [x] Wizard page
- [ ] Step 1 - Welcome
- [ ] Step 2 - Server configuration
- [ ] Step 3 - Admin account creation
- [ ] Step 4 - Complete

### Login
- [x] Login page (empty)
- [x] Login page (filled)
- [ ] Login error state
- [ ] Password reset link

### Registration
- [x] Registration page (empty)
- [x] Registration page (filled)
- [ ] Registration validation errors
- [ ] Registration disabled state

---

## Main Views

### Dashboard
- [x] Dashboard overview
- [x] Dashboard with statistics
- [x] Dashboard with recent activity
- [x] Dashboard empty state
- [ ] Individual stat cards
- [ ] Recent activity list items
- [ ] Quick actions panel

### Printer Grid
- [x] Empty grid (no floors)
- [x] Grid with floors and printers
- [x] Create First Floor button (empty state)
- [x] Create Floor dialog
- [x] Create Printer dialog (via list page)
- [x] Printer grid tiles
- [x] Drag hint/hover state
- [x] Batch operations bar
- [x] Context menu
- [ ] File upload progress snackbar
- [ ] Dragging GCode onto printer
- [ ] Printer tile loading state
- [ ] Printer tile error state
- [ ] Printer tile printing state
- [ ] Printer tile idle state

#### Printer Grid - Toolbar
- [x] Floor selection tabs
- [x] Tag filter dropdown
- [x] Printer type filter dropdown
- [x] Sort mode toggle (position/name)
- [ ] Auto Place button (with unplaced printers)
- [ ] Unplaced printers menu
- [ ] Grid size controls
- [x] Grid settings menu

### Printer List
- [x] List view with printers
- [x] Empty state
- [x] Create printer button
- [x] Printer data table
- [ ] Printer row expanded view
- [ ] Printer actions menu
- [ ] Tag chips on printer
- [ ] Floor assignment
- [ ] Camera assignment
- [ ] Printer type column
- [ ] Printer status column
- [ ] Last seen column
- [ ] Batch selection
- [ ] Search/filter bar

### Camera Grid
- [x] Camera grid with cameras
- [x] Empty state
- [x] Create camera dialog
- [ ] Camera tile
- [ ] Camera tile loading state
- [ ] Camera tile error state
- [ ] Fullscreen camera view
- [ ] Camera settings menu

### Print Jobs
- [x] Jobs list
- [x] Empty state
- [x] Job details dialog
- [x] Filter by status
- [ ] Job card/list item
- [ ] Job progress bar
- [ ] Job actions menu
- [ ] Job statistics

### Queue
- [x] Queue with jobs
- [x] Empty queue
- [x] Reordering items
- [x] Context menu
- [ ] Queue item details
- [ ] Move to top/bottom actions
- [ ] Remove from queue

### Files
- [x] File browser
- [x] Empty state
- [x] File upload
- [x] Grid view
- [x] List view
- [x] File context menu
- [x] Print dialog from file
- [ ] File card/list item
- [ ] Folder navigation
- [ ] File search
- [ ] File details panel
- [ ] File preview

---

## Settings Pages

### Settings Overview
- [x] Settings navigation menu
- [x] Settings home/overview

### Floors Settings
- [x] Floor list with drag-to-reorder
- [x] Create New Floor button
- [ ] Floor expansion panel (expanded)
- [ ] Edit floor name inline
- [ ] Edit floor order inline
- [ ] Delete floor button
- [ ] Manage on grid button

### Printer Settings
- [x] Printer default settings page
- [ ] Printer timeout settings
- [ ] Printer defaults form
- [ ] API polling interval
- [ ] Temperature check interval

### Emergency Commands Settings
- [x] Emergency commands page
- [ ] M112 emergency stop section
- [ ] Custom emergency commands
- [ ] Emergency command editor

### Server Protection Settings
- [x] Server protection page
- [ ] Login required toggle
- [ ] Registration enabled toggle
- [ ] Whitelist settings
- [ ] IP whitelist table

### User Management Settings
- [x] User list
- [ ] User table/cards
- [ ] User roles display
- [ ] Create user button
- [ ] Edit user dialog
- [ ] Delete user confirmation
- [ ] User permissions matrix

### Account Settings
- [x] Account settings page
- [ ] Change password form
- [ ] Update profile form
- [ ] Session management

### Software Upgrade Settings
- [x] Software upgrade page
- [ ] Current version display
- [ ] Check for updates button
- [ ] Upgrade available notification
- [ ] Upgrade progress

### Diagnostics Settings
- [x] Diagnostics page
- [ ] Sentry diagnostics toggle
- [ ] Log viewer
- [ ] System information
- [ ] Database stats

### Experimental Settings
- [x] Experimental features page
- [ ] Feature flags list
- [ ] Multi-camera support toggle
- [ ] Experimental client support toggle
- [ ] Moonraker support toggle
- [ ] PrusaLink support toggle

### Slicer Integration Settings
- [x] Slicer integration page
- [ ] Upload to slicer settings
- [ ] Slicer API configuration

### SocketIO Debug Settings
- [x] SocketIO debug page
- [ ] Connection status
- [ ] Message log
- [ ] Event inspector

### About Settings
- [x] About page
- [ ] Version information
- [ ] License information
- [ ] Credits
- [ ] Links to documentation

---

## Dialogs & Modals

### Printer Dialogs
- [x] Add/Update Printer Dialog - Create mode
- [ ] Add/Update Printer Dialog - Edit mode
- [ ] Add/Update Printer Dialog - Duplicate mode
- [ ] Printer Test Connection Dialog
- [ ] Printer Type Dropdown
- [ ] Force Save Warning Dialog
- [ ] Printer Control Dialog
- [ ] Printer Settings Dialog

### Floor Dialogs
- [x] Add/Update Floor Dialog - Create mode
- [ ] Add/Update Floor Dialog - Edit mode
- [ ] Edit Floor Panel (side panel)
- [ ] Delete Floor Confirmation

### Camera Dialogs
- [x] Add/Update Camera Dialog - Create mode
- [ ] Add/Update Camera Dialog - Edit mode
- [ ] Delete Camera Confirmation

### File Dialogs
- [x] File Upload Dialog
- [ ] File Details Dialog
- [ ] File Print Dialog
- [ ] Delete File Confirmation
- [ ] File Preview Dialog

### Tag Dialogs
- [ ] Manage Tags Dialog
- [ ] Create Tag Dialog
- [ ] Edit Tag Dialog
- [ ] Delete Tag Confirmation

### Import/Export
- [ ] YAML Import Panel
- [ ] YAML Export Panel
- [ ] OctoFarm Import Panel
- [ ] Import Preview

### Job Dialogs
- [x] Job Details Dialog
- [ ] Start Print Dialog
- [ ] Stop Print Confirmation

---

## Menus & Dropdowns

### Context Menus
- [x] Printer context menu (grid)
- [x] Printer context menu (list)
- [x] File context menu
- [x] Job context menu
- [x] Queue item context menu
- [ ] Camera context menu
- [ ] Tag context menu

### Dropdown Menus
- [x] Printer Type Dropdown
- [x] Tag Filter Dropdown
- [x] Printer Type Filter Dropdown
- [ ] Floor Dropdown
- [ ] Camera Dropdown
- [ ] Sort Options Dropdown

### Action Menus
- [ ] Jobs Menu (bulk actions)
- [ ] Printer Status Menu
- [ ] Batch Operations Menu

---

## UI Components

### Navigation
- [ ] Top navigation bar
- [ ] Sidebar navigation
- [ ] Breadcrumbs
- [ ] Mobile navigation drawer

### Common Elements
- [ ] Loading spinners
- [ ] Error messages
- [ ] Success snackbars
- [ ] Warning alerts
- [ ] Info tooltips
- [ ] Empty state illustrations
- [ ] Skeleton loaders

### Forms
- [x] Login form
- [x] Registration form
- [x] Create printer form
- [x] Create floor form
- [x] Create camera form
- [ ] Search bars
- [ ] Filter panels
- [ ] Validation error states

---

## Summary Statistics

### Overall Coverage
- **Total Test Suites**: 11 (00-10)
- **Total Screenshot Tests**: 76
- **Main Views Covered**: 9/9 (100%)
- **Settings Pages Covered**: 13/13 (100%)
- **Major Dialogs Covered**: ~30%
- **Component Variations Covered**: ~25%

### Coverage by Category
- ✅ **Authentication**: 5/5 tests (100%)
- ✅ **Dashboard**: 4/4 tests (100%)
- ⚠️ **Printer Grid**: 7/15 possible (47%)
- ⚠️ **Printer List**: 8/12 possible (67%)
- ⚠️ **Camera Grid**: 6/8 possible (75%)
- ✅ **Print Jobs**: 7/7 tests (100%)
- ✅ **Queue**: 5/5 tests (100%)
- ⚠️ **Files**: 8/10 possible (80%)
- ✅ **Settings**: 13/13 tests (100%)
- ⚠️ **Dialogs**: 13/30+ possible (~43%)

### Priority for Next Tests
1. **High Priority** - Missing critical UI states:
   - [ ] Printer tile states (printing, idle, error)
   - [ ] Dialog edit modes (update vs create)
   - [ ] Error states and validation
   - [ ] Loading states

2. **Medium Priority** - Nice to have variations:
   - [ ] Component hover/focus states
   - [ ] Expanded/collapsed states
   - [ ] Mobile/responsive views
   - [ ] Dark mode variations

3. **Low Priority** - Edge cases:
   - [ ] Empty states for all lists
   - [ ] Maximum capacity states
   - [ ] Network error states
   - [ ] Permission denied states

---

## Notes

- All tests currently run in **Desktop Chrome only** at **1920x1080**
- **Socket.IO data injection** is used to populate floors and printers
- **API mocking** is used for all HTTP endpoints
- **Camera streams** are mocked with placeholder images
- Tests use **headed mode** for debugging with `yarn screenshots:headed`

## Future Enhancements

- [ ] Add responsive testing (mobile/tablet viewports)
- [ ] Add visual regression testing (compare against baselines)
- [ ] Add tests for printer state transitions
- [ ] Add tests for real-time updates (via Socket.IO)
- [ ] Add tests for error boundary states
- [ ] Add tests for loading states
- [ ] Add dark mode variations
- [ ] Add accessibility testing
