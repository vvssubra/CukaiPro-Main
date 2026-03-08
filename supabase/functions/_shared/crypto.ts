/**
 * AES-256-GCM encrypt/decrypt for per-org MyInvois credentials.
 * Uses Web Crypto API (crypto.subtle). Key must be 256-bit, hex-encoded.
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const TAG_LENGTH = 128;

/**
 * Decode hex string to Uint8Array.
 */
function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/, '').replace(/\s/g, '');
  if (clean.length % 2 !== 0) throw new Error('Invalid hex key length');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Get a CryptoKey from a hex-encoded 256-bit key.
 */
async function getKey(hexKey: string): Promise<CryptoKey> {
  const keyBytes = hexToBytes(hexKey);
  if (keyBytes.length !== 32) throw new Error('CREDENTIALS_ENCRYPTION_KEY must be 32 bytes (256 bits), hex-encoded');
  return await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt plaintext with AES-256-GCM. Returns { ciphertextBase64, ivBase64 }.
 */
export async function encrypt(plaintext: string, hexKey: string): Promise<{ ciphertextBase64: string; ivBase64: string }> {
  const key = await getKey(hexKey);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv,
      tagLength: TAG_LENGTH,
    },
    key,
    encoded
  );

  return {
    ciphertextBase64: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
    ivBase64: btoa(String.fromCharCode(...iv)),
  };
}

/**
 * Decrypt ciphertext (base64) with iv (base64) using the hex key.
 */
export async function decrypt(ciphertextBase64: string, ivBase64: string, hexKey: string): Promise<string> {
  const key = await getKey(hexKey);
  const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(ciphertextBase64), (c) => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv,
      tagLength: TAG_LENGTH,
    },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}
