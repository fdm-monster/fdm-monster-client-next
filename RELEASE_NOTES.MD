# Develop

Chores

- Adjust server version api response (no more isPm2 or isNodemon flags)

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
