// Printer type constants
export const OctoPrintType = 0
export const MoonrakerType = 1
export const PrusaLinkType = 2
export const BambuType = 3

// Type check functions
export function isOctoPrintType(printerType?: number) {
  return printerType === OctoPrintType
}

export function isMoonrakerType(printerType?: number) {
  return printerType === MoonrakerType
}

export function isPrusaLinkType(printerType?: number) {
  return printerType === PrusaLinkType
}

export function isBambuType(printerType?: number) {
  return printerType === BambuType
}

export function getServiceName(printerType?: number) {
  if (isOctoPrintType(printerType)) {
    return 'OctoPrint'
  } else if (isMoonrakerType(printerType)) {
    return 'Moonraker'
  } else if (isPrusaLinkType(printerType)) {
    return 'PrusaLink'
  } else if (isBambuType(printerType)) {
    return 'Bambu'
  } else {
    return 'Unknown'
  }
}

// Printer types array for dropdowns
export const PRINTER_TYPES = [
  { name: getServiceName(OctoPrintType), value: OctoPrintType },
  { name: getServiceName(MoonrakerType), value: MoonrakerType },
  { name: getServiceName(PrusaLinkType), value: PrusaLinkType },
  { name: getServiceName(BambuType), value: BambuType }
] as const

export type PrinterTypeValue = typeof PRINTER_TYPES[number]['value']
