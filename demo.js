#!/usr/bin/env node

/**
 * Demo script showing the Bitcoin Mnemonic Hunter capabilities
 */

import chalk from 'chalk';
import MnemonicGenerator from './src/utils/mnemonic.js';
import BlockchainAPI from './src/utils/blockchain.js';

console.log(chalk.cyan.bold('\n🚀 Bitcoin Mnemonic Hunter - Demo\n'));

async function runDemo() {
  // Initialize components
  const mnemonicGenerator = new MnemonicGenerator({ 
    network: 'mainnet', 
    useSecureRandom: true 
  });
  
  const blockchainAPI = new BlockchainAPI({
    rateLimitPerSecond: 3,
    timeout: 5000
  });

  console.log(chalk.yellow('🔧 Initializing Bitcoin Mnemonic Hunter...'));
  console.log(chalk.green('✅ Components loaded successfully!\n'));

  // Demo 1: Generate various mnemonic strengths
  console.log(chalk.blue.bold('📝 Demo 1: Mnemonic Generation'));
  console.log(chalk.gray('Generating mnemonics with different word counts...\n'));

  const strengths = [
    { bits: 128, words: 12, description: 'Standard' },
    { bits: 160, words: 15, description: 'Enhanced' },
    { bits: 192, words: 18, description: 'Strong' },
    { bits: 224, words: 21, description: 'Very Strong' },
    { bits: 256, words: 24, description: 'Maximum' }
  ];

  for (const { bits, words, description } of strengths) {
    const mnemonic = mnemonicGenerator.generateMnemonic(bits);
    const preview = mnemonic.split(' ').slice(0, 4).join(' ') + '...';
    console.log(`  ${chalk.cyan(words + ' words')} (${bits} bits) - ${description}: ${chalk.gray(preview)}`);
  }

  // Demo 2: Wallet derivation from mnemonic
  console.log(chalk.blue.bold('\n📋 Demo 2: Wallet Derivation'));
  console.log(chalk.gray('Deriving multiple addresses from a single mnemonic...\n'));

  const demoMnemonic = mnemonicGenerator.generateMnemonic(128);
  console.log(`Demo mnemonic: ${chalk.cyan(demoMnemonic)}\n`);

  const walletSet = mnemonicGenerator.deriveMultipleAddresses(demoMnemonic, {
    addressTypes: ['legacy', 'segwit', 'nested'],
    addressCount: 3
  });

  for (const [type, wallets] of Object.entries(walletSet)) {
    console.log(chalk.yellow(`${type.toUpperCase()} addresses:`));
    wallets.forEach((wallet, index) => {
      console.log(`  ${index}: ${chalk.blue(wallet.address)}`);
      console.log(`      Path: ${chalk.dim(wallet.derivationPath)}`);
    });
    console.log();
  }

  // Demo 3: Blockchain balance checking
  console.log(chalk.blue.bold('🌐 Demo 3: Blockchain Balance Checking'));
  console.log(chalk.gray('Checking real Bitcoin addresses for balances...\n'));

  const testAddresses = [
    { address: '1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ', description: 'Known rich address' },
    { address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', description: 'Genesis block (Satoshi)' },
    { address: walletSet.legacy[0].address, description: 'Our generated address' }
  ];

  for (const { address, description } of testAddresses) {
    console.log(`Checking: ${chalk.blue(address)}`);
    console.log(`Type: ${chalk.gray(description)}`);
    
    try {
      const result = await blockchainAPI.checkBalance(address);
      
      if (result.success) {
        if (result.balance > 0) {
          console.log(`Balance: ${chalk.green.bold(result.balanceBTC + ' BTC')} (${result.balance} satoshis)`);
          console.log(`Status: ${chalk.green.bold('💰 HAS BALANCE!')}`);
        } else {
          console.log(`Balance: ${chalk.gray('0 BTC')}`);
          console.log(`Status: ${chalk.gray('Empty')}`);
        }
        console.log(`Provider: ${chalk.blue(result.provider)}`);
      } else {
        console.log(`Error: ${chalk.red(result.error)}`);
      }
    } catch (error) {
      console.log(`Error: ${chalk.red(error.message)}`);
    }
    
    console.log();
    
    // Small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Demo 4: Performance test
  console.log(chalk.blue.bold('⚡ Demo 4: Performance Test'));
  console.log(chalk.gray('Testing mnemonic generation speed...\n'));

  const testCount = 50;
  const startTime = Date.now();

  for (let i = 0; i < testCount; i++) {
    const mnemonic = mnemonicGenerator.generateMnemonic(128);
    const walletSet = mnemonicGenerator.deriveMultipleAddresses(mnemonic, {
      addressTypes: ['legacy'],
      addressCount: 1
    });
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  const rate = Math.round(testCount / duration);

  console.log(`Generated ${chalk.green(testCount)} mnemonic wallet sets in ${chalk.yellow(duration.toFixed(2) + 's')}`);
  console.log(`Performance: ${chalk.green.bold(rate + ' wallet sets/second')}`);

  // Demo 5: API provider switching
  console.log(chalk.blue.bold('\n🔄 Demo 5: API Provider Management'));
  console.log(chalk.gray('Demonstrating automatic provider switching...\n'));

  console.log(`Current provider: ${chalk.blue(blockchainAPI.getCurrentProvider().name)}`);
  
  blockchainAPI.switchProvider();
  console.log(`Switched to: ${chalk.blue(blockchainAPI.getCurrentProvider().name)}`);
  
  blockchainAPI.switchProvider();
  console.log(`Switched to: ${chalk.blue(blockchainAPI.getCurrentProvider().name)}`);

  const apiStats = blockchainAPI.getUsageStats();
  console.log('\nAPI Usage Statistics:');
  for (const [provider, stats] of Object.entries(apiStats)) {
    console.log(`  ${provider}: ${chalk.yellow(stats.requests)}/${chalk.green(stats.limit)} requests`);
  }

  // Summary
  console.log(chalk.cyan.bold('\n🎯 Demo Complete!'));
  console.log(chalk.yellow('\nTo start hunting for lost Bitcoin wallets:'));
  console.log(chalk.white('  npm run mnemonic              # Offline mode (testing)'));
  console.log(chalk.white('  npm run mnemonic-live          # Live mode (real hunting)'));
  console.log();
  console.log(chalk.yellow('For advanced options:'));
  console.log(chalk.white('  node src/mnemonic-generator.js --help'));
  console.log();
  console.log(chalk.cyan('Proxy support:'));
  console.log(chalk.white('  node src/mnemonic-generator.js --live-check --proxy-file ./data/proxies.txt'));
  console.log(chalk.white('  node src/mnemonic-generator.js --live-check --test-proxies'));
  console.log();
  console.log(chalk.red.bold('⚠️  Remember: Use responsibly for recovering truly lost wallets only!'));
  console.log(chalk.green('🍀 Good luck hunting for lost Bitcoin! 🚀\n'));
}

// Run the demo
runDemo().catch(error => {
  console.error(chalk.red('Demo failed:'), error.message);
  process.exit(1);
});