import { OctoPrintType, MoonrakerType, PrusaLinkType, BambuType } from './printer-types.constants'

export interface PrinterCapabilities {
  hasSerialConnection: boolean      // Can connect/disconnect via serial/USB
  canSyncName: boolean               // Can sync name from FDM Monster to printer
  hasWebInterface: boolean           // Has accessible web interface to redirect to
  hasEmergencyStop: boolean          // Has emergency/quick stop (more aggressive than normal stop)
  hasPrinterControl: boolean         // Can control printer remotely (pause, resume, etc.)
}

const OCTOPRINT_CAPABILITIES: PrinterCapabilities = {
  hasSerialConnection: true,
  canSyncName: true,
  hasWebInterface: true,
  hasEmergencyStop: true,
  hasPrinterControl: true
}

const MOONRAKER_CAPABILITIES: PrinterCapabilities = {
  hasSerialConnection: false,
  canSyncName: false,
  hasWebInterface: false,
  hasEmergencyStop: true,
  hasPrinterControl: true
}

const PRUSALINK_CAPABILITIES: PrinterCapabilities = {
  hasSerialConnection: false,
  canSyncName: false,
  hasWebInterface: true,
  hasEmergencyStop: false,
  hasPrinterControl: false         // PrusaLink doesn't support remote control
}

const BAMBU_CAPABILITIES: PrinterCapabilities = {
  hasSerialConnection: false,
  canSyncName: false,
  hasWebInterface: false,
  hasEmergencyStop: false,
  hasPrinterControl: true
}

const CAPABILITIES_MAP: Record<number, PrinterCapabilities> = {
  [OctoPrintType]: OCTOPRINT_CAPABILITIES,
  [MoonrakerType]: MOONRAKER_CAPABILITIES,
  [PrusaLinkType]: PRUSALINK_CAPABILITIES,
  [BambuType]: BAMBU_CAPABILITIES
}

export function hasSerialConnection(printerType: number): boolean {
  return CAPABILITIES_MAP[printerType]?.hasSerialConnection ?? false
}

export function canSyncName(printerType: number): boolean {
  return CAPABILITIES_MAP[printerType]?.canSyncName ?? false
}

export function hasWebInterface(printerType: number): boolean {
  return CAPABILITIES_MAP[printerType]?.hasWebInterface ?? false
}

export function hasEmergencyStop(printerType: number): boolean {
  return CAPABILITIES_MAP[printerType]?.hasEmergencyStop ?? false
}

export function hasPrinterControl(printerType: number): boolean {
  return CAPABILITIES_MAP[printerType]?.hasPrinterControl ?? false
}
