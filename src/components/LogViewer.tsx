import { useState, useEffect } from 'react'
import type { LogEntry } from '../types'

export default function LogViewer() {
  const [open, setOpen] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])

  const refresh = async () => {
    try {
      const entries = await window.pm3.getLogs(50)
      setLogs(entries)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (open) refresh()
  }, [open])

  const handleClear = async () => {
    await window.pm3.clearLogs()
    setLogs([])
  }

  return (
    <div className="log-bar">
      <div className="log-bar-header" onClick={() => { setOpen(!open); }}>
        <span className="log-bar-title">
          Operation Log {logs.length > 0 && `(${logs.length})`}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {open && logs.length > 0 && (
            <button
              className="btn btn-sm btn-danger"
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              style={{ padding: '3px 8px', fontSize: 11 }}
            >
              Clear
            </button>
          )}
          {open && (
            <button
              className="btn btn-sm"
              onClick={(e) => { e.stopPropagation(); refresh(); }}
              style={{ padding: '3px 8px', fontSize: 11 }}
            >
              Refresh
            </button>
          )}
          <span className="log-bar-toggle">{open ? '▼' : '▲'}</span>
        </div>
      </div>

      {open && (
        <div className="log-entries">
          {logs.length === 0 ? (
            <div style={{ padding: 18, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
              No operations logged yet
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="log-entry">
                <div className={`log-status ${log.status}`} />
                <span className="log-time">{log.timestamp}</span>
                <span className="log-op">{log.operation}</span>
                <span className="log-detail">{log.details}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
