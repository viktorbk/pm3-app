import { useState } from 'react'
import type { ScanResult, DumpResult } from '../types'

interface Props {
  scanResult: ScanResult
  dumpResult: DumpResult | null
  onDump: () => void
  onWrite: () => void
  onRescan: () => void
  dumping: boolean
}

export default function ResultsPanel({
  scanResult,
  dumpResult,
  onDump,
  onWrite,
  onRescan,
  dumping,
}: Props) {
  const [showRaw, setShowRaw] = useState(false)

  if (!scanResult.found) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div
          style={{
            width: 64,
            height: 64,
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'var(--error-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            color: 'var(--error)',
          }}
        >
          ?
        </div>
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>No card detected</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
          Make sure the card is positioned correctly on the antenna and try again.
        </p>
        <button className="btn btn-primary btn-lg" onClick={onRescan}>
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Scan Result Card */}
      <div className="result-card success">
        <div className="result-header">
          <span className={`result-badge ${scanResult.frequency}`}>
            {scanResult.frequency === 'hf' ? 'HF 13.56 MHz' : 'LF 125 kHz'}
          </span>
          <span className="result-type">{scanResult.cardType}</span>
        </div>

        <dl className="result-details">
          <dt>UID</dt>
          <dd>{scanResult.uid}</dd>

          {scanResult.atqa && (
            <>
              <dt>ATQA</dt>
              <dd>{scanResult.atqa}</dd>
            </>
          )}

          {scanResult.sak && (
            <>
              <dt>SAK</dt>
              <dd>{scanResult.sak}</dd>
            </>
          )}

          {Object.entries(scanResult.details).map(([key, value]) => (
            <span key={key} style={{ display: 'contents' }}>
              <dt style={{ textTransform: 'capitalize' }}>{key}</dt>
              <dd>{value}</dd>
            </span>
          ))}
        </dl>

        {scanResult.raw && (
          <div className="raw-output">
            <button className="raw-toggle" onClick={() => setShowRaw(!showRaw)}>
              {showRaw ? 'Hide' : 'Show'} raw output
            </button>
            {showRaw && <div className="raw-content">{scanResult.raw}</div>}
          </div>
        )}
      </div>

      {/* Dump Status */}
      {dumping && (
        <div className="loading-section fade-in" style={{ padding: '30px' }}>
          <div className="spinner spinner-lg" />
          <div className="loading-text">
            {scanResult.frequency === 'hf'
              ? 'Running autopwn — cracking keys and dumping...'
              : 'Reading card data...'}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            This may take a moment. Keep the card on the antenna.
          </p>
        </div>
      )}

      {dumpResult && (
        <div className={`result-card fade-in ${dumpResult.success ? 'success' : 'error'}`}>
          <h3 style={{ fontSize: 16, marginBottom: 8 }}>
            {dumpResult.success ? 'Card Data Captured' : 'Dump Failed'}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
            {dumpResult.message}
          </p>
          {dumpResult.dumpFile && (
            <p style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
              File: {dumpResult.dumpFile}
            </p>
          )}
        </div>
      )}

      {/* Next Actions */}
      {!dumping && !dumpResult && (
        <div className="next-action fade-in">
          <h3>Ready to clone</h3>
          <p>
            {scanResult.frequency === 'hf'
              ? 'Dump the card data (crack keys + read all sectors), then write to a blank card.'
              : 'Read the card ID, then clone it to a T55xx blank.'}
          </p>
          <div className="btn-group" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={onDump}>
              {scanResult.frequency === 'hf' ? 'Dump Card Data' : 'Read Card ID'}
            </button>
            <button className="btn btn-lg" onClick={onRescan}>
              Scan Again
            </button>
          </div>
        </div>
      )}

      {dumpResult?.success && !dumping && (
        <div className="next-action fade-in">
          <h3>Write to blank card</h3>
          <p>Remove the original card and place a writable blank card on the antenna.</p>
          <div className="btn-group" style={{ justifyContent: 'center' }}>
            <button className="btn btn-success btn-lg" onClick={onWrite}>
              Select Target &amp; Write
            </button>
            <button className="btn btn-lg" onClick={onRescan}>
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
