#!/bin/bash

# Wrapper script to simplify decryption for both in-place and whole-note formats.
# Usage: ./decrypt.sh "<password>" "<encrypted_text>"

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 \"<password>\" \"<encrypted_text>\""
    exit 1
fi

PASSWORD="$1"
TEXT="$2"
BASE_DIR=$(dirname "$0")

# Execute the main TypeScript tool for decryption
npx ts-node "$BASE_DIR/crypto-tool.ts" decrypt "$PASSWORD" "$TEXT"
