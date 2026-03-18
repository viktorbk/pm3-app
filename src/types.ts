export interface DeviceStatus {
  connected: boolean
  port: string
  fpgaMode: string
  flashSize: string
  flashOk: boolean
  smartCardVersion: string
  lfDivisor: string
  lfFreq: string
  standalone: string
  memoryTotal: number
  memoryAvailable: number
  transferSpeed: string
  raw: string
}

export interface TuneResult {
  lfVoltage: number
  lfOptimalVoltage: number
  lfOptimalFreq: string
  lfOk: boolean
  hfVoltage: number
  hfOk: boolean
  raw: string
}

export interface ScanResult {
  found: boolean
  frequency: 'hf' | 'lf' | null
  cardType: string
  uid: string
  atqa: string
  sak: string
  details: Record<string, string>
  raw: string
}

export interface DumpResult {
  success: boolean
  dumpFile: string
  keysFile: string
  sectorsFound: number
  message: string
  raw: string
}

export interface WriteResult {
  success: boolean
  method: string
  verifiedUid: string
  message: string
  raw: string
}

export interface LogEntry {
  id: number
  timestamp: string
  operation: string
  details: string
  status: 'success' | 'error' | 'info'
  raw_output: string
}

export interface DumpEntry {
  id: number
  timestamp: string
  uid: string
  card_type: string
  frequency: string
  dump_file: string
}

export type AppStep =
  | 'status'
  | 'scanning'
  | 'scan-result'
  | 'dumping'
  | 'dump-result'
  | 'write-select'
  | 'writing'
  | 'write-result'

export interface CardType {
  id: string
  name: string
  frequency: 'hf' | 'lf'
  description: string
  writable: boolean
  icon: 'card' | 'fob' | 'coin' | 'sticker' | 'wristband' | 'clamshell'
  color: string
}

declare global {
  interface Window {
    pm3: {
      getStatus: () => Promise<DeviceStatus>
      tunAntenna: () => Promise<TuneResult>
      scanHF: () => Promise<ScanResult>
      scanLF: () => Promise<ScanResult>
      autoScan: () => Promise<ScanResult>
      dumpHF: () => Promise<DumpResult>
      readLF: () => Promise<DumpResult>
      writeHF: (dumpFile: string) => Promise<WriteResult>
      writeLFEM: (id: string) => Promise<WriteResult>
      writeLFHID: (raw: string) => Promise<WriteResult>
      getLogs: (limit?: number) => Promise<LogEntry[]>
      clearLogs: () => Promise<void>
      getDumps: () => Promise<DumpEntry[]>
    }
  }
}
