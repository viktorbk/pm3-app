import { app } from 'electron'
import path from 'path'
import fs from 'fs'

interface DB {
  logs: LogEntry[]
  dumps: DumpEntry[]
}

let db: DB = { logs: [], dumps: [] }
let dbPath: string
let nextLogId = 1
let nextDumpId = 1

export function initDatabase() {
  dbPath = path.join(app.getPath('userData'), 'pm3-data.json')

  if (fs.existsSync(dbPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
      db = data
      nextLogId = db.logs.length > 0 ? Math.max(...db.logs.map((l) => l.id)) + 1 : 1
      nextDumpId = db.dumps.length > 0 ? Math.max(...db.dumps.map((d) => d.id)) + 1 : 1
    } catch {
      db = { logs: [], dumps: [] }
    }
  }
}

function save() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
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

export function addLog(
  operation: string,
  details: string,
  status: 'success' | 'error' | 'info',
  raw_output = ''
) {
  db.logs.push({
    id: nextLogId++,
    timestamp: new Date().toLocaleString(),
    operation,
    details,
    status,
    raw_output,
  })
  // Keep last 500 logs
  if (db.logs.length > 500) db.logs = db.logs.slice(-500)
  save()
}

export function getLogs(limit = 100): LogEntry[] {
  return db.logs.slice(-limit).reverse()
}

export function clearLogs() {
  db.logs = []
  save()
}

export function saveDump(
  uid: string,
  cardType: string,
  frequency: string,
  dumpFile: string
) {
  db.dumps.push({
    id: nextDumpId++,
    timestamp: new Date().toLocaleString(),
    uid,
    card_type: cardType,
    frequency,
    dump_file: dumpFile,
  })
  save()
}

export function getDumps(): DumpEntry[] {
  return [...db.dumps].reverse()
}

export function closeDatabase() {
  save()
}
