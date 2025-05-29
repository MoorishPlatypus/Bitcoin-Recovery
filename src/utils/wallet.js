/**
 * Bitcoin wallet generation utilities using bitcoinjs-lib
 */

import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';

// Initialize ECPair with secp256k1
const ECPair = ECPairFactory(ecc);

export class WalletGenerator {
  constructor(network = 'mainnet') {
    this.network = network === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
  }
  
  /**
   * Generate wallet from private key buffer
   * @param {Buffer} privateKeyBuffer - 32-byte private key
   * @returns {Object} Wallet object with addresses and keys
   */
  generateWallet(privateKeyBuffer) {
    try {
      const keyPair = ECPair.fromPrivateKey(privateKeyBuffer, { network: this.network });
      
      // Generate different address types
      const addresses = {};
      
      // Legacy address (P2PKH) - starts with 1
      addresses.legacy = bitcoin.payments.p2pkh({ 
        pubkey: keyPair.publicKey, 
        network: this.network 
      }).address;
      
      // Native SegWit address (P2WPKH) - starts with bc1
      addresses.segwit = bitcoin.payments.p2wpkh({ 
        pubkey: keyPair.publicKey, 
        network: this.network 
      }).address;
      
      // Nested SegWit address (P2SH-P2WPKH) - starts with 3
      const p2wpkh = bitcoin.payments.p2wpkh({ 
        pubkey: keyPair.publicKey, 
        network: this.network 
      });
      addresses.nested = bitcoin.payments.p2sh({ 
        redeem: p2wpkh, 
        network: this.network 
      }).address;
      
      return {
        privateKey: privateKeyBuffer.toString('hex'),
        privateKeyWIF: keyPair.toWIF(),
        publicKey: keyPair.publicKey.toString('hex'),
        addresses,
        compressed: keyPair.compressed
      };
    } catch (error) {
      throw new Error(`Failed to generate wallet: ${error.message}`);
    }
  }
  
  /**
   * Generate multiple wallets from an array of private keys
   * @param {Buffer[]} privateKeys - Array of private key buffers
   * @returns {Object[]} Array of wallet objects
   */
  generateWallets(privateKeys) {
    return privateKeys.map(pk => this.generateWallet(pk));
  }
  
  /**
   * Get all addresses from a wallet
   * @param {Object} wallet - Wallet object
   * @returns {string[]} Array of all addresses
   */
  getAllAddresses(wallet) {
    return Object.values(wallet.addresses);
  }
}

export default WalletGenerator;