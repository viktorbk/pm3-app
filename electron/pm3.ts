import { execSync } from 'child_process'

const PM3_TIMEOUT = 30000

export function runPm3(cmd: string, timeout = PM3_TIMEOUT): string {
  try {
    const result = execSync(`pm3 -c "${cmd}"`, {
      timeout,
      encoding: 'utf-8',
      env: { ...process.env, PATH: `/usr/local/bin:/opt/homebrew/bin:${process.env.PATH}` },
    })
    return result
  } catch (err: any) {
    if (err.stdout) return err.stdout
    throw new Error(`PM3 command failed: ${err.message}`)
  }
}

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

export function getDeviceStatus(): DeviceStatus {
  const status: DeviceStatus = {
    connected: false,
    port: '',
    fpgaMode: '',
    flashSize: '',
    flashOk: false,
    smartCardVersion: '',
    lfDivisor: '',
    lfFreq: '',
    standalone: '',
    memoryTotal: 0,
    memoryAvailable: 0,
    transferSpeed: '',
    raw: '',
  }

  try {
    const output = runPm3('hw status')
    status.raw = output
    status.connected = true

    const portMatch = output.match(/Using UART port ([^\n]+)/)
    if (portMatch) status.port = portMatch[1].trim()

    const fpgaMatch = output.match(/mode\.*\s+(.+)/)
    if (fpgaMatch) status.fpgaMode = fpgaMatch[1].trim()

    const flashSizeMatch = output.match(/Memory size\.*\s+(.+)/)
    if (flashSizeMatch) status.flashSize = flashSizeMatch[1].trim()

    const flashInitMatch = output.match(/Init\.*\s+(\w+)/)
    if (flashInitMatch) status.flashOk = flashInitMatch[1].trim() === 'ok'

    const scMatch = output.match(/Smart card module.*\n.*version\.*\s*(.+)/)
    if (scMatch) status.smartCardVersion = scMatch[1].trim()

    const memTotalMatch = output.match(/BigBuf_size\.*\s+(\d+)/)
    if (memTotalMatch) status.memoryTotal = parseInt(memTotalMatch[1])

    const memAvailMatch = output.match(/Available memory\.*\s+(\d+)/)
    if (memAvailMatch) status.memoryAvailable = parseInt(memAvailMatch[1])

    const divisorMatch = output.match(/divisor\.*\s+(\d+)\s+\(\s*([\d.]+\s+kHz)\s*\)/)
    if (divisorMatch) {
      status.lfDivisor = divisorMatch[1]
      status.lfFreq = divisorMatch[2]
    }

    const standaloneMatch = output.match(/Installed StandAlone Mode\n.*\s+(.+)/)
    if (standaloneMatch) status.standalone = standaloneMatch[1].trim()

    const speedMatch = output.match(/Transfer Speed PM3.*\s+([\d]+\s+bytes\/s)/)
    if (speedMatch) status.transferSpeed = speedMatch[1]
  } catch {
    status.connected = false
  }

  return status
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

export function getAntennaTune(): TuneResult {
  const result: TuneResult = {
    lfVoltage: 0,
    lfOptimalVoltage: 0,
    lfOptimalFreq: '',
    lfOk: false,
    hfVoltage: 0,
    hfOk: false,
    raw: '',
  }

  const output = runPm3('hw tune', 60000)
  result.raw = output

  const lf125Match = output.match(/125\.00 kHz\s*\.+\s*([\d.]+)\s*V/)
  if (lf125Match) result.lfVoltage = parseFloat(lf125Match[1])

  const lfOptMatch = output.match(/([\d.]+\s+kHz)\s+optimal\.*\s*([\d.]+)\s*V/)
  if (lfOptMatch) {
    result.lfOptimalFreq = lfOptMatch[1]
    result.lfOptimalVoltage = parseFloat(lfOptMatch[2])
  }

  const lfOkMatch = output.match(/LF antenna\.*\s*(\w+)/)
  if (lfOkMatch) result.lfOk = lfOkMatch[1] === 'ok'

  const hfMatch = output.match(/13\.56 MHz\.*\s*([\d.]+)\s*V/)
  if (hfMatch) result.hfVoltage = parseFloat(hfMatch[1])

  const hfOkMatch = output.match(/HF antenna\s*\(\s*(\w+)\s*\)/)
  if (hfOkMatch) result.hfOk = hfOkMatch[1] === 'ok'

  return result
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

export function scanHF(): ScanResult {
  const result: ScanResult = {
    found: false,
    frequency: null,
    cardType: '',
    uid: '',
    atqa: '',
    sak: '',
    details: {},
    raw: '',
  }

  const output = runPm3('hf mf info', 15000)
  result.raw = output

  const uidMatch = output.match(/UID:\s*([A-Fa-f0-9 ]+)/)
  if (uidMatch) {
    result.found = true
    result.frequency = 'hf'
    result.uid = uidMatch[1].trim()
  } else {
    return result
  }

  const atqaMatch = output.match(/ATQA:\s*([A-Fa-f0-9 ]+)/)
  if (atqaMatch) result.atqa = atqaMatch[1].trim()

  const sakMatch = output.match(/SAK:\s*([A-Fa-f0-9]+)/)
  if (sakMatch) result.sak = sakMatch[1].trim()

  const sak = parseInt(result.sak, 16)
  if (sak === 0x08) result.cardType = 'Mifare Classic 1K'
  else if (sak === 0x18) result.cardType = 'Mifare Classic 4K'
  else if (sak === 0x09) result.cardType = 'Mifare Mini'
  else if (sak === 0x20) result.cardType = 'Mifare Plus / DESFire'
  else if (sak === 0x28) result.cardType = 'JCOP'
  else if (sak === 0x00) result.cardType = 'Mifare Ultralight / NTAG'
  else result.cardType = `Unknown HF (SAK: ${result.sak})`

  const sigMatch = output.match(/IC signature public key name:\s*(.+)/)
  if (sigMatch) result.details['chip'] = sigMatch[1].trim()

  const sigVerify = output.match(/Signature verification:\s*(.+)/)
  if (sigVerify) result.details['signature'] = sigVerify[1].trim()

  const prngMatch = output.match(/Prng\.*\s*(\w+)/)
  if (prngMatch) result.details['prng'] = prngMatch[1].trim()

  const magicMatch = output.match(/Magic capabilities\.*\s*(.+)/)
  if (magicMatch) result.details['magic'] = magicMatch[1].trim()

  const fingerprintMatch = output.match(/Fingerprint\n\[\+\]\s*(.+)/)
  if (fingerprintMatch) result.details['fingerprint'] = fingerprintMatch[1].trim()

  return result
}

export function scanLF(): ScanResult {
  const result: ScanResult = {
    found: false,
    frequency: null,
    cardType: '',
    uid: '',
    atqa: '',
    sak: '',
    details: {},
    raw: '',
  }

  const output = runPm3('lf search', 20000)
  result.raw = output

  // EM410x
  const emMatch = output.match(/EM 410x ID\s+([A-Fa-f0-9]+)/i) || output.match(/EM410x.*?ID[:\s]+([A-Fa-f0-9]+)/i)
  if (emMatch) {
    result.found = true
    result.frequency = 'lf'
    result.cardType = 'EM4100'
    result.uid = emMatch[1].trim()
    return result
  }

  // HID
  const hidMatch = output.match(/HID.*?Prox.*?ID[:\s]+([^\n]+)/i)
  if (hidMatch) {
    result.found = true
    result.frequency = 'lf'
    result.cardType = 'HID Prox'
    result.uid = hidMatch[1].trim()
    return result
  }

  // Indala
  if (/indala/i.test(output)) {
    result.found = true
    result.frequency = 'lf'
    result.cardType = 'Indala'
    const idMatch = output.match(/Indala.*?ID[:\s]+([^\n]+)/i)
    if (idMatch) result.uid = idMatch[1].trim()
    return result
  }

  // AWID
  if (/awid/i.test(output)) {
    result.found = true
    result.frequency = 'lf'
    result.cardType = 'AWID'
    return result
  }

  // Generic check for any valid tag found
  if (/valid/i.test(output) && !/no data found/i.test(output)) {
    result.found = true
    result.frequency = 'lf'
    result.cardType = 'Unknown LF'
  }

  return result
}

export function autoScan(): ScanResult {
  // Try HF first
  let result = scanHF()
  if (result.found) return result

  // Then LF
  result = scanLF()
  return result
}

export interface DumpResult {
  success: boolean
  dumpFile: string
  keysFile: string
  sectorsFound: number
  message: string
  raw: string
}

export function dumpHF(): DumpResult {
  const result: DumpResult = {
    success: false,
    dumpFile: '',
    keysFile: '',
    sectorsFound: 0,
    message: '',
    raw: '',
  }

  const output = runPm3('hf mf autopwn', 120000)
  result.raw = output

  const dumpMatch = output.match(/Saved \d+ bytes to binary file [`']([^`']+)['`]/)
  if (dumpMatch) {
    result.success = true
    result.dumpFile = dumpMatch[1]
  }

  const keysMatch = output.match(/dumped to [`']([^`']+key[^`']*\.bin)['`]/i)
  if (keysMatch) result.keysFile = keysMatch[1]

  const sectorMatches = output.match(/found valid key/gi)
  if (sectorMatches) result.sectorsFound = sectorMatches.length

  const blocksMatch = output.match(/Card loaded (\d+) blocks/)
  if (blocksMatch) result.message = `Loaded ${blocksMatch[1]} blocks`

  if (result.success) {
    result.message = `Dumped successfully. ${result.sectorsFound} keys found.`
  } else {
    result.message = 'Dump failed. Check card positioning.'
  }

  return result
}

export function readLF(): DumpResult {
  const result: DumpResult = {
    success: false,
    dumpFile: '',
    keysFile: '',
    sectorsFound: 0,
    message: '',
    raw: '',
  }

  const scanResult = scanLF()
  if (!scanResult.found) {
    result.message = 'No LF card detected.'
    return result
  }

  result.success = true
  result.dumpFile = scanResult.uid
  result.message = `${scanResult.cardType} — ID: ${scanResult.uid}`
  result.raw = scanResult.raw

  return result
}

export interface WriteResult {
  success: boolean
  method: string
  verifiedUid: string
  message: string
  raw: string
}

export function writeHFGen1(dumpFile: string): WriteResult {
  const result: WriteResult = {
    success: false,
    method: 'Gen1a',
    verifiedUid: '',
    message: '',
    raw: '',
  }

  const output = runPm3(`hf mf cload -f ${dumpFile}`, 30000)
  result.raw = output

  if (/done|loaded.*blocks/i.test(output)) {
    result.success = true
    result.message = 'Gen1a write successful!'

    const verify = runPm3('hf 14a reader -s', 10000)
    const uidMatch = verify.match(/UID:\s*([A-Fa-f0-9 ]+)/)
    if (uidMatch) result.verifiedUid = uidMatch[1].trim()
  } else {
    result.message = 'Gen1a write failed.'
  }

  return result
}

export function writeHFGen2(dumpFile: string): WriteResult {
  const result: WriteResult = {
    success: false,
    method: 'Gen2/CUID',
    verifiedUid: '',
    message: '',
    raw: '',
  }

  const output = runPm3(`hf mf restore -f ${dumpFile}`, 60000)
  result.raw = output

  if (/done|restore/i.test(output) && !/error/i.test(output)) {
    result.success = true
    result.message = 'Gen2/CUID write successful!'

    const verify = runPm3('hf 14a reader -s', 10000)
    const uidMatch = verify.match(/UID:\s*([A-Fa-f0-9 ]+)/)
    if (uidMatch) result.verifiedUid = uidMatch[1].trim()
  } else {
    result.message = 'Gen2/CUID write failed.'
  }

  return result
}

export function writeHFAuto(dumpFile: string): WriteResult {
  let result = writeHFGen1(dumpFile)
  if (result.success) return result

  result = writeHFGen2(dumpFile)
  return result
}

export function writeLFEM(id: string): WriteResult {
  const result: WriteResult = {
    success: false,
    method: 'T55xx (EM410x)',
    verifiedUid: '',
    message: '',
    raw: '',
  }

  const output = runPm3(`lf em 410x clone --id ${id}`, 15000)
  result.raw = output

  if (/done|written|success/i.test(output)) {
    result.success = true
    result.message = `EM410x clone successful! ID: ${id}`
  } else {
    result.message = 'EM410x clone failed.'
  }

  return result
}

export function writeLFHID(raw: string): WriteResult {
  const result: WriteResult = {
    success: false,
    method: 'T55xx (HID)',
    verifiedUid: '',
    message: '',
    raw: '',
  }

  const output = runPm3(`lf hid clone ${raw}`, 15000)
  result.raw = output

  if (/done|written|success/i.test(output)) {
    result.success = true
    result.message = 'HID clone successful!'
  } else {
    result.message = 'HID clone failed.'
  }

  return result
}
