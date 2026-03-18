#
# PM3 - Proxmark3 Card Clone Tool
# One-line installer for Windows
#
# Usage:
#   powershell -c "irm https://raw.githubusercontent.com/viktorbk/pm3-app/main/install.ps1 | iex"
#

$ErrorActionPreference = "Stop"

$Version = "1.0.0"
$Repo = "https://github.com/viktorbk/pm3-app.git"
$AppName = "PM3"

# ── Banner ──────────────────────────────────────────────
Write-Host ""
Write-Host "  +---------------------------------------+" -ForegroundColor Cyan
Write-Host "  |   PM3 - Proxmark3 Card Clone Tool     |" -ForegroundColor Cyan
Write-Host "  |   v$Version                               |" -ForegroundColor Cyan
Write-Host "  +---------------------------------------+" -ForegroundColor Cyan
Write-Host ""

function Write-Info($msg) { Write-Host "  info  " -NoNewline -ForegroundColor Cyan; Write-Host $msg }
function Write-Ok($msg)   { Write-Host "  ok    " -NoNewline -ForegroundColor Green; Write-Host $msg }
function Write-Warn($msg) { Write-Host "  warn  " -NoNewline -ForegroundColor Yellow; Write-Host $msg }
function Write-Fail($msg) { Write-Host "  error " -NoNewline -ForegroundColor Red; Write-Host $msg; exit 1 }

# ── Check dependencies ──────────────────────────────────
Write-Info "Checking dependencies..."

$hasGit = Get-Command git -ErrorAction SilentlyContinue
if (-not $hasGit) {
    Write-Fail "git is required. Install from https://git-scm.com"
}

$PkgMgr = $null
$hasBun = Get-Command bun -ErrorAction SilentlyContinue
$hasNpm = Get-Command npm -ErrorAction SilentlyContinue

if ($hasBun) {
    $PkgMgr = "bun"
} elseif ($hasNpm) {
    $PkgMgr = "npm"
} else {
    Write-Fail "bun or npm is required.`n         Install bun: powershell -c `"irm bun.sh/install.ps1 | iex`"`n         Install npm: https://nodejs.org"
}

Write-Info "Using $PkgMgr as package manager"

# ── Check for pm3 ───────────────────────────────────────
$hasPm3 = Get-Command pm3 -ErrorAction SilentlyContinue
if ($hasPm3) {
    Write-Ok "pm3 client found"
} else {
    Write-Warn "pm3 client not found in PATH"
    Write-Host ""
    Write-Host "  The Proxmark3 client is required to use PM3." -ForegroundColor Gray
    Write-Host "  Download from: https://github.com/RfidResearchGroup/proxmark3/releases" -ForegroundColor Gray
    Write-Host ""
}

# ── Clone & build ───────────────────────────────────────
$TmpDir = Join-Path ([System.IO.Path]::GetTempPath()) "pm3-install-$(Get-Random)"
New-Item -ItemType Directory -Path $TmpDir -Force | Out-Null

try {
    Write-Info "Cloning repository..."
    git clone --depth 1 --quiet $Repo "$TmpDir\pm3-app"
    Write-Ok "Repository cloned"

    Set-Location "$TmpDir\pm3-app"

    Write-Info "Installing dependencies..."
    & $PkgMgr install 2>&1 | Select-Object -Last 3
    Write-Ok "Dependencies installed"

    Write-Info "Building app (this may take a minute)..."
    & $PkgMgr run package:win 2>&1 | Select-String -Pattern "building|packaging|done" | ForEach-Object { Write-Host "         $_" -ForegroundColor DarkGray }
    Write-Ok "Build complete"

    # ── Install ─────────────────────────────────────────
    $InstallDir = Join-Path $env:LOCALAPPDATA "Programs\PM3"
    $ExePath = Get-ChildItem -Path "release" -Recurse -Filter "PM3.exe" | Select-Object -First 1

    # Check for NSIS installer first
    $Installer = Get-ChildItem -Path "release" -Filter "*.exe" | Where-Object { $_.Name -match "Setup|Install" } | Select-Object -First 1

    if ($Installer) {
        Write-Info "Running installer..."
        Start-Process -FilePath $Installer.FullName -Wait
        Write-Ok "Installed via setup wizard"
    } elseif ($ExePath) {
        Write-Info "Installing to $InstallDir..."
        New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null

        $AppDir = $ExePath.Directory.FullName
        Copy-Item -Path "$AppDir\*" -Destination $InstallDir -Recurse -Force
        Write-Ok "Installed to $InstallDir"

        # Add to PATH
        $UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
        if ($UserPath -notlike "*$InstallDir*") {
            [Environment]::SetEnvironmentVariable("Path", "$UserPath;$InstallDir", "User")
            Write-Ok "Added to user PATH"
        }
    } else {
        # Fall back to zip
        $ZipFile = Get-ChildItem -Path "release" -Filter "*.zip" | Select-Object -First 1
        if ($ZipFile) {
            Write-Info "Extracting to $InstallDir..."
            New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
            Expand-Archive -Path $ZipFile.FullName -DestinationPath $InstallDir -Force
            Write-Ok "Extracted to $InstallDir"
        } else {
            Write-Fail "Build produced no installable artifact"
        }
    }

    Write-Host ""
    Write-Host "  + PM3 installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Launch from Start Menu or run:" -ForegroundColor Gray
    Write-Host "    PM3.exe" -ForegroundColor DarkGray
    Write-Host ""

} finally {
    Set-Location $env:USERPROFILE
    Remove-Item -Path $TmpDir -Recurse -Force -ErrorAction SilentlyContinue
}
