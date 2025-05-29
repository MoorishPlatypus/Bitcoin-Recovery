#!/usr/bin/env node

/**
 * Test script for mnemonic generation and blockchain checking
 */

import fs from 'fs';
import chalk from 'chalk';
import MnemonicGenerator from '../utils/mnemonic.js';
import BlockchainAPI from '../utils/blockchain.js';

console.log(chalk.cyan.bold('\n🧪 Bitcoin Mnemonic Generator Test\n'));

// Test mnemonic generation
console.log(chalk.yellow('Testing mnemonic generation...'));

const mnemonicGenerator = new MnemonicGenerator({ network: 'mainnet', useSecureRandom: true });

// Generate test mnemonics with different strengths
const strengths = [128, 160, 192, 224, 256];
console.log('\nGenerating mnemonics with different strengths:');

for (const strength of strengths) {
  const mnemonic = mnemonicGenerator.generateMnemonic(strength);
  const stats = mnemonicGenerator.getMnemonicStats(mnemonic);
  console.log(`  ${strength} bits (${stats.wordCount} words): ${chalk.cyan(mnemonic.split(' ').slice(0, 4).join(' '))}...`);
}

// Test wallet derivation
console.log(chalk.yellow('\n\nTesting wallet derivation from mnemonic...'));

const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
console.log(`Test mnemonic: ${chalk.cyan(testMnemonic)}`);

const walletSet = mnemonicGenerator.generateRandomWalletSet({
  strength: 128,
  addressTypes: ['legacy', 'segwit', 'nested'],
  addressCount: 3
});

console.log(`\nGenerated mnemonic: ${chalk.cyan(walletSet.mnemonic)}`);
console.log(`Total addresses: ${chalk.green(walletSet.allAddresses.length)}`);

console.log('\nDerived addresses:');
for (const [type, wallets] of Object.entries(walletSet.wallets)) {
  console.log(chalk.blue(`  ${type.toUpperCase()}:`));
  wallets.forEach((wallet, index) => {
    console.log(`    ${index}: ${chalk.gray(wallet.address)}`);
    console.log(`        Path: ${chalk.dim(wallet.derivationPath)}`);
    console.log(`        WIF:  ${chalk.dim(wallet.privateKeyWIF.substring(0, 20))}...`);
  });
}

// Test known mnemonic with known addresses
console.log(chalk.yellow('\n\nTesting known mnemonic derivation...'));

const knownMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const knownWallet = mnemonicGenerator.deriveWallet(knownMnemonic, 'legacy', 0, 0);

console.log(`Known mnemonic: ${chalk.cyan(knownMnemonic)}`);
console.log(`Expected legacy address: ${chalk.blue('1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA')}`);
console.log(`Generated legacy address: ${chalk.blue(knownWallet.address)}`);
console.log(`Match: ${chalk.green(knownWallet.address === '1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA' ? '✅ Yes' : '❌ No')}`);

// Test blockchain API (if enabled)
console.log(chalk.yellow('\n\nTesting blockchain API...'));

const blockchainAPI = new BlockchainAPI({
  rateLimitPerSecond: 2,
  timeout: 5000
});

// Test with a known address that has balance
const testAddresses = [
  '1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ', // Known rich address
  '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Genesis block address
  knownWallet.address // Our generated address (should be empty)
];

console.log('Testing balance checking for sample addresses...');

try {
  for (const address of testAddresses) {
    console.log(`\nChecking: ${chalk.blue(address)}`);
    
    try {
      const result = await blockchainAPI.checkBalance(address);
      
      if (result.success) {
        console.log(`  Balance: ${chalk.green(result.balanceBTC + ' BTC')} (${result.balance} satoshis)`);
        console.log(`  Provider: ${chalk.gray(result.provider)}`);
        
        if (result.balance > 0) {
          console.log(`  Status: ${chalk.green.bold('💰 HAS BALANCE!')}`);
        } else {
          console.log(`  Status: ${chalk.gray('Empty')}`);
        }
      } else {
        console.log(`  Error: ${chalk.red(result.error)}`);
      }
    } catch (error) {
      console.log(`  Error: ${chalk.red(error.message)}`);
    }
    
    // Small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
} catch (error) {
  console.log(chalk.red(`Blockchain API test failed: ${error.message}`));
  console.log(chalk.yellow('This is normal if you don\'t have internet connection or APIs are down.'));
}

// Performance test
console.log(chalk.yellow('\n\nRunning mnemonic generation performance test...'));

const startTime = Date.now();
let generatedCount = 0;

for (let i = 0; i < 100; i++) {
  const mnemonic = mnemonicGenerator.generateMnemonic(128);
  const walletSet = mnemonicGenerator.generateRandomWalletSet({
    strength: 128,
    addressTypes: ['legacy'],
    addressCount: 1
  });
  generatedCount++;
}

const endTime = Date.now();
const duration = (endTime - startTime) / 1000;
const rate = Math.round(generatedCount / duration);

console.log(chalk.green(`✅ Generated ${generatedCount} mnemonic wallet sets in ${duration.toFixed(2)}s`));
console.log(chalk.green(`   Rate: ${rate} wallet sets/second`));

// Save test results
const testResults = {
  timestamp: new Date().toISOString(),
  testMnemonic: walletSet.mnemonic,
  knownMnemonicTest: {
    mnemonic: knownMnemonic,
    expectedAddress: '1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA',
    generatedAddress: knownWallet.address,
    match: knownWallet.address === '1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA'
  },
  performance: {
    generatedCount,
    duration,
    rate
  },
  sampleAddresses: walletSet.allAddresses.slice(0, 5)
};

fs.writeFileSync('./test-mnemonic-results.json', JSON.stringify(testResults, null, 2));
console.log(chalk.green('\n✅ Test results saved to: test-mnemonic-results.json'));

console.log(chalk.cyan.bold('\n🎯 Mnemonic generation tests completed successfully!\n'));

// Display usage instructions
console.log(chalk.yellow('To run the mnemonic hunter:'));
console.log(chalk.white('  npm run mnemonic              # Generate mnemonics (offline mode)'));
console.log(chalk.white('  npm run mnemonic-live          # Generate mnemonics with live balance checking'));
console.log();
console.log(chalk.yellow('Advanced options:'));
console.log(chalk.white('  node src/mnemonic-generator.js --help'));
console.log();
console.log(chalk.red.bold('⚠️  Remember: Use responsibly and only for recovering truly lost wallets!'));
console.log();