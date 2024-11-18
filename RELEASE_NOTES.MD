# Develop 

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
