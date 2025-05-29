/**
 * Cryptographic utilities for secure random generation
 */

import crypto from 'crypto';

export class SecureRandom {
  /**
   * Generate cryptographically secure random bytes
   * @param {number} length - Number of bytes to generate
   * @returns {Buffer} Random bytes
   */
  static generateBytes(length) {
    return crypto.randomBytes(length);
  }
  
  /**
   * Generate a secure random private key (32 bytes)
   * @returns {Buffer} 32-byte private key
   */
  static generatePrivateKey() {
    return this.generateBytes(32);
  }
  
  /**
   * Generate a random hex string of specified length
   * @param {number} length - Length of hex string (must be even)
   * @returns {string} Random hex string
   */
  static generateHex(length) {
    if (length % 2 !== 0) {
      throw new Error('Hex length must be even');
    }
    return this.generateBytes(length / 2).toString('hex');
  }
}

export class FastRandom {
  /**
   * Generate pseudo-random hex string (faster but less secure)
   * @param {number} length - Length of hex string
   * @returns {string} Random hex string
   */
  static generateHex(length) {
    const chars = '0123456789ABCDEF';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  /**
   * Generate pseudo-random private key
   * @returns {Buffer} 32-byte private key
   */
  static generatePrivateKey() {
    return Buffer.from(this.generateHex(64), 'hex');
  }
}

export default { SecureRandom, FastRandom };