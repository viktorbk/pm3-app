import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('pm3', {
  getStatus: () => ipcRenderer.invoke('pm3:get-status'),
  tunAntenna: () => ipcRenderer.invoke('pm3:hw-tune'),
  scanHF: () => ipcRenderer.invoke('pm3:scan-hf'),
  scanLF: () => ipcRenderer.invoke('pm3:scan-lf'),
  autoScan: () => ipcRenderer.invoke('pm3:auto-scan'),
  dumpHF: () => ipcRenderer.invoke('pm3:dump-hf'),
  readLF: () => ipcRenderer.invoke('pm3:read-lf'),
  writeHF: (dumpFile: string) => ipcRenderer.invoke('pm3:write-hf', dumpFile),
  writeLFEM: (id: string) => ipcRenderer.invoke('pm3:write-lf-em', id),
  writeLFHID: (raw: string) => ipcRenderer.invoke('pm3:write-lf-hid', raw),
  getLogs: (limit?: number) => ipcRenderer.invoke('db:get-logs', limit),
  clearLogs: () => ipcRenderer.invoke('db:clear-logs'),
  getDumps: () => ipcRenderer.invoke('db:get-dumps'),
})
