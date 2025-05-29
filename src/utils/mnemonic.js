/**
 * Mnemonic phrase generation and wallet derivation utilities
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { SecureRandom, FastRandom } from './crypto.js';

// Initialize factories
const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);

export class MnemonicGenerator {
  constructor(options = {}) {
    this.network = options.network === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
    this.useSecureRandom = options.useSecureRandom !== false;
    
    // Standard derivation paths
    this.derivationPaths = {
      legacy: "m/44'/0'/0'/0", // BIP44 - Legacy addresses
      segwit: "m/84'/0'/0'/0", // BIP84 - Native SegWit
      nested: "m/49'/0'/0'/0"  // BIP49 - Nested SegWit
    };
  }
  
  /**
   * Generate a random mnemonic phrase
   * @param {number} strength - Entropy strength (128, 160, 192, 224, 256)
   * @returns {string} Mnemonic phrase
   */
  generateMnemonic(strength = 128) {
    if (this.useSecureRandom) {
      const entropy = SecureRandom.generateBytes(strength / 8);
      return bip39.entropyToMnemonic(entropy.toString('hex'));
    } else {
      // For testing/performance - not cryptographically secure
      return bip39.generateMnemonic(strength);
    }
  }
  
  /**
   * Generate mnemonic from custom entropy
   * @param {string|Buffer} entropy - Custom entropy
   * @returns {string} Mnemonic phrase
   */
  mnemonicFromEntropy(entropy) {
    if (typeof entropy === 'string') {
      entropy = Buffer.from(entropy, 'hex');
    }
    return bip39.entropyToMnemonic(entropy.toString('hex'));
  }
  
  /**
   * Validate mnemonic phrase
   * @param {string} mnemonic - Mnemonic phrase to validate
   * @returns {boolean} True if valid
   */
  validateMnemonic(mnemonic) {
    return bip39.validateMnemonic(mnemonic);
  }
  
  /**
   * Generate seed from mnemonic
   * @param {string} mnemonic - Mnemonic phrase
   * @param {string} passphrase - Optional passphrase
   * @returns {Buffer} Seed buffer
   */
  mnemonicToSeed(mnemonic, passphrase = '') {
    return bip39.mnemonicToSeedSync(mnemonic, passphrase);
  }
  
  /**
   * Derive wallet from mnemonic for specific address type
   * @param {string} mnemonic - Mnemonic phrase
   * @param {string} addressType - 'legacy', 'segwit', or 'nested'
   * @param {number} accountIndex - Account index (default 0)
   * @param {number} addressIndex - Address index (default 0)
   * @param {string} passphrase - Optional passphrase
   * @returns {Object} Wallet object
   */
  deriveWallet(mnemonic, addressType = 'legacy', accountIndex = 0, addressIndex = 0, passphrase = '') {
    if (!this.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }
    
    const seed = this.mnemonicToSeed(mnemonic, passphrase);
    const root = bip32.fromSeed(seed, this.network);
    
    // Get derivation path
    let basePath = this.derivationPaths[addressType];
    if (!basePath) {
      throw new Error(`Unsupported address type: ${addressType}`);
    }
    
    // Build full derivation path
    const fullPath = `${basePath}/${addressIndex}`;
    const child = root.derivePath(fullPath);
    
    // Generate address based on type
    let address;
    const keyPair = ECPair.fromPrivateKey(child.privateKey, { network: this.network });
    
    switch (addressType) {
      case 'legacy':
        address = bitcoin.payments.p2pkh({ 
          pubkey: keyPair.publicKey, 
          network: this.network 
        }).address;
        break;
        
      case 'segwit':
        address = bitcoin.payments.p2wpkh({ 
          pubkey: keyPair.publicKey, 
          network: this.network 
        }).address;
        break;
        
      case 'nested':
        const p2wpkh = bitcoin.payments.p2wpkh({ 
          pubkey: keyPair.publicKey, 
          network: this.network 
        });
        address = bitcoin.payments.p2sh({ 
          redeem: p2wpkh, 
          network: this.network 
        }).address;
        break;
        
      default:
        throw new Error(`Unsupported address type: ${addressType}`);
    }
    
    return {
      mnemonic,
      passphrase,
      derivationPath: fullPath,
      addressType,
      accountIndex,
      addressIndex,
      privateKey: child.privateKey.toString('hex'),
      privateKeyWIF: keyPair.toWIF(),
      publicKey: keyPair.publicKey.toString('hex'),
      address,
      xprv: child.toBase58(),
      xpub: child.neutered().toBase58()
    };
  }
  
  /**
   * Derive multiple addresses from a single mnemonic
   * @param {string} mnemonic - Mnemonic phrase
   * @param {Object} options - Derivation options
   * @returns {Object} Multiple wallet addresses
   */
  deriveMultipleAddresses(mnemonic, options = {}) {
    const {
      addressTypes = ['legacy', 'segwit', 'nested'],
      addressCount = 1,
      accountIndex = 0,
      passphrase = ''
    } = options;
    
    const wallets = {};
    
    for (const addressType of addressTypes) {
      wallets[addressType] = [];
      
      for (let i = 0; i < addressCount; i++) {
        const wallet = this.deriveWallet(mnemonic, addressType, accountIndex, i, passphrase);
        wallets[addressType].push(wallet);
      }
    }
    
    return wallets;
  }
  
  /**
   * Get all addresses from derived wallets
   * @param {Object} wallets - Wallets object from deriveMultipleAddresses
   * @returns {string[]} Array of all addresses
   */
  getAllAddresses(wallets) {
    const addresses = [];
    
    for (const addressType in wallets) {
      for (const wallet of wallets[addressType]) {
        addresses.push(wallet.address);
      }
    }
    
    return addresses;
  }
  
  /**
   * Generate random mnemonic and derive wallets
   * @param {Object} options - Generation options
   * @returns {Object} Complete wallet set
   */
  generateRandomWalletSet(options = {}) {
    const {
      strength = 128,
      addressTypes = ['legacy', 'segwit', 'nested'],
      addressCount = 1,
      accountIndex = 0,
      passphrase = ''
    } = options;
    
    const mnemonic = this.generateMnemonic(strength);
    const wallets = this.deriveMultipleAddresses(mnemonic, {
      addressTypes,
      addressCount,
      accountIndex,
      passphrase
    });
    
    return {
      mnemonic,
      passphrase,
      wallets,
      allAddresses: this.getAllAddresses(wallets)
    };
  }
  
  /**
   * Generate multiple random wallet sets
   * @param {number} count - Number of wallet sets to generate
   * @param {Object} options - Generation options
   * @returns {Object[]} Array of wallet sets
   */
  generateMultipleWalletSets(count, options = {}) {
    const walletSets = [];
    
    for (let i = 0; i < count; i++) {
      walletSets.push(this.generateRandomWalletSet(options));
    }
    
    return walletSets;
  }
  
  /**
   * Convert mnemonic to different word counts
   * @param {string} mnemonic - Source mnemonic
   * @param {number} targetStrength - Target entropy strength
   * @returns {string} New mnemonic with different word count
   */
  convertMnemonicStrength(mnemonic, targetStrength = 256) {
    if (!this.validateMnemonic(mnemonic)) {
      throw new Error('Invalid source mnemonic');
    }
    
    // Get entropy from source mnemonic
    const entropy = bip39.mnemonicToEntropy(mnemonic);
    
    // Generate new entropy with target strength
    const newEntropy = this.useSecureRandom 
      ? SecureRandom.generateHex(targetStrength / 4)
      : FastRandom.generateHex(targetStrength / 4);
    
    return bip39.entropyToMnemonic(newEntropy);
  }
  
  /**
   * Get mnemonic statistics
   * @param {string} mnemonic - Mnemonic phrase
   * @returns {Object} Mnemonic statistics
   */
  getMnemonicStats(mnemonic) {
    if (!this.validateMnemonic(mnemonic)) {
      return { valid: false };
    }
    
    const words = mnemonic.split(' ');
    const entropy = bip39.mnemonicToEntropy(mnemonic);
    const strength = entropy.length * 4; // bits
    
    return {
      valid: true,
      wordCount: words.length,
      entropy: entropy,
      strength: strength,
      strengthDescription: this.getStrengthDescription(strength),
      language: 'english' // bip39 default
    };
  }
  
  /**
   * Get strength description
   * @param {number} strength - Entropy strength in bits
   * @returns {string} Human readable description
   */
  getStrengthDescription(strength) {
    switch (strength) {
      case 128: return 'Standard (12 words)';
      case 160: return 'Enhanced (15 words)';
      case 192: return 'Strong (18 words)';
      case 224: return 'Very Strong (21 words)';
      case 256: return 'Maximum (24 words)';
      default: return `Custom (${strength} bits)`;
    }
  }
}

export default MnemonicGenerator;