import { useState, useEffect } from 'react'
import type { LogEntry, DumpEntry, WriteResult } from '../types'

interface Props {
  onClose: () => void
  onWriteDump: (dump: DumpEntry) => void
}

export default function HistoryPanel({ onClose, onWriteDump }: Props) {
  const [tab, setTab] = useState<'logs' | 'dumps'>('logs')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [dumps, setDumps] = useState<DumpEntry[]>([])
  const [writingId, setWritingId] = useState<number | null>(null)
  const [writeResult, setWriteResult] = useState<WriteResult | null>(null)

  const refresh = async () => {
    const [logData, dumpData] = await Promise.all([
      window.pm3.getLogs(200),
      window.pm3.getDumps(),
    ])
    setLogs(logData)
    setDumps(dumpData)
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleClear = async () => {
    await window.pm3.clearLogs()
    setLogs([])
  }

  const handleWrite = async (dump: DumpEntry) => {
    setWritingId(dump.id)
    setWriteResult(null)
    try {
      let result: WriteResult
      if (dump.frequency === 'hf') {
        result = await window.pm3.writeHF(dump.dump_file)
      } else if (dump.card_type === 'EM4100') {
        result = await window.pm3.writeLFEM(dump.uid)
      } else if (dump.card_type === 'HID Prox') {
        result = await window.pm3.writeLFHID(dump.uid)
      } else {
        result = await window.pm3.writeHF(dump.dump_file)
      }
      setWriteResult(result)
    } catch (err: any) {
      setWriteResult({
        success: false,
        method: 'error',
        verifiedUid: '',
        message: err.message || 'Write failed',
        raw: '',
      })
    }
    setWritingId(null)
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog dialog-wide fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header" style={{ paddingBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
              <h2 className="dialog-title" style={{ marginBottom: 4 }}>History</h2>
              <p className="dialog-subtitle">Past operations and saved card dumps</p>
            </div>
            <button className="btn btn-sm" onClick={onClose}>Close</button>
          </div>

          <div className="history-tabs">
            <button
              className={`history-tab ${tab === 'logs' ? 'active' : ''}`}
              onClick={() => setTab('logs')}
            >
              Operation Log ({logs.length})
            </button>
            <button
              className={`history-tab ${tab === 'dumps' ? 'active' : ''}`}
              onClick={() => setTab('dumps')}
            >
              Saved Dumps ({dumps.length})
            </button>
          </div>
        </div>

        <div className="dialog-body" style={{ padding: 0, maxHeight: 420, overflowY: 'auto' }}>
          {tab === 'logs' && (
            <>
              {logs.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No operations logged yet. Start scanning cards to see activity here.
                </div>
              ) : (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th style={{ width: 8 }}></th>
                      <th>Time</th>
                      <th>Operation</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td><div className={`log-status ${log.status}`} /></td>
                        <td className="history-time">{log.timestamp}</td>
                        <td className="history-op">{log.operation}</td>
                        <td className="history-detail">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {tab === 'dumps' && (
            <>
              {/* Write result banner */}
              {writeResult && (
                <div
                  className="fade-in"
                  style={{
                    padding: '12px 18px',
                    background: writeResult.success ? 'var(--success-dim)' : 'var(--error-dim)',
                    borderBottom: `1px solid ${writeResult.success ? 'var(--success)' : 'var(--error)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: writeResult.success ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>
                    {writeResult.success ? 'Write successful' : 'Write failed'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{writeResult.message}</span>
                  {writeResult.verifiedUid && (
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 12 }}>
                      UID: {writeResult.verifiedUid}
                    </span>
                  )}
                  <button
                    className="btn btn-sm"
                    style={{ marginLeft: 'auto', padding: '2px 8px', fontSize: 11 }}
                    onClick={() => setWriteResult(null)}
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {dumps.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No card dumps saved yet. Scan and dump a card to save it here.
                </div>
              ) : (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>UID</th>
                      <th>Type</th>
                      <th>Freq</th>
                      <th>File</th>
                      <th style={{ width: 80 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dumps.map((dump) => (
                      <tr key={dump.id}>
                        <td className="history-time">{dump.timestamp}</td>
                        <td style={{ fontFamily: 'monospace' }}>{dump.uid}</td>
                        <td>{dump.card_type}</td>
                        <td>
                          <span className={`result-badge ${dump.frequency}`} style={{ fontSize: 10, padding: '1px 6px' }}>
                            {dump.frequency === 'hf' ? 'HF' : 'LF'}
                          </span>
                        </td>
                        <td className="history-detail" style={{ fontSize: 11 }}>{dump.dump_file}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-success"
                            style={{ padding: '4px 10px', fontSize: 11 }}
                            onClick={() => handleWrite(dump)}
                            disabled={writingId !== null}
                          >
                            {writingId === dump.id ? (
                              <span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
                            ) : (
                              'Write'
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>

        <div className="dialog-footer" style={{ justifyContent: 'space-between' }}>
          {tab === 'logs' && logs.length > 0 ? (
            <button className="btn btn-sm btn-danger" onClick={handleClear}>Clear Logs</button>
          ) : tab === 'dumps' && dumps.length > 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Place a blank card on the antenna, then press Write
            </p>
          ) : (
            <div />
          )}
          <button className="btn btn-sm" onClick={refresh}>Refresh</button>
        </div>
      </div>
    </div>
  )
}
