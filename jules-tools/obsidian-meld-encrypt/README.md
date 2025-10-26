# Jules's Obsidian Meld Encrypt Tool

## 1. Purpose

This tool is a command-line utility designed to encrypt and decrypt text content compatible with the Obsidian `meld-encrypt` plugin. Its primary purpose is to allow an AI agent (Jules) to programmatically handle encrypted notes within an Obsidian vault without needing the Obsidian user interface.

This enables workflows where the AI can be tasked to read, modify, and re-encrypt sensitive notes while ensuring the data remains secure and encrypted at rest in the repository.

## 2. Usage (Primary Method: Shell Scripts)

The primary and recommended method for using this tool is through the provided wrapper scripts. They are simpler, less error-prone, and enforce secure practices.

### Prerequisites
- Node.js and npm must be installed.
- Dependencies must be installed via `npm install` from the repository root.
- The scripts must be executable (`chmod +x *.sh` has been run).

### Scripts Overview

- **`decrypt.sh`**: Decrypts any compatible encrypted text.
- **`encrypt-inplace.sh`**: Encrypts text into the in-place format (for embedding in `.md` files).
- **`encrypt-wholenote.sh`**: Encrypts text into the whole-note format (for `.mdenc` files).

### Command Syntax
```bash
# It is highly recommended to use an environment variable for the password
# to prevent it from being saved in shell history.
export PASSWORD="your-secret-password"

# Decrypting
./decrypt.sh "$PASSWORD" "<encrypted_text>"

# Encrypting
./encrypt-inplace.sh "$PASSWORD" "<plaintext_to_encrypt>"
./encrypt-wholenote.sh "$PASSWORD" "<plaintext_to_encrypt>"
```

### Examples

#### Decrypting (Universal)
The `decrypt.sh` script automatically detects the format and decrypts it.

```bash
./jules-tools/obsidian-meld-encrypt/decrypt.sh "$PASSWORD" "%%🔐β...🔐%%"
```

#### Encrypting to In-Place Format
```bash
./jules-tools/obsidian-meld-encrypt/encrypt-inplace.sh "$PASSWORD" "This is a new secret."
```
*Output: `%%🔐β...🔐%%`*

#### Encrypting to Whole-Note Format
```bash
./jules-tools/obsidian-meld-encrypt/encrypt-wholenote.sh "$PASSWORD" "This is the full content of a secret note."
```
*Output: `{"version":"2.0",...}`*

---

## 3. IMPORTANT: AI Agent Operational Protocol

**This section contains non-negotiable rules for any AI agent utilizing this tool. Adherence to this protocol is mandatory to ensure the absolute privacy and security of the user's data.**

### Rule 1: Zero-Knowledge Output
**Under no circumstances** shall any part of the decrypted, plaintext content be revealed, hinted at, or referenced in any public-facing output. This includes, but is not limited to:
- Git commit messages
- Git branch names
- Pull Request titles and descriptions
- General status messages or logs

**Example of a BAD commit message:** `Updated the API key in the secret note.`
**Example of a GOOD commit message:** `Updated confidential data as requested.` or `Performed requested modifications on encrypted note.`

### Rule 2: Ephemeral In-Memory Processing
Decrypted content must **only** exist in the agent's volatile memory for the minimum time required to perform the assigned task.
- **DO NOT** write the decrypted content to any temporary files.
- **DO NOT** log the decrypted content.
- **DO NOT** store the decrypted content in any persistent state.

The process is always: **Decrypt -> Operate in Memory -> Re-encrypt.** The plaintext is a temporary artifact, not a final output.

### Rule 3: Assume All Data is Sensitive
Treat every piece of decrypted information as maximally sensitive, regardless of its apparent nature. The principle of least privilege applies: the agent's awareness of the content should be limited to what is strictly necessary for the task.

**Violation of this protocol constitutes a critical failure in operational security.**

---
*Advanced Usage: The underlying TypeScript tool can be called directly, but this is discouraged. Refer to the script files for the exact `ts-node` syntax if needed.*
