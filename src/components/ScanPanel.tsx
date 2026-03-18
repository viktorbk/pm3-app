import { useState } from 'react'
import type { ScanResult } from '../types'

interface Props {
  onScanComplete: (result: ScanResult) => void
  disabled: boolean
}

export default function ScanPanel({ onScanComplete, disabled }: Props) {
  const [scanning, setScanning] = useState(false)
  const [scanType, setScanType] = useState<string>('')

  const handleScan = async (type: 'hf' | 'lf' | 'auto') => {
    setScanning(true)
    setScanType(type)
    try {
      let result: ScanResult
      if (type === 'hf') result = await window.pm3.scanHF()
      else if (type === 'lf') result = await window.pm3.scanLF()
      else result = await window.pm3.autoScan()
      onScanComplete(result)
    } catch {
      onScanComplete({
        found: false,
        frequency: null,
        cardType: '',
        uid: '',
        atqa: '',
        sak: '',
        details: {},
        raw: 'Connection error',
      })
    }
    setScanning(false)
    setScanType('')
  }

  if (scanning) {
    return (
      <div className="loading-section fade-in">
        <div className="spinner spinner-lg" />
        <div className="loading-text">
          {scanType === 'hf' && 'Scanning HF (13.56 MHz)...'}
          {scanType === 'lf' && 'Scanning LF (125 kHz)...'}
          {scanType === 'auto' && 'Auto-detecting card type...'}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Keep the card on the antenna
        </p>
      </div>
    )
  }

  return (
    <div className="scan-section fade-in">
      <div className="scan-icon auto">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12z" />
          <path d="M8 12C8 9.79 9.79 8 12 8s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
        </svg>
      </div>

      <h2 className="scan-title">Place card on the reader</h2>
      <p className="scan-subtitle">
        Position your card or key fob directly on the Proxmark3 antenna.<br />
        Use <strong style={{ color: 'var(--hf-color)' }}>HF Scan</strong> for Mifare/NFC cards (top of device),
        or <strong style={{ color: 'var(--lf-color)' }}>LF Scan</strong> for EM/HID cards (bottom of device).
      </p>

      <div className="scan-buttons">
        <button
          className="btn btn-lg"
          style={{ background: 'var(--hf-dim)', borderColor: 'var(--hf-color)', color: 'var(--hf-color)' }}
          onClick={() => handleScan('hf')}
          disabled={disabled}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12.5a7 7 0 0 1 14 0" strokeLinecap="round" />
            <path d="M8.5 12.5a3.5 3.5 0 0 1 7 0" strokeLinecap="round" />
            <circle cx="12" cy="13" r="1" fill="currentColor" />
          </svg>
          HF Scan
        </button>

        <button
          className="btn btn-lg"
          style={{ background: 'var(--lf-dim)', borderColor: 'var(--lf-color)', color: 'var(--lf-color)' }}
          onClick={() => handleScan('lf')}
          disabled={disabled}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12h4l3-9 4 18 3-9h4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          LF Scan
        </button>

        <button
          className="btn btn-lg btn-primary"
          onClick={() => handleScan('auto')}
          disabled={disabled}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" strokeLinecap="round" />
          </svg>
          Auto Detect
        </button>
      </div>
    </div>
  )
}
