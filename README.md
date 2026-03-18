# PM3 — Proxmark3 Card Clone Tool

A desktop app for reading, dumping, and cloning RFID cards using the [Proxmark3](https://github.com/RfidResearchGroup/proxmark3) device. Built with Electron, React, and Vite.

## Install

### macOS & Linux

```bash
curl -fsSL https://raw.githubusercontent.com/viktorbk/pm3-app/main/install.sh | bash
```

### Windows

```powershell
powershell -c "irm https://raw.githubusercontent.com/viktorbk/pm3-app/main/install.ps1 | iex"
```

<details>
<summary>View install script (macOS & Linux)</summary>

The script performs these steps:

1. Detects your OS and architecture
2. Checks for `git` and `bun`/`npm`
3. Clones the repository to a temp directory
4. Installs dependencies and builds the Electron app
5. **macOS**: Mounts the DMG and copies `PM3.app` to `/Applications`
6. **Linux**: Copies the AppImage to `~/.local/bin/pm3-app`
7. Cleans up the temp directory

```bash
curl -fsSL https://raw.githubusercontent.com/viktorbk/pm3-app/main/install.sh | bash
```

**Requirements**: `git` and either `bun` or `npm`/`node`

[View full script](install.sh)
</details>

<details>
<summary>View install script (Windows)</summary>

The script performs these steps:

1. Checks for `git` and `bun`/`npm`
2. Clones the repository to a temp directory
3. Installs dependencies and builds the Electron app
4. Runs the NSIS installer or extracts to `%LOCALAPPDATA%\Programs\PM3`
5. Adds to user PATH
6. Cleans up the temp directory

```powershell
powershell -c "irm https://raw.githubusercontent.com/viktorbk/pm3-app/main/install.ps1 | iex"
```

**Requirements**: `git` and either `bun` or `npm`/`node`

[View full script](install.ps1)
</details>

### Manual build

```bash
git clone https://github.com/viktorbk/pm3-app.git
cd pm3-app
npm install    # or: bun install
npm run package  # builds for your current platform
```

The packaged app will be in the `release/` folder.

## Features

- **Device Status** — connection, FPGA, flash memory, antenna voltage monitoring
- **Antenna Tuning** — visual voltage bars for LF (125 kHz) and HF (13.56 MHz) antennas
- **Card Scanning** — auto-detect, HF scan, or LF scan with parsed results
- **Key Cracking** — automatic Mifare Classic key recovery via `autopwn`
- **Card Cloning** — write dumps to Gen1a/Gen2 magic cards (HF) or T55xx blanks (LF)
- **Card Gallery** — visual selector for target card types (cards, key fobs, coins, wristbands, stickers)
- **Operation Log** — persistent history of all operations with re-write from saved dumps
- **CLI Script** — standalone `clone-card.sh` bash script for terminal-only cloning

## Supported Cards

### Readable (Source)
| Type | Frequency | Notes |
|------|-----------|-------|
| Mifare Classic 1K/4K | HF 13.56 MHz | Most common access card |
| Mifare Ultralight / NTAG | HF 13.56 MHz | NFC stickers and tags |
| EM4100 | LF 125 kHz | Common keyfobs and cards |
| HID ProxCard | LF 125 kHz | HID access control |
| Indala | LF 125 kHz | Indala access cards |

### Writable (Target)
| Type | Frequency | Notes |
|------|-----------|-------|
| Magic Gen1a / Gen2 (CUID/FUID) | HF 13.56 MHz | Mifare Classic clones |
| T55xx Card / Key Fob / Coin / Wristband | LF 125 kHz | EM4100 / HID clones |

## Prerequisites

- **Proxmark3** device (PM3 Easy, RDV4, or compatible clone)
- **Proxmark3 client** (`pm3`) installed and in your PATH
  - Install via Homebrew: `brew install proxmark3`
  - Or build from source: [RfidResearchGroup/proxmark3](https://github.com/RfidResearchGroup/proxmark3)

## Development

```bash
# Install dependencies
bun install
# or
npm install

# Run in dev mode (hot reload)
bun run dev
# or
npm run dev
```

## CLI Script

If you prefer the terminal, use the included bash script:

```bash
chmod +x clone-card.sh
./clone-card.sh
```

The script walks you through: scan → dump → write, with support for Mifare Classic (HF) and EM4100/HID (LF) cards.

## How It Works

1. **Connect** your Proxmark3 via USB — the app auto-detects the device
2. **Scan** — place your card on the antenna and click Scan (HF, LF, or Auto Detect)
3. **Dump** — the app cracks keys (Mifare) or reads the card ID (EM/HID)
4. **Write** — swap to a blank writable card, select the target type, and click Write

## Tech Stack

- **Electron** — desktop shell
- **React 18** — UI framework
- **Vite** — build tool
- **TypeScript** — type safety
- **electron-builder** — packaging and distribution

## Project Structure

```
pm3-app/
├── electron/
│   ├── main.ts          # Electron main process, IPC handlers
│   ├── preload.ts       # Context bridge API
│   ├── pm3.ts           # Proxmark3 CLI wrapper and output parser
│   └── database.ts      # JSON-based persistent storage
├── src/
│   ├── App.tsx           # Main app with workflow state machine
│   ├── components/
│   │   ├── DeviceStatus.tsx   # Sidebar device info panel
│   │   ├── ScanPanel.tsx      # Card scanning UI
│   │   ├── ResultsPanel.tsx   # Scan results and dump controls
│   │   ├── WritePanel.tsx     # Write workflow with card gallery
│   │   ├── CardGallery.tsx    # SVG card type illustrations
│   │   ├── SetupDialog.tsx    # First-launch setup wizard
│   │   ├── HistoryPanel.tsx   # Operation history & saved dumps
│   │   └── LogViewer.tsx      # Bottom log bar
│   ├── types.ts          # Shared TypeScript types
│   └── index.css         # Dark theme styles
├── install.sh            # One-line installer (macOS/Linux)
├── install.ps1           # One-line installer (Windows)
├── clone-card.sh         # Standalone CLI clone script
└── package.json
```

## License

MIT
