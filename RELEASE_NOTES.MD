# Develop

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
