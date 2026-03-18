#!/bin/bash
#
# PM3 — Proxmark3 Card Clone Tool
# One-line installer for macOS and Linux
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/viktorbk/pm3-app/main/install.sh | bash
#

set -euo pipefail

REPO="https://github.com/viktorbk/pm3-app.git"
APP_NAME="PM3"
VERSION="1.0.0"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
DIM='\033[2m'
NC='\033[0m'

info()  { echo -e "${CYAN}info${NC}  $1"; }
ok()    { echo -e "${GREEN}ok${NC}    $1"; }
warn()  { echo -e "${YELLOW}warn${NC}  $1"; }
fail()  { echo -e "${RED}error${NC} $1"; exit 1; }

# ── Banner ──────────────────────────────────────────────
echo ""
echo -e "${CYAN}  ╔═══════════════════════════════════════╗${NC}"
echo -e "${CYAN}  ║   ${NC}PM3 — Proxmark3 Card Clone Tool    ${CYAN}║${NC}"
echo -e "${CYAN}  ║   ${DIM}v${VERSION}${NC}                                ${CYAN}║${NC}"
echo -e "${CYAN}  ╚═══════════════════════════════════════╝${NC}"
echo ""

# ── Detect OS & arch ────────────────────────────────────
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Darwin) PLATFORM="mac" ;;
  Linux)  PLATFORM="linux" ;;
  *)      fail "Unsupported OS: $OS. Use the Windows installer instead." ;;
esac

case "$ARCH" in
  x86_64|amd64) ARCH_LABEL="x64" ;;
  arm64|aarch64) ARCH_LABEL="arm64" ;;
  *)             ARCH_LABEL="x64" ;;
esac

info "Detected ${GREEN}${OS}${NC} (${ARCH_LABEL})"

# ── Check dependencies ──────────────────────────────────
check_cmd() {
  if ! command -v "$1" &>/dev/null; then
    return 1
  fi
  return 0
}

if ! check_cmd git; then
  fail "git is required. Install it first: https://git-scm.com"
fi

# Prefer bun, fall back to npm
PKG_MGR=""
if check_cmd bun; then
  PKG_MGR="bun"
elif check_cmd npm; then
  PKG_MGR="npm"
else
  fail "bun or npm is required.\n       Install bun: curl -fsSL https://bun.sh/install | bash\n       Install npm: https://nodejs.org"
fi

info "Using ${GREEN}${PKG_MGR}${NC} as package manager"

# ── Check for pm3 ───────────────────────────────────────
if check_cmd pm3; then
  ok "pm3 client found at $(which pm3)"
else
  warn "pm3 client not found in PATH"
  echo ""
  echo -e "  The Proxmark3 client is required to use PM3."
  echo -e "  Install it before running the app:"
  echo ""
  if [[ "$PLATFORM" == "mac" ]]; then
    echo -e "    ${DIM}brew install proxmark3${NC}"
  else
    echo -e "    ${DIM}sudo apt install proxmark3${NC}"
  fi
  echo -e "    ${DIM}# or build from source:${NC}"
  echo -e "    ${DIM}https://github.com/RfidResearchGroup/proxmark3${NC}"
  echo ""
fi

# ── Clone & build ───────────────────────────────────────
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

info "Cloning repository..."
git clone --depth 1 --quiet "$REPO" "$TMPDIR/pm3-app"
ok "Repository cloned"

cd "$TMPDIR/pm3-app"

info "Installing dependencies..."
$PKG_MGR install --no-progress 2>&1 | tail -3
ok "Dependencies installed"

info "Building app (this may take a minute)..."
if [[ "$PLATFORM" == "mac" ]]; then
  $PKG_MGR run package:mac 2>&1 | grep -E "building|packaging|signing|✓|done" || true
else
  $PKG_MGR run package:linux 2>&1 | grep -E "building|packaging|✓|done" || true
fi
ok "Build complete"

# ── Install ─────────────────────────────────────────────
if [[ "$PLATFORM" == "mac" ]]; then
  DMG=$(find release -name "*.dmg" | head -1)
  if [[ -z "$DMG" ]]; then
    # Fall back to the .app in the mac directory
    APP_SRC=$(find release -name "PM3.app" -maxdepth 2 | head -1)
    if [[ -z "$APP_SRC" ]]; then
      fail "Build produced no installable artifact"
    fi
    info "Installing to /Applications..."
    rm -rf "/Applications/PM3.app"
    cp -R "$APP_SRC" "/Applications/PM3.app"
    ok "Installed to /Applications/PM3.app"
  else
    info "Installing from DMG..."
    MOUNT_POINT=$(hdiutil attach "$DMG" -nobrowse -quiet | tail -1 | awk '{print $3}')
    rm -rf "/Applications/PM3.app"
    cp -R "$MOUNT_POINT/PM3.app" "/Applications/PM3.app"
    hdiutil detach "$MOUNT_POINT" -quiet
    ok "Installed to /Applications/PM3.app"
  fi

  echo ""
  echo -e "${GREEN}  ✓ PM3 installed successfully!${NC}"
  echo ""
  echo -e "  Launch from Applications or run:"
  echo -e "    ${DIM}open /Applications/PM3.app${NC}"
  echo ""

elif [[ "$PLATFORM" == "linux" ]]; then
  APPIMAGE=$(find release -name "*.AppImage" | head -1)
  INSTALL_DIR="${HOME}/.local/bin"
  mkdir -p "$INSTALL_DIR"

  if [[ -n "$APPIMAGE" ]]; then
    cp "$APPIMAGE" "$INSTALL_DIR/pm3-app"
    chmod +x "$INSTALL_DIR/pm3-app"
    ok "Installed to $INSTALL_DIR/pm3-app"
  else
    DEB=$(find release -name "*.deb" | head -1)
    if [[ -n "$DEB" ]]; then
      info "Installing .deb package..."
      sudo dpkg -i "$DEB" || sudo apt-get install -f -y
      ok "Installed via dpkg"
    else
      fail "Build produced no installable artifact"
    fi
  fi

  echo ""
  echo -e "${GREEN}  ✓ PM3 installed successfully!${NC}"
  echo ""
  echo -e "  Run with:"
  echo -e "    ${DIM}pm3-app${NC}"
  echo ""

  # Check if ~/.local/bin is in PATH
  if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    warn "$INSTALL_DIR is not in your PATH"
    echo -e "  Add it:  ${DIM}export PATH=\"\$HOME/.local/bin:\$PATH\"${NC}"
    echo ""
  fi
fi
