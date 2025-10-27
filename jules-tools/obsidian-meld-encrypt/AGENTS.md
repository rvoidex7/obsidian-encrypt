# AI Agent Instructions for `jules-tools/obsidian-meld-encrypt`

This document provides essential, step-by-step instructions for an AI agent to use the encryption and decryption tools in this directory.

## Step 1: First-Time Setup (If needed)

If this is the first time running the tool in this environment, ensure all Node.js dependencies are installed. Run this command from the **repository root**:

```bash
npm install
```

## Step 2: Verify Tool Integrity

Before starting any task, run the automated test script to ensure the tools are configured correctly and fully functional. This script will set necessary permissions and verify the crypto cycles.

From this directory (`jules-tools/obsidian-meld-encrypt/`), run:

```bash
./run-tests.sh
```

If all tests pass, you may proceed. If they fail, do not proceed and report the failure.

## Step 3: Core Commands

Use the following wrapper scripts for all encryption and decryption tasks. **Do not call `crypto-tool.ts` directly.**

It is highly recommended to use an environment variable for the password (e.g., `$PASSWORD`) to avoid exposing it in shell history.

### To Decrypt Content:
The `decrypt.sh` script works for both in-place (`%%...%%`) and whole-note (`{...}`) formats.

```bash
./decrypt.sh "$PASSWORD" "<encrypted_text>"
```

### To Encrypt Content:

**1. For In-Place Encryption** (when embedding in a `.md` file):

```bash
./encrypt-inplace.sh "$PASSWORD" "<plaintext_to_encrypt>"
```
*Output will be in the `%%🔐β...🔐%%` format.*


**2. For Whole-Note Encryption** (when creating/overwriting an `.mdenc` file):

```bash
./encrypt-wholenote.sh "$PASSWORD" "<plaintext_to_encrypt>"
```
*Output will be a JSON object: `{"version":"2.0",...}`.*

---

**Reminder:** Adhere strictly to the security protocols outlined in the main `README.md` file regarding the handling of decrypted data.
