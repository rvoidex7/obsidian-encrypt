#!/bin/bash

# Wrapper script to simplify in-place encryption.
# Usage: ./encrypt-inplace.sh "<password>" "<text_to_encrypt>"

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 \"<password>\" \"<text_to_encrypt>\""
    exit 1
fi

PASSWORD="$1"
TEXT="$2"
BASE_DIR=$(dirname "$0")

# Execute the main TypeScript tool
npx ts-node "$BASE_DIR/crypto-tool.ts" encrypt --type inplace "$PASSWORD" "$TEXT"
