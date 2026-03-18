#!/bin/bash
#
# Proxmark3 Card Clone Tool
# Reads an RFID card and clones it to a blank card
#

set -euo pipefail

DUMP_DIR="$HOME/proxmark-dumps"
mkdir -p "$DUMP_DIR"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[*]${NC} $1"; }
ok()    { echo -e "${GREEN}[+]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
fail()  { echo -e "${RED}[-]${NC} $1"; }

pm3_cmd() {
    pm3 -c "$1" 2>&1
}

wait_for_enter() {
    echo ""
    read -rp "    Press ENTER when ready..."
    echo ""
}

# --- Step 1: Detect card type ---
detect_card() {
    info "Scanning for card... Place it on the Proxmark3 antenna."
    wait_for_enter

    # Try HF first
    local hf_result
    hf_result=$(pm3_cmd "hf 14a reader -s" 2>&1) || true

    if echo "$hf_result" | grep -q "UID:"; then
        CARD_TYPE="hf"
        CARD_UID=$(echo "$hf_result" | grep "UID:" | head -1 | awk '{print $3$4$5$6}')
        CARD_SAK=$(echo "$hf_result" | grep "SAK:" | head -1 | awk '{print $3}')
        ok "HF card detected!"
        echo "    UID: $CARD_UID"
        echo "    SAK: $CARD_SAK"
        return 0
    fi

    # Try LF
    local lf_result
    lf_result=$(pm3_cmd "lf search" 2>&1) || true

    if echo "$lf_result" | grep -qi "valid.*found\|tag found\|chipset"; then
        CARD_TYPE="lf"
        ok "LF card detected!"
        echo "$lf_result" | grep -E "^\[.\]" | head -10
        return 0
    fi

    fail "No card detected on HF or LF."
    return 1
}

# --- Step 2: Dump HF card ---
dump_hf() {
    info "Running autopwn to crack keys and dump card..."
    echo ""

    local result
    result=$(pm3_cmd "hf mf autopwn" 2>&1) || true

    echo "$result" | grep -E "^\[.\]" | tail -30

    # Find the dump file
    DUMP_FILE=$(echo "$result" | grep -o "Saved.*binary file.*" | grep -oE '/[^ `]+\.bin' | head -1)

    if [[ -z "$DUMP_FILE" ]]; then
        fail "Dump failed. Could not read card data."
        return 1
    fi

    # Copy dump to our directory with timestamp
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local dest="$DUMP_DIR/hf-mf-${CARD_UID}-${timestamp}.bin"
    cp "$DUMP_FILE" "$dest"
    DUMP_FILE="$dest"

    ok "Card dumped to: $DUMP_FILE"
    return 0
}

# --- Step 2 alt: Dump LF card ---
dump_lf() {
    info "Reading LF card..."

    local result
    result=$(pm3_cmd "lf search" 2>&1) || true

    # Check for EM410x
    if echo "$result" | grep -qi "EM410x"; then
        LF_TYPE="em"
        LF_ID=$(echo "$result" | grep -i "EM 410x ID" | grep -oE '[0-9A-Fa-f]{10}' | head -1)
        ok "EM410x card found! ID: $LF_ID"
        return 0
    fi

    # Check for HID
    if echo "$result" | grep -qi "HID"; then
        LF_TYPE="hid"
        LF_RAW=$(echo "$result" | grep -i "raw" | head -1)
        ok "HID card found!"
        echo "    $LF_RAW"
        return 0
    fi

    # Check for Indala
    if echo "$result" | grep -qi "Indala"; then
        LF_TYPE="indala"
        ok "Indala card found!"
        return 0
    fi

    fail "Could not identify LF card type."
    return 1
}

# --- Step 3: Write to blank card ---
write_hf() {
    info "Ready to write to blank card."
    warn "Remove the original card and place a BLANK magic Mifare card on the antenna."
    wait_for_enter

    # Verify blank card is present
    local reader_result
    reader_result=$(pm3_cmd "hf 14a reader -s" 2>&1) || true

    if ! echo "$reader_result" | grep -q "UID:"; then
        fail "No card detected. Make sure the blank card is on the antenna."
        return 1
    fi

    local blank_uid
    blank_uid=$(echo "$reader_result" | grep "UID:" | head -1 | awk '{print $3$4$5$6}')
    info "Blank card detected (UID: $blank_uid)"

    # Try Gen1a first
    info "Attempting Gen1a write..."
    local write_result
    write_result=$(pm3_cmd "hf mf cload -f $DUMP_FILE" 2>&1) || true

    if echo "$write_result" | grep -qi "done\|loaded.*blocks"; then
        ok "Gen1a write successful!"
        verify_hf
        return 0
    fi

    # Try Gen2 (CUID) - write with keys
    warn "Gen1a failed, trying Gen2/CUID write..."
    write_result=$(pm3_cmd "hf mf restore -f $DUMP_FILE" 2>&1) || true

    if echo "$write_result" | grep -qi "done\|restore complete"; then
        ok "Gen2 write successful!"
        verify_hf
        return 0
    fi

    fail "Write failed. Your blank card may not be compatible."
    echo "    Supported blank types: Gen1a, Gen2 (CUID/FUID) magic Mifare cards"
    return 1
}

write_lf() {
    info "Ready to write to blank card."
    warn "Remove the original card and place a BLANK T55xx card/fob on the antenna."
    wait_for_enter

    case "$LF_TYPE" in
        em)
            info "Cloning EM410x ID $LF_ID to T55xx..."
            local result
            result=$(pm3_cmd "lf em 410x clone --id $LF_ID" 2>&1) || true
            if echo "$result" | grep -qi "done\|written\|success"; then
                ok "EM410x clone successful!"
            else
                fail "Clone failed."
                echo "$result" | grep -E "^\[.\]" | tail -5
                return 1
            fi
            ;;
        hid)
            info "Cloning HID card to T55xx..."
            local result
            result=$(pm3_cmd "lf hid clone $LF_RAW" 2>&1) || true
            if echo "$result" | grep -qi "done\|written\|success"; then
                ok "HID clone successful!"
            else
                fail "Clone failed."
                return 1
            fi
            ;;
        *)
            fail "Unsupported LF card type: $LF_TYPE"
            return 1
            ;;
    esac

    # Verify
    info "Verifying... keep card on antenna."
    local verify
    verify=$(pm3_cmd "lf search" 2>&1) || true
    echo "$verify" | grep -E "^\[.\]" | head -5
    ok "Done!"
}

verify_hf() {
    info "Verifying clone..."
    local verify
    verify=$(pm3_cmd "hf 14a reader -s" 2>&1) || true
    local new_uid
    new_uid=$(echo "$verify" | grep "UID:" | head -1 | awk '{print $3$4$5$6}')

    if [[ "$new_uid" == "$CARD_UID" ]]; then
        ok "UID matches: $new_uid"
    else
        warn "UID mismatch! Expected $CARD_UID, got $new_uid"
    fi
}

# --- Main ---
main() {
    echo ""
    echo -e "${CYAN}=================================${NC}"
    echo -e "${CYAN}  Proxmark3 Card Clone Tool${NC}"
    echo -e "${CYAN}=================================${NC}"
    echo ""

    # Detect
    if ! detect_card; then
        fail "Exiting."
        exit 1
    fi

    echo ""

    # Dump
    case "$CARD_TYPE" in
        hf)
            if ! dump_hf; then exit 1; fi
            echo ""
            write_hf
            ;;
        lf)
            if ! dump_lf; then exit 1; fi
            echo ""
            write_lf
            ;;
    esac

    echo ""
    ok "All done! Dumps saved in: $DUMP_DIR"
    echo ""
}

main
