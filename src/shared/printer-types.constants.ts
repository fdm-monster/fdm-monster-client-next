import bambuLogo from '@/assets/bambu-logo.png'
import klipperLogo from '@/assets/klipper-logo.svg'
import prusaLinkLogo from '@/assets/prusa-link-logo.svg'
import octoprintLogo from '@/assets/octoprint-tentacle.svg'

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

export function getPrinterTypeName(printerType?: number) {
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

/**
 * Get the printer type logo based on file metadata
 * @param metadata - File metadata containing printer model information
 * @param fileFormat - File format (optional)
 * @returns Logo image URL or undefined
 */
export function getPrinterTypeLogo(metadata: { printerModel?: string; [key: string]: any } | Record<string, any>, fileFormat?: string): string | undefined {
  const printerModel = metadata?.printerModel?.toLowerCase() || ''

  if (printerModel.includes('bambu') || printerModel.includes('x1') || printerModel.includes('p1')) {
    return bambuLogo
  } else if (printerModel.includes('klipper') || printerModel.includes('voron') || printerModel.includes('ratrig')) {
    return klipperLogo
  } else if (printerModel.includes('prusa') || printerModel.includes('mk3') || printerModel.includes('mk4') || printerModel.includes('mini')) {
    return prusaLinkLogo
  } else if (printerModel.includes('ender') || printerModel.includes('creality') || fileFormat === 'gcode') {
    return octoprintLogo
  }

  return undefined
}

// Printer types array for dropdowns
export const PRINTER_TYPES = [
  { name: getPrinterTypeName(OctoPrintType), value: OctoPrintType },
  { name: getPrinterTypeName(MoonrakerType), value: MoonrakerType },
  { name: getPrinterTypeName(PrusaLinkType), value: PrusaLinkType },
  { name: getPrinterTypeName(BambuType), value: BambuType }
] as const
