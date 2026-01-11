/**
 * Mock data for printer-related API endpoints
 */

export interface PrinterDto {
  id: number;
  printerType: number;
  correlationToken?: string;
  enabled: boolean;
  dateAdded: number;
  disabledReason: string;
  name: string;
  webSocketURL: string;
  apiKey: string;
  username: string;
  password: string;
  printerURL: string;
}

export const mockPrinters: PrinterDto[] = [
  {
    id: 1,
    name: 'Prusa i3 MK3S',
    printerType: 0,
    enabled: true,
    dateAdded: Date.now() - 86400000 * 30,
    disabledReason: '',
    printerURL: 'http://192.168.1.100',
    webSocketURL: 'ws://192.168.1.100',
    apiKey: 'mock-api-key-1',
    username: '',
    password: '',
    correlationToken: 'token-1',
  },
  {
    id: 2,
    name: 'Ender 3 V2',
    printerType: 0,
    enabled: true,
    dateAdded: Date.now() - 86400000 * 15,
    disabledReason: '',
    printerURL: 'http://192.168.1.101',
    webSocketURL: 'ws://192.168.1.101',
    apiKey: 'mock-api-key-2',
    username: '',
    password: '',
    correlationToken: 'token-2',
  },
  {
    id: 3,
    name: 'Artillery Sidewinder X1',
    printerType: 0,
    enabled: true,
    dateAdded: Date.now() - 86400000 * 7,
    disabledReason: '',
    printerURL: 'http://192.168.1.102',
    webSocketURL: 'ws://192.168.1.102',
    apiKey: 'mock-api-key-3',
    username: '',
    password: '',
    correlationToken: 'token-3',
  },
  {
    id: 4,
    name: 'Creality CR-10',
    printerType: 0,
    enabled: false,
    dateAdded: Date.now() - 86400000 * 60,
    disabledReason: 'Maintenance required',
    printerURL: 'http://192.168.1.103',
    webSocketURL: 'ws://192.168.1.103',
    apiKey: 'mock-api-key-4',
    username: '',
    password: '',
    correlationToken: 'token-4',
  },
];

export const mockPrinterEmpty: PrinterDto[] = [];

export const mockPrinterStates = {
  operational: {
    state: {
      text: 'Operational',
      flags: {
        operational: true,
        printing: false,
        paused: false,
        error: false,
      },
    },
  },
  printing: {
    state: {
      text: 'Printing',
      flags: {
        operational: true,
        printing: true,
        paused: false,
        error: false,
      },
    },
    progress: {
      completion: 45.5,
      filepos: 1234567,
      printTime: 3600,
      printTimeLeft: 4200,
    },
  },
  paused: {
    state: {
      text: 'Paused',
      flags: {
        operational: true,
        printing: true,
        paused: true,
        error: false,
      },
    },
  },
  error: {
    state: {
      text: 'Error: Connection lost',
      flags: {
        operational: false,
        printing: false,
        paused: false,
        error: true,
      },
    },
  },
};
