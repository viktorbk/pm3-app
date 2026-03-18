import { useState } from 'react'
import type { ScanResult, DumpResult, WriteResult, CardType } from '../types'
import CardGallery, { TARGET_CARDS } from './CardGallery'

interface Props {
  scanResult: ScanResult
  dumpResult: DumpResult
  onComplete: (result: WriteResult) => void
  onBack: () => void
}

export default function WritePanel({ scanResult, dumpResult, onComplete, onBack }: Props) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [writing, setWriting] = useState(false)
  const [writeResult, setWriteResult] = useState<WriteResult | null>(null)

  // Filter target cards by matching frequency
  const availableTargets = TARGET_CARDS.filter(
    (c) => c.frequency === scanResult.frequency
  )

  const handleWrite = async () => {
    setWriting(true)
    try {
      let result: WriteResult
      if (scanResult.frequency === 'hf') {
        result = await window.pm3.writeHF(dumpResult.dumpFile)
      } else if (scanResult.cardType === 'EM4100') {
        result = await window.pm3.writeLFEM(scanResult.uid)
      } else if (scanResult.cardType === 'HID Prox') {
        result = await window.pm3.writeLFHID(scanResult.uid)
      } else {
        result = {
          success: false,
          method: 'unknown',
          verifiedUid: '',
          message: `Unsupported card type for writing: ${scanResult.cardType}`,
          raw: '',
        }
      }
      setWriteResult(result)
      onComplete(result)
    } catch (err: any) {
      const result: WriteResult = {
        success: false,
        method: 'error',
        verifiedUid: '',
        message: err.message || 'Write failed',
        raw: '',
      }
      setWriteResult(result)
    }
    setWriting(false)
  }

  if (writing) {
    return (
      <div className="loading-section fade-in">
        <div className="spinner spinner-lg" />
        <div className="loading-text">Writing to card...</div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Do NOT remove the card from the antenna!
        </p>
      </div>
    )
  }

  if (writeResult) {
    return (
      <div className="fade-in" style={{ padding: '20px 0' }}>
        <div
          style={{
            width: 72,
            height: 72,
            margin: '0 auto 20px',
            borderRadius: '50%',
            background: writeResult.success ? 'var(--success-dim)' : 'var(--error-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            color: writeResult.success ? 'var(--success)' : 'var(--error)',
          }}
        >
          {writeResult.success ? (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, marginBottom: 8 }}>
            {writeResult.success ? 'Clone Successful!' : 'Write Failed'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8 }}>
            {writeResult.message}
          </p>
          {writeResult.verifiedUid && (
            <p style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
              Method: {writeResult.method}
            </p>
          )}
          {writeResult.verifiedUid && (
            <p style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--success)' }}>
              Verified UID: {writeResult.verifiedUid}
            </p>
          )}

          <div className="btn-group" style={{ justifyContent: 'center', marginTop: 28 }}>
            {!writeResult.success && (
              <button className="btn btn-primary btn-lg" onClick={handleWrite}>
                Retry Write
              </button>
            )}
            <button className="btn btn-lg" onClick={onBack}>
              Clone Another Card
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Steps */}
      <div className="steps">
        <div className="step done">
          <div className="step-number">1</div>
          <span>Scan</span>
        </div>
        <div className="step-connector done" />
        <div className="step done">
          <div className="step-number">2</div>
          <span>Dump</span>
        </div>
        <div className="step-connector" />
        <div className="step active">
          <div className="step-number">3</div>
          <span>Write</span>
        </div>
      </div>

      {/* Source card info */}
      <div className="result-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Source card</span>
            <h3 style={{ fontSize: 16 }}>{scanResult.cardType}</h3>
            <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)' }}>
              UID: {scanResult.uid}
            </span>
          </div>
          <span className={`result-badge ${scanResult.frequency}`}>
            {scanResult.frequency === 'hf' ? 'HF' : 'LF'}
          </span>
        </div>
      </div>

      {/* Target card selection */}
      <CardGallery
        cards={availableTargets}
        selected={selectedCard}
        onSelect={(card: CardType) => setSelectedCard(card.id)}
        title="Select target card type"
      />

      {/* Write button */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--warning)', marginBottom: 16 }}>
          Place the blank writable card on the antenna before pressing Write
        </p>
        <div className="btn-group" style={{ justifyContent: 'center' }}>
          <button
            className="btn btn-success btn-lg"
            onClick={handleWrite}
            disabled={!selectedCard}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Write to Card
          </button>
          <button className="btn btn-lg" onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  )
}
