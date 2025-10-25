// Jules's Obsidian Meld Encrypt Tool
// This tool replicates the encryption and decryption logic of the meld-encrypt plugin.
// It is intended for command-line use by an AI agent (Jules) to process encrypted notes.

// Node.js crypto library
import { webcrypto } from 'crypto';

// Polyfill atob and btoa for Node.js environment
const btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
const atob = (str: string) => Buffer.from(str, 'base64').toString('binary');

// =================================================================================
// SECTION 1: CRYPTO HELPER INTERFACE AND IMPLEMENTATIONS
// =================================================================================

interface ICryptoHelper {
	encryptToBase64(text: string, password: string): Promise<string>;
	decryptFromBase64(base64Encoded: string, password: string): Promise<string | null>;
}

/**
 * Obsolete Crypto Helper (Version 0)
 */
class CryptoHelperObsolete implements ICryptoHelper {
	private readonly algorithm = {
		name: 'AES-GCM',
		iv: new Uint8Array([196, 190, 240, 190, 188, 78, 41, 132, 15, 220, 84, 211]),
		tagLength: 128
	};

	private async buildKey(password: string): Promise<CryptoKey> {
		const passwordBytes = new TextEncoder().encode(password);
		const passwordDigest = await webcrypto.subtle.digest({ name: 'SHA-256' }, passwordBytes);
		return webcrypto.subtle.importKey('raw', passwordDigest, this.algorithm, false, ['encrypt', 'decrypt']);
	}

	public async encryptToBase64(text: string, password: string): Promise<string> {
		const key = await this.buildKey(password);
		const bytesToEncrypt = new TextEncoder().encode(text);
		const encryptedBytes = new Uint8Array(await webcrypto.subtle.encrypt(this.algorithm, key, bytesToEncrypt));
		return btoa(String.fromCharCode(...encryptedBytes));
	}

	private stringToArray(str: string): Uint8Array {
		const result = [];
		for (let i = 0; i < str.length; i++) {
			result.push(str.charCodeAt(i));
		}
		return new Uint8Array(result);
	}

	public async decryptFromBase64(base64Encoded: string, password: string): Promise<string | null> {
		try {
			const bytesToDecrypt = this.stringToArray(atob(base64Encoded));
			const key = await this.buildKey(password);
			const decryptedBytes = await webcrypto.subtle.decrypt(this.algorithm, key, bytesToDecrypt);
			return new TextDecoder().decode(decryptedBytes);
		} catch (e) {
			return null;
		}
	}
}

/**
 * Original Crypto Helper (Version 1)
 */
class CryptoHelperV1 implements ICryptoHelper {
	private readonly vectorSize = 16;
	private readonly iterations = 1000;
	private readonly salt = new TextEncoder().encode('XHWnDAT6ehMVY2zD');

	private async deriveKey(password: string): Promise<CryptoKey> {
		const buffer = new TextEncoder().encode(password);
		const key = await webcrypto.subtle.importKey('raw', buffer, { name: 'PBKDF2' }, false, ['deriveKey']);
		return webcrypto.subtle.deriveKey(
			{ name: 'PBKDF2', hash: { name: 'SHA-256' }, iterations: this.iterations, salt: this.salt },
			key,
			{ name: 'AES-GCM', length: 256 },
			false,
			['encrypt', 'decrypt']
		);
	}

	private convertToString(bytes: Uint8Array): string {
		let result = '';
		for (let idx = 0; idx < bytes.length; idx++) {
			result += String.fromCharCode(bytes[idx]);
		}
		return result;
	}

	public async encryptToBase64(text: string, password: string): Promise<string> {
		const key = await this.deriveKey(password);
		const textBytesToEncrypt = new TextEncoder().encode(text);
		const vector = webcrypto.getRandomValues(new Uint8Array(this.vectorSize));
		const encryptedBytes = new Uint8Array(await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv: vector }, key, textBytesToEncrypt));
		const finalBytes = new Uint8Array(vector.byteLength + encryptedBytes.byteLength);
		finalBytes.set(vector, 0);
		finalBytes.set(encryptedBytes, vector.byteLength);
		return btoa(this.convertToString(finalBytes));
	}

	private stringToArray(str: string): Uint8Array {
		const result = [];
		for (let i = 0; i < str.length; i++) {
			result.push(str.charCodeAt(i));
		}
		return new Uint8Array(result);
	}

	public async decryptFromBase64(base64Encoded: string, password: string): Promise<string | null> {
		try {
			const encryptedBytes = this.stringToArray(atob(base64Encoded));
			const vector = encryptedBytes.slice(0, this.vectorSize);
			const encryptedTextBytes = encryptedBytes.slice(this.vectorSize);
			const key = await this.deriveKey(password);
			const decryptedBytes = await webcrypto.subtle.decrypt({ name: 'AES-GCM', iv: vector }, key, encryptedTextBytes);
			return new TextDecoder().decode(decryptedBytes);
		} catch (e) {
			return null;
		}
	}
}

/**
 * Modern Crypto Helper (Version 2)
 */
class CryptoHelperV2 implements ICryptoHelper {
	public readonly vectorSize: number;
	public readonly saltSize: number;
	public readonly iterations: number;

	constructor(vectorSize: number, saltSize: number, iterations: number) {
		this.vectorSize = vectorSize;
		this.saltSize = saltSize;
		this.iterations = iterations;
	}

	private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
		const buffer = new TextEncoder().encode(password);
		const key = await webcrypto.subtle.importKey('raw', buffer, 'PBKDF2', false, ['deriveKey']);
		return await webcrypto.subtle.deriveKey(
			{ name: 'PBKDF2', hash: 'SHA-512', salt, iterations: this.iterations },
			key,
			{ name: 'AES-GCM', length: 256 },
			false,
			['encrypt', 'decrypt']
		);
	}

	private convertToString(bytes: Uint8Array): string {
		let result = '';
		for (let idx = 0; idx < bytes.length; idx++) {
			result += String.fromCharCode(bytes[idx]);
		}
		return result;
	}

	public async encryptToBase64(text: string, password: string): Promise<string> {
		const salt = webcrypto.getRandomValues(new Uint8Array(this.saltSize));
		const key = await this.deriveKey(password, salt);
		const textBytesToEncrypt = new TextEncoder().encode(text);
		const vector = webcrypto.getRandomValues(new Uint8Array(this.vectorSize));
		const encryptedBytes = new Uint8Array(await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv: vector }, key, textBytesToEncrypt));
		const finalBytes = new Uint8Array(vector.byteLength + salt.byteLength + encryptedBytes.byteLength);
		finalBytes.set(vector, 0);
		finalBytes.set(salt, vector.byteLength);
		finalBytes.set(encryptedBytes, vector.byteLength + salt.byteLength);
		return btoa(this.convertToString(finalBytes));
	}

	private stringToArray(str: string): Uint8Array {
		const result = [];
		for (let i = 0; i < str.length; i++) {
			result.push(str.charCodeAt(i));
		}
		return new Uint8Array(result);
	}

	public async decryptFromBase64(base64Encoded: string, password: string): Promise<string | null> {
		try {
			const encryptedBytes = this.stringToArray(atob(base64Encoded));
			const vector = encryptedBytes.slice(0, this.vectorSize);
			const salt = encryptedBytes.slice(this.vectorSize, this.vectorSize + this.saltSize);
			const encryptedTextBytes = encryptedBytes.slice(this.vectorSize + this.saltSize);
			const key = await this.deriveKey(password, salt);
			const decryptedBytes = await webcrypto.subtle.decrypt({ name: 'AES-GCM', iv: vector }, key, encryptedTextBytes);
			return new TextDecoder().decode(decryptedBytes);
		} catch (e) {
			return null;
		}
	}
}


// =================================================================================
// SECTION 2: FACTORY AND PARSING LOGIC
// =================================================================================

// In-place encryption markers, corresponds to Decryptable.version
const PREFIX_BETA = '%%🔐β ';      // Version 2
const PREFIX_BETA_VISIBLE = '🔐β '; // Version 2
const PREFIX_ALPHA = '%%🔐α ';     // Version 1
const PREFIX_ALPHA_VISIBLE = '🔐α ';// Version 1
const PREFIX_OBSOLETE = '%%🔐 ';    // Version 0
const PREFIX_OBSOLETE_VISIBLE = '🔐 ';// Version 0 (Note: plugin code doesn't show this, but we assume for safety)

const SUFFIX = ' 🔐%%';
const SUFFIX_VISIBLE = ' 🔐';

const ALL_PREFIXES = [PREFIX_BETA, PREFIX_BETA_VISIBLE, PREFIX_ALPHA, PREFIX_ALPHA_VISIBLE, PREFIX_OBSOLETE, PREFIX_OBSOLETE_VISIBLE];
const ALL_SUFFIXES = [SUFFIX, SUFFIX_VISIBLE];

const HINT_MARKER = '💡';

// The parsed result from an encrypted string
interface Decryptable {
    version: number;
    hint: string;
    base64CipherText: string;
}

// Data structure for a whole encrypted note file
interface FileData {
    version: "1.0" | "2.0";
    hint: string;
    encodedData: string;
}

class CryptoFactory {
    public static cryptoV2 = new CryptoHelperV2(16, 16, 210000);

    public static build(decryptable: Decryptable): ICryptoHelper {
        if (decryptable.version === 0) return new CryptoHelperObsolete();
        if (decryptable.version === 1) return new CryptoHelperV1();
        if (decryptable.version === 2) return CryptoFactory.cryptoV2;
        throw new Error(`Unsupported decryption version: ${decryptable.version}`);
    }

    public static buildForFile(fileData: FileData): ICryptoHelper {
        if (fileData.version === "1.0") return new CryptoHelperV1();
        if (fileData.version === "2.0") return CryptoFactory.cryptoV2;
        throw new Error(`Unsupported file data version: ${fileData.version}`);
    }
}

function parseInPlace(text: string): Decryptable | null {
    const prefix = ALL_PREFIXES.find(p => text.startsWith(p));
    const suffix = ALL_SUFFIXES.find(s => text.endsWith(s));
    if (!prefix || !suffix) return null;

    let version = -1;
    if (prefix === PREFIX_BETA || prefix === PREFIX_BETA_VISIBLE) version = 2;
    else if (prefix === PREFIX_ALPHA || prefix === PREFIX_ALPHA_VISIBLE) version = 1;
    else if (prefix === PREFIX_OBSOLETE || prefix === PREFIX_OBSOLETE_VISIBLE) version = 0;

    if(version === -1) return null;

    let content = text.substring(prefix.length, text.length - suffix.length);
    let hint = "";
    let base64CipherText = content;

    if (content.startsWith(HINT_MARKER)) {
        const hintEndIndex = content.indexOf(HINT_MARKER, HINT_MARKER.length);
        if (hintEndIndex > 0) {
            hint = content.substring(HINT_MARKER.length, hintEndIndex);
            base64CipherText = content.substring(hintEndIndex + HINT_MARKER.length);
        }
    }

    return { version, hint, base64CipherText };
}

function isWholeNote(text: string): boolean {
    try {
        const data = JSON.parse(text) as FileData;
        return data.version && data.encodedData !== undefined;
    } catch {
        return false;
    }
}

// =================================================================================
// SECTION 3: COMMAND-LINE INTERFACE AND EXECUTION
// =================================================================================

async function main() {
    // Basic argument parsing
    const args = process.argv.slice(2);
    const typeArgIndex = args.indexOf('--type');
    let encryptionType = 'inplace'; // default

    if (typeArgIndex > -1) {
        encryptionType = args[typeArgIndex + 1];
        args.splice(typeArgIndex, 2); // remove --type flag and its value
    }

    if (args.length < 3) {
        console.error("Usage: ts-node crypto-tool.ts <encrypt|decrypt> [--type inplace|wholenote] <password> \"<text>\"");
        process.exit(1);
    }

    const command = args[0];
    const password = args[1];
    const text = args[2];

    if (command === 'encrypt') {
        const helper = CryptoFactory.cryptoV2; // Always encrypt with the latest version
        const base64 = await helper.encryptToBase64(text, password);

        if (encryptionType === 'wholenote') {
            const fileData: FileData = {
                version: "2.0",
                hint: "", // Hinting not supported via tool for now
                encodedData: base64
            };
            console.log(JSON.stringify(fileData));
        } else { // 'inplace' is the default
            const result = `${PREFIX_BETA}${base64}${SUFFIX}`;
            console.log(result);
        }

    } else if (command === 'decrypt') {
        let decryptedText: string | null = null;

        if (isWholeNote(text)) {
            const fileData = JSON.parse(text) as FileData;
            const helper = CryptoFactory.buildForFile(fileData);
            decryptedText = await helper.decryptFromBase64(fileData.encodedData, password);
        } else {
            const decryptable = parseInPlace(text);
            if (!decryptable) {
                console.error("Decryption failed: could not parse in-place encryption markers.");
                process.exit(1);
            }
            const helper = CryptoFactory.build(decryptable);
            decryptedText = await helper.decryptFromBase64(decryptable.base64CipherText, password);
        }

        if (decryptedText === null) {
            console.error("Decryption failed: incorrect password or corrupted data.");
            process.exit(1);
        }
        console.log(decryptedText);

    } else {
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
}

main().catch(err => {
    console.error("An unexpected error occurred:", err);
    process.exit(1);
});
