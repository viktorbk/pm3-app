# PM3 — Proxmark3 Card Clone Tool

A desktop app for reading, dumping, and cloning RFID cards using the [Proxmark3](https://github.com/RfidResearchGroup/proxmark3) device. Built with Electron, React, and Vite.

## Features

- **Device Status** — connection, FPGA, flash memory, antenna voltage monitoring
- **Antenna Tuning** — visual voltage bars for LF (125 kHz) and HF (13.56 MHz) antennas
- **Card Scanning** — auto-detect, HF scan, or LF scan with parsed results
- **Key Cracking** — automatic Mifare Classic key recovery via `autopwn`
- **Card Cloning** — write dumps to Gen1a/Gen2 magic cards (HF) or T55xx blanks (LF)
- **Card Gallery** — visual selector for target card types (cards, key fobs, coins, wristbands, stickers)
- **Operation Log** — persistent history of all operations
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

## Quick Install (from source)

### macOS / Linux

```bash
git clone https://github.com/viktorbk/pm3-app.git && cd pm3-app && npm install && npm run package
```

The built app will be in the `release/` folder:
- **macOS**: `release/PM3-1.0.0-mac-x64.dmg`
- **Linux**: `release/PM3-1.0.0-linux-x64.AppImage`

### Windows (PowerShell)

```powershell
git clone https://github.com/viktorbk/pm3-app.git; cd pm3-app; npm install; npm run package:win
```

The installer will be at `release/PM3-1.0.0-win-x64.exe`.

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
│   │   └── LogViewer.tsx      # Operation history viewer
│   ├── types.ts          # Shared TypeScript types
│   └── index.css         # Dark theme styles
├── clone-card.sh         # Standalone CLI clone script
└── package.json
```

## License

MIT
