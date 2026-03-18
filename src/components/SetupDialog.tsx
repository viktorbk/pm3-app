interface Props {
  onDismiss: () => void
}

export default function SetupDialog({ onDismiss }: Props) {
  return (
    <div className="dialog-overlay">
      <div className="dialog fade-in">
        <div className="dialog-header">
          <div className="dialog-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="18" rx="3" />
              <path d="M8 12h8M12 8v8" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="dialog-title">Welcome to PM3</h2>
          <p className="dialog-subtitle">
            Before you start, make sure the Proxmark3 client is installed on your system.
          </p>
        </div>

        <div className="dialog-body">
          <div className="setup-steps">
            <div className="setup-step">
              <div className="setup-step-number">1</div>
              <div className="setup-step-content">
                <h4>Install the Proxmark3 client</h4>
                <div className="setup-options">
                  <div className="setup-option">
                    <span className="setup-option-label">macOS (Homebrew)</span>
                    <code className="setup-code">brew install proxmark3</code>
                  </div>
                  <div className="setup-option">
                    <span className="setup-option-label">Linux (apt)</span>
                    <code className="setup-code">sudo apt install proxmark3</code>
                  </div>
                  <div className="setup-option">
                    <span className="setup-option-label">From source</span>
                    <code className="setup-code">git clone https://github.com/RfidResearchGroup/proxmark3.git && cd proxmark3 && make clean && make all</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="setup-step">
              <div className="setup-step-number">2</div>
              <div className="setup-step-content">
                <h4>Connect your Proxmark3</h4>
                <p>Plug in the device via USB. Verify it's detected:</p>
                <code className="setup-code">pm3 -c "hw status"</code>
              </div>
            </div>

            <div className="setup-step">
              <div className="setup-step-number">3</div>
              <div className="setup-step-content">
                <h4>Flash firmware (optional)</h4>
                <p>Update to the latest firmware for best compatibility:</p>
                <code className="setup-code">pm3-flash-all</code>
              </div>
            </div>
          </div>

          <div className="setup-links">
            <h4>Documentation</h4>
            <ul>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    window.pm3.openExternal('https://github.com/RfidResearchGroup/proxmark3/blob/master/doc/md/Installation_Instructions/README.md')
                  }}
                >
                  Installation Guide (all platforms)
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    window.pm3.openExternal('https://github.com/RfidResearchGroup/proxmark3/blob/master/doc/md/Use_of_Proxmark/2_Configuration-and-Verification.md')
                  }}
                >
                  Configuration &amp; Verification
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    window.pm3.openExternal('https://github.com/RfidResearchGroup/proxmark3')
                  }}
                >
                  RfidResearchGroup/proxmark3 (GitHub)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn btn-primary btn-lg" onClick={onDismiss}>
            I have PM3 installed
          </button>
        </div>
      </div>
    </div>
  )
}
