# Develop

Chores

- Remove corepack enable in cicd as duplicate

## Client 2.1.5

Features

- Ability to analyze file from Files page

Fixes

- Drag over files page upload box would flicker

## Client 2.1.4

Features

- Add ability to set slicer api key, which exempts it from needing normal JWT Bearer token for login in headers.

Fixes

- Sorting grid by name (instead of showing by position) is not leaving gaps anymore.

## Client 2.1.3

Fixes

- Grid sort is now horizontal.

## Client 2.1.2

Features

- Grid can sort by name without leaving gaps, Shift+S is a shortcut for it.

Fixes

- Add Files Nav title (it was missing).

## Client 2.1.1

Features
 
- Printer grid and other pages share type and tag filter

Fixes

- Printer Tag filter is now of AND type. This makes more sense in its usage.

## Client 2.1.0

Features

- Auto place printers on grid
- Queue submit button in top bar panel

Fixes

- Extra camera and floor actions on printer list
- Camera advanced settings applied

## Client 2.0.1

Features

- Tag color system
- Tag management dialog with color picker
- Clickable floor/tag/camera chips to open edit dialogs
- Action menus on printer list for floors, tags, and cameras
- Job (and queue) page
- Queue top menu
- Files page
- Set complete/failed/cancelled/unknown on job page
- Job thumbnails viewer dialog
- Redesign navigation bars

Fixes

- Reordering floors now works
- YAML export dialog now exports exportTags
- Camera grid camera filter clear now works
- AppLoader will redirect properly even when VueRouter hasnt kicked in

## Client 2.0.0

Features

- Redesigned loader, error and disconnect page
- Implement reconnect loop triggered by app initiation and socketIO disconnect
- Redesign app snackbars
- Redesign file sidenav with composable
- Design new job page
- Design new dashboard page
- Redesign camera page
- Redesign all settings pages
- Implement (group) tag filtering on both printer page and printer list page
- Implement (group) tag filtering on camera, jobs and dashboard pages
- Export and import yaml upgraded
- Printer placement UX redesigned, removed GridDialog/GridSettings
- Add camera references to printer list
- Redesign Job Menu including Tag and Type filter
- Design new Printer Status Menu
- Redesign the floor settings page
- Implement capabilities feature to allow better UI customization for different printer types
- Redesign About page and move into settings
- Redesign First Time Setup page with shared HelpBanner across pages using new GitHub and Discord button components

Fixes

- The overlay scrim added connected to Vuetify theme
- The overlay does not allow clicking away, it is persistent and click animation is removed
- The HTML vertical scrollbar now auto instead of scroll (Vuetify _reset.scss problem)
- The HTML background now matches theme color
- Navigation logo alignment improved by centering and size constraints
- Page content height now calculated with 100% to avoid pixel discrepancies on Edge for Desktop
- Border of tile color was wrong
- Printer drop default border was wrong
- Disable printer tile ripple when printer not online
- Close side explorer or dialogs when server has suddenly disconnected
- OctoFarm import dialog upgraded to Vuetify3 and import flow has been fixed
- Overall code cleanup, printer tile progress bar fix
- Printer page action buttons now aligned (even if badge is present)
- Improved app error handling user friendliness
- Improve creating first printer
- Regression settings page should route to floor settings
- Regression YAML import would not trigger validation
- YAML import will not allow importing users, user roles, settings as that will lead to failure
- First Time Setup page uses new backend endpoint
- CreateUserDialog will not load user roles on mount anymore 
- FirstTimeSetup page too large, reduced in size
- Redirect from login to login prevented
- First time setup YAML import and manual setup will now trigger AppLoad through wizardCompleted
- Reimplement dialog context to be more strictly typed
- Remove AppConstants as it's not useful

Chores

- Replace sass with sass-embedded for increased compilation performance
- Remove dev splash screen
- Cleanup main.ts imports, add helpful CSS hints with vuetify-variables.d.css typing for Vuetify theme CSS variables
- Vite console doesnt clear screen anymore
- Add md icon set for more icons
- Split upload toolbar from PrinterGridView
- Remove bulk gcode feature - does not fit the overall design anymore 
- Clean up TopBar
- Rename backend group service to tag service
- Indicate on printer create that we're creating a printer on a floor
- Add tooltips to NavBar
- Share Discord and GitHub buttons as component across pages
- Share YAML Import summary for First Time Setup and YAML import dialog

## Client 0.0.27

Feature

- SocketIO debug page in settings

Fixes

- The frontend now only support number id types (dropping mongodb support)
- User Roles changes have been switched to role name strings

## Client 0.0.26

Fixes

- Remove unused printer group feature flag
- Remove unused typeorm feature flag

## Client 0.0.25

Fixes

- Splash logo is now FDMM logo instead of Vite logo


## Client 0.0.24

Feat

- Upgrade vite to 7.x

Fixes

- Vite/vitest config types fixed

## Client 0.0.23

Fixes

- Printer tile: 'No USB' label replaced with 'Unknown state'

## Client 0.0.22

Feature

- Detect server disconnects, presenting this in overlay message with page reload
- Ability to add startPrint to specify print or not after upload

Fixes

- Camera page wasn't flagged as requiring authentication
- SocketIO service now detects and handles expired JWT token
- SocketIO service now detects server disconnects and reconnects
- ServerProtectionSettings wouldn't validate refresh attempts correctly

Chore

- Cleaned up and rewrote SocketIO client
- Package updates

## Client 0.0.21

Feature

- Ability to set upload timeout separately

Chore

- Rename OctoPrint settings page to Printer

## Client 0.0.20

Feature 

- Introduce UI tweaks for FDM Monster 1.9 PrusaLink support

Fixes

- PrusaLink support should not be dependent on whether Klipper support is enabled. Fixed with new API subfeature, which was missing.

## Client 0.0.19

Chore

- Remove OctoPrint reference in "Refreshing OctoPrint connection state"
- Remove all unused feature flags - the features are not optional
 
## Client 0.0.18

Fixes

- Upload progress bar won't get stuck anymore, requires FDMM server 1.8.3 or higher!

# Client 0.0.17

## Chores

- Adjust server version api response (no more isPm2 or isNodemon flags)
- Backport: update emergency commands to latest version of Vue2 

## Fixes

- Delete files on printer details (sidenav) should be protected by a confirmation dialog.
- Emergency commands: server restart does not work - broken button removed
 
# Client 0.0.16

## Fixes

- Vuetify Tooltip: improve styling of tooltip for better legibility
- Settings: use constants settings map
- Printer tile: clicking on an empty tile should not enable grid mode

# Client 0.0.15

## Features

- Printer tile: re-implement compact tile, the opposite of large tile mode
- Printer tile: new printer button backported
- Printer grid, grid edit mode: adjust rows/cols buttons backported

# Client 0.0.14

## Features

- Printer list: add tooltips to printer list actions

## Fixes

- YAML dialog wouldn't reset error after re-opening
- Printer list - quick stop action: quick stop showed delete in alert, typo fixed

# Client 0.0.13

## Fixes

- Tile: add tooltips, fix: add pausing as paused state
- Print grid: floor toggle would de-synchronize with store
- Print grid: include new grid and tile design including thumbnail (and bugfixes)

# Client 0.0.12

## Fixes

- File delete/download: Deleting or downloading a file path is now encoded in url path
- Layout: theming, color reduction and imports -- backported from vue2 client
- Import dialog: broken import of OctoFarm import dialog
- PrinterList: updated action buttons to a more acceptable implementation
- OctoFarmImportDialog: roughly imported and converted dialog to Vuetify3 stepper
- Removed dialogsStore preferring useDialog composable

# Client 0.0.11

## Fixes

- Dialog avatar: undefined would sometimes appear in avatar (once or twice)
- File sidenav: avatar didnt render properly
- Printer dialog: Create printer would trigger update printer mode

# Client 0.0.10

## Fixes

- First-time setup: background was appearing above first-time-setup, not fixed and below
- Printer tile: port over removal change of S/SA/P printer subtitle and replace with Awaiting

# Client 0.0.9

## Features

- Remove whitelist settings from UI
- Introduce new grid layout
- Introduce grid settings dialog on home page

## Fixes

- Snackbar buttons look a bit better

# Client 0.0.8

## Fixes

- PrinterStore: when deleting a printer, an error is often presented that the PrinterStore contains no printer with such id
- AddOrUpdatePrinterDialog: auto-append https if this is missing in URL before submitting

## Features:

- User settings: create user dialog for an admin to conveniently share a new verified account with roles.

# Client 0.0.7

## Fixes:

- Account settings - cant change password
- Account settings - apply user id number to string coercion
 
# Client 0.0.6

## Features:

- User settings: add user roles dropdown to change verified users from GUEST role to OPERATOR or ADMIN.

# Client 0.0.5

## Fixes:

- Printer dialog: api key of 43 length should be allowed since OctoPrint 1.10.3
 
# Client 0.0.4

## Fixes:

- File model and upload api brought up-to-date

# Client 0.0.3

## Features:

- Added experimental settings page with client toggle

## Fixes

- Removed `debugger` statement from feature store

# Client 0.0.2

## Fix:

- Add .npmignore: ignore a bunch of code in NPM release

# Client 0.0.1

## Features:

- Added GHA workflows
- Published NPM package

## Fixes:

- Made it compile

# Client 0.0.0

Changes:

- yaml import dialog: convert to setup script

Fixes:

- yaml import: clear import file field when closing dialog
- yaml import: also clear import file field when an error has occurred during import
- yaml import: show an error message to provide context about why import has failed
