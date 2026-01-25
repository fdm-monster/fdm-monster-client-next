import { PrinterCapabilities } from '@/shared/printer-capabilities.constants'

export const MOONRAKER_CAPABILITIES: PrinterCapabilities = {
  hasSerialConnection: false,
  canSyncName: false,
  hasWebInterface: false,
  hasEmergencyStop: true,
  hasPrinterControl: true
}
