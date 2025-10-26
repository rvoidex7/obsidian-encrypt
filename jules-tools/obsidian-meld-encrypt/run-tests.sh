#!/bin/bash

# ==============================================================================
# Jules AI Crypto Tool - Sanity Check Script
# ==============================================================================
# This script runs a series of tests to ensure the crypto tool and its
# dependencies are correctly configured and functional.
# An AI agent should run this script before attempting to use the tools.
# ==============================================================================

# Exit immediately if a command exits with a non-zero status.
set -e

BASE_DIR=$(dirname "$0")
# Navigate to the script's directory to ensure relative paths work
cd "$BASE_DIR"

# --- Test Parameters ---
TEST_PASSWORD="test-password-123"
TEST_PHRASE_INPLACE="hello inplace world"
TEST_PHRASE_WHOLENOTE="hello wholenote world"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Jules AI Crypto Tool :: Starting tests..."
echo "-----------------------------------------"

# --- Step 1: Ensure scripts are executable ---
echo "Step 1: Setting executable permissions for wrapper scripts..."
chmod +x ./encrypt-inplace.sh
chmod +x ./encrypt-wholenote.sh
chmod +x ./decrypt.sh
echo -e "${GREEN}Permissions set successfully.${NC}"
echo ""

# --- Step 2: Test In-place Encryption/Decryption Cycle ---
echo "Step 2: Testing in-place encryption and decryption cycle..."
# Encrypt
ENCRYPTED_INPLACE=$(./encrypt-inplace.sh "$TEST_PASSWORD" "$TEST_PHRASE_INPLACE")
echo "   - Encrypted: $ENCRYPTED_INPLACE"
# Decrypt
DECRYPTED_INPLACE=$(./decrypt.sh "$TEST_PASSWORD" "$ENCRYPTED_INPLACE")
echo "   - Decrypted: $DECRYPTED_INPLACE"

# Verify
if [ "$DECRYPTED_INPLACE" != "$TEST_PHRASE_INPLACE" ]; then
    echo -e "${RED}FAILED: In-place decryption result does not match original phrase.${NC}"
    exit 1
fi
echo -e "${GREEN}In-place cycle test passed!${NC}"
echo ""

# --- Step 3: Test Whole-note Encryption/Decryption Cycle ---
echo "Step 3: Testing whole-note encryption and decryption cycle..."
# Encrypt
ENCRYPTED_WHOLENOTE=$(./encrypt-wholenote.sh "$TEST_PASSWORD" "$TEST_PHRASE_WHOLENOTE")
echo "   - Encrypted: $ENCRYPTED_WHOLENOTE"
# Decrypt
DECRYPTED_WHOLENOTE=$(./decrypt.sh "$TEST_PASSWORD" "$ENCRYPTED_WHOLENOTE")
echo "   - Decrypted: $DECRYPTED_WHOLENOTE"

# Verify
if [ "$DECRYPTED_WHOLENOTE" != "$TEST_PHRASE_WHOLENOTE" ]; then
    echo -e "${RED}FAILED: Whole-note decryption result does not match original phrase.${NC}"
    exit 1
fi
echo -e "${GREEN}Whole-note cycle test passed!${NC}"
echo ""

# --- All Tests Passed ---
echo "-----------------------------------------"
echo -e "${GREEN}✅ All tests passed successfully! The tool is ready to use.${NC}"

exit 0
