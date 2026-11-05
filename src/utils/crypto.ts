/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Cryptographically safe password hashing using Web Crypto API SHA-256 with salt
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '::epss_salt::' + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt(length = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  return Array.from(values).map(x => charset[x % charset.length]).join('');
}
