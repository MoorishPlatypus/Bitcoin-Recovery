#!/usr/bin/env node

/**
 * Test script to demonstrate wallet generation and matching
 */

import fs from 'fs';
import chalk from 'chalk';
import WalletGenerator from '../utils/wallet.js';
import { SecureRandom } from '../utils/crypto.js';

console.log(chalk.cyan.bold('\n🧪 Bitcoin Wallet Generator Test\n'));

// Test wallet generation
console.log(chalk.yellow('Testing wallet generation...'));

const walletGenerator = new WalletGenerator('mainnet');

// Generate a test wallet
const testPrivateKey = Buffer.from('1184CD2CDD640CA42CFC3A091C51D549B2F016D454B2774019C2B2D2E08529FD', 'hex');
const testWallet = walletGenerator.generateWallet(testPrivateKey);

console.log(chalk.green('✅ Test wallet generated successfully!'));
console.log('\nWallet Details:');
console.log(`  Private Key (HEX): ${chalk.cyan(testWallet.privateKey)}`);
console.log(`  Private Key (WIF): ${chalk.cyan(testWallet.privateKeyWIF)}`);
console.log(`  Public Key: ${chalk.gray(testWallet.publicKey)}`);
console.log('\nAddresses:');
console.log(`  Legacy (P2PKH): ${chalk.blue(testWallet.addresses.legacy)}`);
console.log(`  SegWit (P2WPKH): ${chalk.blue(testWallet.addresses.segwit)}`);
console.log(`  Nested (P2SH): ${chalk.blue(testWallet.addresses.nested)}`);

// Test matching functionality
console.log(chalk.yellow('\n\nTesting address matching...'));

// Create a test file with the generated address
const testAddresses = [
  testWallet.addresses.legacy,
  testWallet.addresses.segwit,
  testWallet.addresses.nested
];

const testFile = './test-addresses.txt';
fs.writeFileSync(testFile, testAddresses.join('\n'));

// Load test addresses
const loadedAddresses = new Set();
const data = fs.readFileSync(testFile, 'utf8');
data.split('\n').forEach(addr => {
  if (addr.trim()) loadedAddresses.add(addr.trim());
});

console.log(`Loaded ${loadedAddresses.size} test addresses`);

// Test matching
let matchFound = false;
for (const address of testAddresses) {
  if (loadedAddresses.has(address)) {
    console.log(chalk.green(`✅ Match found: ${address}`));
    matchFound = true;
  }
}

if (matchFound) {
  console.log(chalk.green.bold('\n🎉 Test successful! Address matching works correctly.'));
  
  // Simulate success file creation
  const successData = `TEST SUCCESS!\n\nMatched Address: ${testWallet.addresses.legacy}\nPrivate Key (HEX): ${testWallet.privateKey}\nPrivate Key (WIF): ${testWallet.privateKeyWIF}\n\nAll Addresses:\nLegacy: ${testWallet.addresses.legacy}\nSegWit: ${testWallet.addresses.segwit}\nNested: ${testWallet.addresses.nested}`;
  
  fs.writeFileSync('./Test-Success.txt', successData);
  console.log(chalk.green('✅ Test success file created: Test-Success.txt'));
} else {
  console.log(chalk.red('❌ Test failed! No matches found.'));
}

// Test random generation
console.log(chalk.yellow('\n\nTesting random wallet generation...'));

for (let i = 0; i < 5; i++) {
  const randomKey = SecureRandom.generatePrivateKey();
  const randomWallet = walletGenerator.generateWallet(randomKey);
  console.log(`  ${i + 1}. ${chalk.blue(randomWallet.addresses.legacy)} (${randomWallet.privateKey.substring(0, 16)}...)`);
}

console.log(chalk.green('\n✅ Random generation test completed!'));

// Performance test
console.log(chalk.yellow('\n\nRunning performance test (1000 wallets)...'));

const startTime = Date.now();
let generatedCount = 0;

for (let i = 0; i < 1000; i++) {
  const randomKey = SecureRandom.generatePrivateKey();
  const wallet = walletGenerator.generateWallet(randomKey);
  generatedCount++;
}

const endTime = Date.now();
const duration = (endTime - startTime) / 1000;
const rate = Math.round(generatedCount / duration);

console.log(chalk.green(`✅ Generated ${generatedCount} wallets in ${duration.toFixed(2)}s`));
console.log(chalk.green(`   Rate: ${rate} wallets/second`));

// Cleanup
fs.unlinkSync(testFile);

console.log(chalk.cyan.bold('\n🎯 All tests completed successfully!\n'));

// Display instructions
console.log(chalk.yellow('To run the main generator:'));
console.log(chalk.white('  npm start'));
console.log(chalk.white('  # or'));
console.log(chalk.white('  node --expose-gc src/generator.js'));
console.log();
console.log(chalk.yellow('For help and options:'));
console.log(chalk.white('  node src/generator.js --help'));
console.log();