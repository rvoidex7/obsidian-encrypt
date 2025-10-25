# Jules's Obsidian Meld Encrypt Tool

## 1. Purpose

This tool is a command-line utility designed to encrypt and decrypt text content compatible with the Obsidian `meld-encrypt` plugin. Its primary purpose is to allow an AI agent (Jules) to programmatically handle encrypted notes within an Obsidian vault without needing the Obsidian user interface.

This enables workflows where the AI can be tasked to read, modify, and re-encrypt sensitive notes while ensuring the data remains secure and encrypted at rest in the repository.

## 2. Usage

The tool is a TypeScript script (`crypto-tool.ts`) that can be executed using `ts-node`.

### Prerequisites
- Node.js and npm must be installed.
- Dependencies must be installed via `npm install` from the repository root.

### Command Syntax
```bash
npx ts-node /path/to/crypto-tool.ts <command> [--type <encryptionType>] <password> "<text>"
```

- **`<command>`**: Can be `encrypt` or `decrypt`.
- **`[--type <encryptionType>]`**: (Optional) Specifies the output format for encryption. Can be `inplace` (default) or `wholenote`. This flag is only used with the `encrypt` command.
- **`<password>`**: The password for the operation.
- **`"<text>"`**: The text to be processed. **It is crucial to wrap the text in quotes** to handle special characters and multi-word strings correctly.

### Examples

#### Encrypting Text (In-Place)
This is the default behavior. It wraps the encrypted content with markers.

```bash
npx ts-node jules-tools/obsidian-meld-encrypt/crypto-tool.ts encrypt "supersecret" "This is a secret note."
```
*Output will be in `%%🔐β...🔐%%` format.*

#### Encrypting Text (Whole-Note)
This is used when updating an entire `.mdenc` file. It outputs a JSON structure.

```bash
npx ts-node jules-tools/obsidian-meld-encrypt/crypto-tool.ts encrypt --type wholenote "supersecret" "This is a secret note."
```
*Output will be in `{"version":"2.0",...}` format.*


#### Decrypting Text
Decryption is automatic. The tool inspects the input text to determine if it's in-place or whole-note format and decrypts it accordingly.

```bash
# Decrypting an in-place string
npx ts-node jules-tools/obsidian-meld-encrypt/crypto-tool.ts decrypt "supersecret" "%%🔐β LJyttF6oRVBDWpvvm/c/jWlcegwnjYlG7oaAGUkLTVLA+Bs07HLdVFtfrnJJBnBezkO0jWZvrTm1ROg= 🔐%%"

# Decrypting a whole-note JSON structure
npx ts-node jules-tools/obsidian-meld-encrypt/crypto-tool.ts decrypt "supersecret" '{"version":"2.0","hint":"","encodedData":"..."}'
```

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
