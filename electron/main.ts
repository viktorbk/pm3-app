import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'path'
import {
  getDeviceStatus,
  getAntennaTune,
  scanHF,
  scanLF,
  autoScan,
  dumpHF,
  readLF,
  writeHFAuto,
  writeLFEM,
  writeLFHID,
} from './pm3'
import {
  initDatabase,
  addLog,
  getLogs,
  clearLogs,
  saveDump,
  getDumps,
  closeDatabase,
} from './database'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0a0a0f',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  initDatabase()
  createWindow()

  // Device
  ipcMain.handle('pm3:get-status', async () => {
    try {
      const status = getDeviceStatus()
      addLog('hw status', status.connected ? 'Device connected' : 'Device not found', status.connected ? 'success' : 'error')
      return status
    } catch (err: any) {
      addLog('hw status', err.message, 'error')
      return { connected: false, raw: err.message }
    }
  })

  ipcMain.handle('pm3:hw-tune', async () => {
    try {
      const tune = getAntennaTune()
      addLog('hw tune', `LF: ${tune.lfVoltage}V, HF: ${tune.hfVoltage}V`, tune.lfOk && tune.hfOk ? 'success' : 'info')
      return tune
    } catch (err: any) {
      addLog('hw tune', err.message, 'error')
      throw err
    }
  })

  // Scanning
  ipcMain.handle('pm3:scan-hf', async () => {
    try {
      const result = scanHF()
      if (result.found) {
        addLog('scan HF', `${result.cardType} — UID: ${result.uid}`, 'success', result.raw)
      } else {
        addLog('scan HF', 'No HF card found', 'info')
      }
      return result
    } catch (err: any) {
      addLog('scan HF', err.message, 'error')
      throw err
    }
  })

  ipcMain.handle('pm3:scan-lf', async () => {
    try {
      const result = scanLF()
      if (result.found) {
        addLog('scan LF', `${result.cardType} — ID: ${result.uid}`, 'success', result.raw)
      } else {
        addLog('scan LF', 'No LF card found', 'info')
      }
      return result
    } catch (err: any) {
      addLog('scan LF', err.message, 'error')
      throw err
    }
  })

  ipcMain.handle('pm3:auto-scan', async () => {
    try {
      const result = autoScan()
      if (result.found) {
        addLog('auto scan', `${result.cardType} — UID: ${result.uid}`, 'success', result.raw)
      } else {
        addLog('auto scan', 'No card found', 'info')
      }
      return result
    } catch (err: any) {
      addLog('auto scan', err.message, 'error')
      throw err
    }
  })

  // Dumping
  ipcMain.handle('pm3:dump-hf', async () => {
    try {
      const result = dumpHF()
      if (result.success) {
        addLog('dump HF', result.message, 'success', result.raw)
        const scanResult = scanHF()
        if (scanResult.found) {
          saveDump(scanResult.uid, scanResult.cardType, 'hf', result.dumpFile)
        }
      } else {
        addLog('dump HF', result.message, 'error', result.raw)
      }
      return result
    } catch (err: any) {
      addLog('dump HF', err.message, 'error')
      throw err
    }
  })

  ipcMain.handle('pm3:read-lf', async () => {
    try {
      const result = readLF()
      if (result.success) {
        addLog('read LF', result.message, 'success', result.raw)
      } else {
        addLog('read LF', result.message, 'error', result.raw)
      }
      return result
    } catch (err: any) {
      addLog('read LF', err.message, 'error')
      throw err
    }
  })

  // Writing
  ipcMain.handle('pm3:write-hf', async (_event, dumpFile: string) => {
    try {
      const result = writeHFAuto(dumpFile)
      addLog('write HF', `${result.method}: ${result.message}`, result.success ? 'success' : 'error', result.raw)
      return result
    } catch (err: any) {
      addLog('write HF', err.message, 'error')
      throw err
    }
  })

  ipcMain.handle('pm3:write-lf-em', async (_event, id: string) => {
    try {
      const result = writeLFEM(id)
      addLog('write LF EM', result.message, result.success ? 'success' : 'error', result.raw)
      return result
    } catch (err: any) {
      addLog('write LF EM', err.message, 'error')
      throw err
    }
  })

  ipcMain.handle('pm3:write-lf-hid', async (_event, raw: string) => {
    try {
      const result = writeLFHID(raw)
      addLog('write LF HID', result.message, result.success ? 'success' : 'error', result.raw)
      return result
    } catch (err: any) {
      addLog('write LF HID', err.message, 'error')
      throw err
    }
  })

  // Database
  ipcMain.handle('db:get-logs', async (_event, limit?: number) => {
    return getLogs(limit)
  })

  ipcMain.handle('db:clear-logs', async () => {
    clearLogs()
    return true
  })

  ipcMain.handle('db:get-dumps', async () => {
    return getDumps()
  })

  // App
  ipcMain.handle('app:open-external', async (_event, url: string) => {
    if (url.startsWith('https://')) {
      await shell.openExternal(url)
    }
  })
})

app.on('window-all-closed', () => {
  closeDatabase()
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
