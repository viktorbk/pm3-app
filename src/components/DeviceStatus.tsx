import { useState } from 'react'
import type { DeviceStatus as DeviceStatusType, TuneResult } from '../types'

interface Props {
  status: DeviceStatusType | null
  onRefresh: () => void
  loading: boolean
}

export default function DeviceStatus({ status, onRefresh, loading }: Props) {
  const [tune, setTune] = useState<TuneResult | null>(null)
  const [tuning, setTuning] = useState(false)

  const handleTune = async () => {
    setTuning(true)
    try {
      const result = await window.pm3.tunAntenna()
      setTune(result)
    } catch {
      // ignore
    }
    setTuning(false)
  }

  return (
    <>
      <div className="sidebar-section">
        <div className="sidebar-title">Device</div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="spinner" />
          </div>
        ) : status ? (
          <div className="status-grid">
            <div className="status-row">
              <span className="status-label">Status</span>
              <span className="status-value">
                <span className={`status-dot ${status.connected ? 'dot-green' : 'dot-red'}`} />
                {status.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {status.connected && (
              <>
                <div className="status-row">
                  <span className="status-label">Port</span>
                  <span className="status-value">{status.port || '—'}</span>
                </div>
                <div className="status-row">
                  <span className="status-label">FPGA</span>
                  <span className="status-value" style={{ fontSize: 11 }}>
                    {status.fpgaMode ? status.fpgaMode.substring(0, 30) : '—'}
                  </span>
                </div>
                <div className="status-row">
                  <span className="status-label">Flash</span>
                  <span className="status-value">
                    <span className={`status-dot ${status.flashOk ? 'dot-green' : 'dot-red'}`} />
                    {status.flashSize || '—'}
                  </span>
                </div>
                <div className="status-row">
                  <span className="status-label">Smart Card</span>
                  <span className="status-value">
                    {status.smartCardVersion && status.smartCardVersion !== '( fail )'
                      ? status.smartCardVersion
                      : 'N/A'}
                  </span>
                </div>
                <div className="status-row">
                  <span className="status-label">LF Freq</span>
                  <span className="status-value">{status.lfFreq || '—'}</span>
                </div>
                <div className="status-row">
                  <span className="status-label">Memory</span>
                  <span className="status-value">
                    {status.memoryAvailable > 0
                      ? `${(status.memoryAvailable / 1024).toFixed(0)} KB free`
                      : '—'}
                  </span>
                </div>
                <div className="status-row">
                  <span className="status-label">Speed</span>
                  <span className="status-value">{status.transferSpeed || '—'}</span>
                </div>
              </>
            )}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Click refresh to check device
          </p>
        )}

        <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
          <button className="btn btn-sm" onClick={onRefresh} disabled={loading} style={{ flex: 1 }}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Refresh'}
          </button>
          <button
            className="btn btn-sm"
            onClick={handleTune}
            disabled={tuning || !status?.connected}
            style={{ flex: 1 }}
          >
            {tuning ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Tune'}
          </button>
        </div>
      </div>

      {tune && (
        <div className="sidebar-section fade-in">
          <div className="sidebar-title">Antenna</div>
          <div className="antenna-bar">
            <div className="antenna-bar-label">
              <span style={{ color: 'var(--lf-color)' }}>LF 125 kHz</span>
              <span>{tune.lfVoltage.toFixed(1)}V {tune.lfOk ? '✓' : '✗'}</span>
            </div>
            <div className="antenna-bar-track">
              <div
                className="antenna-bar-fill lf"
                style={{ width: `${Math.min(tune.lfVoltage / 40 * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="antenna-bar">
            <div className="antenna-bar-label">
              <span style={{ color: 'var(--hf-color)' }}>HF 13.56 MHz</span>
              <span>{tune.hfVoltage.toFixed(1)}V {tune.hfOk ? '✓' : '✗'}</span>
            </div>
            <div className="antenna-bar-track">
              <div
                className="antenna-bar-fill hf"
                style={{ width: `${Math.min(tune.hfVoltage / 20 * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
