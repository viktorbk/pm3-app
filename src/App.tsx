import { useState, useEffect, useCallback } from 'react'
import type { DeviceStatus as DeviceStatusType, ScanResult, DumpResult, WriteResult, AppStep } from './types'
import DeviceStatus from './components/DeviceStatus'
import ScanPanel from './components/ScanPanel'
import ResultsPanel from './components/ResultsPanel'
import WritePanel from './components/WritePanel'
import LogViewer from './components/LogViewer'

export default function App() {
  const [step, setStep] = useState<AppStep>('status')
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatusType | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [dumpResult, setDumpResult] = useState<DumpResult | null>(null)
  const [dumping, setDumping] = useState(false)

  const refreshStatus = useCallback(async () => {
    setStatusLoading(true)
    try {
      const status = await window.pm3.getStatus()
      setDeviceStatus(status)
      if (status.connected && step === 'status') {
        setStep('scanning')
      }
    } catch {
      setDeviceStatus({ connected: false } as DeviceStatusType)
    }
    setStatusLoading(false)
  }, [step])

  useEffect(() => {
    refreshStatus()
  }, [])

  const handleScanComplete = (result: ScanResult) => {
    setScanResult(result)
    setDumpResult(null)
    setStep('scan-result')
  }

  const handleDump = async () => {
    if (!scanResult) return
    setDumping(true)
    setStep('dumping')
    try {
      let result: DumpResult
      if (scanResult.frequency === 'hf') {
        result = await window.pm3.dumpHF()
      } else {
        result = await window.pm3.readLF()
      }
      setDumpResult(result)
      setStep('dump-result')
    } catch (err: any) {
      setDumpResult({
        success: false,
        dumpFile: '',
        keysFile: '',
        sectorsFound: 0,
        message: err.message || 'Dump failed',
        raw: '',
      })
      setStep('dump-result')
    }
    setDumping(false)
  }

  const handleGoToWrite = () => {
    setStep('write-select')
  }

  const handleWriteComplete = (_result: WriteResult) => {
    setStep('write-result')
  }

  const handleReset = () => {
    setScanResult(null)
    setDumpResult(null)
    setStep('scanning')
  }

  const currentStepIndex =
    step === 'scanning' ? 0
    : step === 'scan-result' || step === 'dumping' || step === 'dump-result' ? 1
    : step === 'write-select' || step === 'writing' || step === 'write-result' ? 2
    : -1

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="header-logo">
            <span>PM3</span> Clone Tool
          </div>
          {deviceStatus && (
            <span className={`header-badge ${deviceStatus.connected ? 'badge-connected' : 'badge-disconnected'}`}>
              {deviceStatus.connected ? 'Connected' : 'Disconnected'}
            </span>
          )}
        </div>
        <div className="header-right">
          {deviceStatus?.connected && step !== 'status' && (
            <div className="steps" style={{ marginBottom: 0 }}>
              <div className={`step ${currentStepIndex === 0 ? 'active' : currentStepIndex > 0 ? 'done' : ''}`}>
                <div className="step-number">1</div>
                <span>Scan</span>
              </div>
              <div className={`step-connector ${currentStepIndex > 0 ? 'done' : ''}`} />
              <div className={`step ${currentStepIndex === 1 ? 'active' : currentStepIndex > 1 ? 'done' : ''}`}>
                <div className="step-number">2</div>
                <span>Dump</span>
              </div>
              <div className={`step-connector ${currentStepIndex > 1 ? 'done' : ''}`} />
              <div className={`step ${currentStepIndex === 2 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <span>Write</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="main">
        {/* Sidebar */}
        <div className="sidebar">
          <DeviceStatus
            status={deviceStatus}
            onRefresh={refreshStatus}
            loading={statusLoading}
          />

          {/* Saved Dumps quick info */}
          {scanResult?.found && (
            <div className="sidebar-section fade-in">
              <div className="sidebar-title">Current Card</div>
              <div className="status-grid">
                <div className="status-row">
                  <span className="status-label">Type</span>
                  <span className="status-value">{scanResult.cardType}</span>
                </div>
                <div className="status-row">
                  <span className="status-label">Freq</span>
                  <span className="status-value">
                    <span className={`result-badge ${scanResult.frequency}`} style={{ fontSize: 10, padding: '1px 6px' }}>
                      {scanResult.frequency === 'hf' ? 'HF' : 'LF'}
                    </span>
                  </span>
                </div>
                <div className="status-row">
                  <span className="status-label">UID</span>
                  <span className="status-value" style={{ fontSize: 11 }}>{scanResult.uid}</span>
                </div>
                {dumpResult?.success && (
                  <div className="status-row">
                    <span className="status-label">Dump</span>
                    <span className="status-value">
                      <span className="status-dot dot-green" />
                      Ready
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="content">
          {!deviceStatus?.connected && !statusLoading && (
            <div className="scan-section fade-in">
              <div className="scan-icon auto" style={{ background: 'var(--error-dim)', color: 'var(--error)' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="3" width="20" height="18" rx="3" />
                  <path d="M8 12h8M12 8v8" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="scan-title">Proxmark3 Not Connected</h2>
              <p className="scan-subtitle">
                Connect your Proxmark3 device via USB and click Refresh in the sidebar.
              </p>
            </div>
          )}

          {deviceStatus?.connected && step === 'scanning' && (
            <ScanPanel onScanComplete={handleScanComplete} disabled={false} />
          )}

          {deviceStatus?.connected &&
            (step === 'scan-result' || step === 'dumping' || step === 'dump-result') &&
            scanResult && (
              <ResultsPanel
                scanResult={scanResult}
                dumpResult={dumpResult}
                onDump={handleDump}
                onWrite={handleGoToWrite}
                onRescan={handleReset}
                dumping={dumping}
              />
            )}

          {deviceStatus?.connected &&
            (step === 'write-select' || step === 'writing' || step === 'write-result') &&
            scanResult &&
            dumpResult && (
              <WritePanel
                scanResult={scanResult}
                dumpResult={dumpResult}
                onComplete={handleWriteComplete}
                onBack={handleReset}
              />
            )}
        </div>
      </div>

      {/* Log Bar */}
      <LogViewer />
    </div>
  )
}
