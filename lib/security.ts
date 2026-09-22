import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

/**
 * High-security Application-Level Encryption (ALE) using AES-256-GCM.
 * This ensures "Data at Rest" is encrypted before hitting the database.
 */
export function encrypt(text: string): string {
  const key = process.env.ALE_KEY;
  if (!key || key.length !== 64) {
    throw new Error('ALE_KEY must be a 32-byte hex string (64 characters).');
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
  
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Return IV + AuthTag + Encrypted Data as a single hex string
  return Buffer.concat([iv, tag, encrypted]).toString('hex');
}

export function decrypt(hexData: string): string {
  const key = process.env.ALE_KEY;
  if (!key || key.length !== 64) {
    throw new Error('ALE_KEY must be a 32-byte hex string (64 characters).');
  }

  const data = Buffer.from(hexData, 'hex');
  
  const iv = data.subarray(0, IV_LENGTH);
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = data.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
