#!/usr/bin/env node

/**
 * Advanced Bitcoin Mnemonic Phrase Generator with Live Balance Checking
 * Focuses on finding forgotten/lost Bitcoin wallets with positive balances
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

import { config } from './config/config.js';
import Logger from './utils/logger.js';
import MnemonicGenerator from './utils/mnemonic.js';
import BlockchainAPI from './utils/blockchain.js';
import Statistics from './utils/statistics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BitcoinMnemonicHunter {
  constructor(options = {}) {
    this.config = { ...config, ...options };
    this.logger = new Logger(this.config);
    this.mnemonicGenerator = new MnemonicGenerator({
      network: this.config.network,
      useSecureRandom: this.config.useSecureRandom
    });
    this.blockchainAPI = new BlockchainAPI({
      rateLimitPerSecond: this.config.blockchain.rateLimitPerSecond,
      timeout: this.config.blockchain.timeout,
      retryAttempts: this.config.blockchain.retryAttempts,
      retryDelay: this.config.blockchain.retryDelay
    });
    this.statistics = new Statistics();
    this.isRunning = false;
    this.spinner = null;
    this.foundWallets = [];
    
    // Set process title
    process.title = "Bitcoin Mnemonic Hunter - Lost Wallet Recovery";
    
    // Setup graceful shutdown
    this.setupGracefulShutdown();
  }
  
  /**
   * Initialize the hunter
   */
  async initialize() {
    this.logger.info('Initializing Bitcoin Mnemonic Hunter...');
    
    // Create necessary directories
    this.createDirectories();
    
    // Display startup information
    this.displayStartupInfo();
    
    this.logger.success('Initialization complete! Starting hunt for lost Bitcoin wallets...');
  }
  
  /**
   * Create necessary directories
   */
  createDirectories() {
    const dirs = ['./data', './logs', './found-wallets'];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.logger.debug(`Created directory: ${dir}`);
      }
    });
  }
  
  /**
   * Display startup information
   */
  displayStartupInfo() {
    console.log(chalk.cyan.bold('\n🔍 Bitcoin Mnemonic Hunter v2.0 - Lost Wallet Recovery\n'));
    console.log(chalk.yellow('🎯 Mission: Find forgotten Bitcoin wallets with positive balances'));
    console.log(chalk.yellow('💡 Focus: Mnemonic phrases for maximum wallet coverage\n'));
    
    console.log(chalk.blue('Configuration:'));
    console.log(`  Network: ${chalk.green(this.config.network)}`);
    console.log(`  Mode: ${chalk.green('Mnemonic Phrase Generation')}`);
    console.log(`  Mnemonic Strength: ${chalk.green(this.config.mnemonic.strength + ' bits')}`);
    console.log(`  Addresses per Type: ${chalk.green(this.config.mnemonic.addressCount)}`);
    console.log(`  Live Balance Check: ${chalk.green(this.config.blockchain.enabled ? 'Yes' : 'No')}`);
    console.log(`  Secure Random: ${chalk.green(this.config.useSecureRandom ? 'Yes' : 'No')}`);
    console.log(`  Address Types: ${chalk.green(Object.entries(this.config.addressTypes).filter(([,v]) => v).map(([k]) => k).join(', '))}`);
    
    if (this.config.blockchain.enabled) {
      console.log(`  API Rate Limit: ${chalk.green(this.config.blockchain.rateLimitPerSecond + '/sec')}`);
      console.log(`  Min Balance: ${chalk.green(this.config.blockchain.minBalance + ' satoshis')}`);
    }
    
    console.log();
    console.log(chalk.red.bold('⚠️  IMPORTANT: This tool is for recovering truly lost/forgotten wallets only!'));
    console.log(chalk.red('   Do not attempt to access wallets that belong to others.'));
    console.log();
  }
  
  /**
   * Generate mnemonic and check for balances
   */
  async generateAndCheck() {
    try {
      // Generate random mnemonic phrase
      const walletSet = this.mnemonicGenerator.generateRandomWalletSet({
        strength: this.config.mnemonic.strength,
        addressTypes: Object.keys(this.config.addressTypes).filter(type => this.config.addressTypes[type]),
        addressCount: this.config.mnemonic.addressCount,
        accountIndex: this.config.mnemonic.accountIndex,
        passphrase: this.config.mnemonic.passphrase
      });
      
      // Check balances if enabled
      if (this.config.blockchain.enabled) {
        const balanceResult = await this.blockchainAPI.hasPositiveBalance(walletSet.allAddresses);
        
        if (balanceResult && balanceResult.balance > this.config.blockchain.minBalance) {
          await this.handleSuccess(walletSet, balanceResult);
          return true;
        }
      } else {
        // Static mode - just log the generation for testing
        this.logger.debug(`Generated mnemonic: ${walletSet.mnemonic.split(' ').slice(0, 3).join(' ')}...`);
      }
      
      return false;
    } catch (error) {
      this.logger.error('Error generating/checking wallet:', error.message);
      return false;
    }
  }
  
  /**
   * Handle successful wallet discovery
   */
  async handleSuccess(walletSet, balanceResult) {
    this.isRunning = false;
    
    if (this.spinner) {
      this.spinner.stop();
    }
    
    // Sound alert
    process.stdout.write('\x07');
    
    console.log('\n' + chalk.green.bold('🎉 JACKPOT! BITCOIN WALLET WITH BALANCE FOUND! 🎉\n'));
    console.log(chalk.yellow('💰 Balance Found:'), chalk.green.bold(`${balanceResult.balanceBTC} BTC (${balanceResult.balance} satoshis)`));
    console.log(chalk.yellow('📍 Address:'), chalk.cyan.bold(balanceResult.address));
    console.log(chalk.yellow('🔑 Mnemonic Phrase:'), chalk.red.bold(walletSet.mnemonic));
    
    if (walletSet.passphrase) {
      console.log(chalk.yellow('🔐 Passphrase:'), chalk.red.bold(walletSet.passphrase));
    }
    
    console.log(chalk.yellow('🌐 Provider:'), chalk.blue(balanceResult.provider));
    
    // Display all derived addresses
    console.log(chalk.yellow('\n📋 All Derived Addresses:'));
    for (const [addressType, wallets] of Object.entries(walletSet.wallets)) {
      console.log(chalk.blue(`  ${addressType.toUpperCase()}:`));
      wallets.forEach((wallet, index) => {
        const isMatched = wallet.address === balanceResult.address;
        const marker = isMatched ? chalk.green.bold(' ← MATCH!') : '';
        console.log(`    ${index}: ${chalk.gray(wallet.address)}${marker}`);
      });
    }
    
    // Save detailed information
    await this.saveWalletDetails(walletSet, balanceResult);
    
    // Add to found wallets list
    this.foundWallets.push({
      timestamp: new Date().toISOString(),
      mnemonic: walletSet.mnemonic,
      passphrase: walletSet.passphrase,
      balanceResult,
      walletSet,
      statistics: this.statistics.getFormattedStats()
    });
    
    this.logger.success('Bitcoin wallet with balance found!', { 
      address: balanceResult.address, 
      balance: balanceResult.balanceBTC + ' BTC',
      mnemonic: walletSet.mnemonic
    });
    
    // Ask user if they want to continue or exit
    console.log(chalk.yellow('\n🤔 Continue searching for more wallets? (Ctrl+C to stop)'));
    
    // Continue running instead of exiting
    this.isRunning = true;
    setTimeout(() => {
      if (this.spinner) {
        this.spinner.start();
      }
    }, 5000);
  }
  
  /**
   * Save wallet details to file
   */
  async saveWalletDetails(walletSet, balanceResult) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `found-wallets/BITCOIN-WALLET-${timestamp}.txt`;
    
    const details = `🎉 BITCOIN WALLET WITH BALANCE FOUND! 🎉

Discovery Details:
==================
Timestamp: ${new Date().toISOString()}
Balance: ${balanceResult.balanceBTC} BTC (${balanceResult.balance} satoshis)
Matched Address: ${balanceResult.address}
Provider: ${balanceResult.provider}

🔑 RECOVERY INFORMATION:
========================
Mnemonic Phrase: ${walletSet.mnemonic}
${walletSet.passphrase ? `Passphrase: ${walletSet.passphrase}` : 'Passphrase: (none)'}
Mnemonic Strength: ${this.config.mnemonic.strength} bits
Word Count: ${walletSet.mnemonic.split(' ').length}

📋 ALL DERIVED ADDRESSES:
=========================
${Object.entries(walletSet.wallets).map(([type, wallets]) => 
  `${type.toUpperCase()}:\n${wallets.map((w, i) => 
    `  ${i}: ${w.address}${w.address === balanceResult.address ? ' ← MATCH!' : ''}\n      Private Key: ${w.privateKeyWIF}\n      Derivation: ${w.derivationPath}`
  ).join('\n')}`
).join('\n\n')}

🔐 TECHNICAL DETAILS:
====================
Network: ${this.config.network}
Generation Mode: Mnemonic Phrase
Address Types: ${Object.keys(this.config.addressTypes).filter(t => this.config.addressTypes[t]).join(', ')}

📊 STATISTICS:
==============
${JSON.stringify(this.statistics.getFormattedStats(), null, 2)}

⚠️  IMPORTANT SECURITY NOTES:
=============================
1. This wallet contains real Bitcoin! Handle with extreme care.
2. Import the mnemonic phrase into a secure wallet immediately.
3. Transfer funds to a new, secure wallet as soon as possible.
4. Never share this information with anyone.
5. Delete this file after securing the funds.
6. This appears to be a lost/forgotten wallet - use responsibly.

🛡️  RECOMMENDED NEXT STEPS:
===========================
1. Import mnemonic into a reputable wallet (Electrum, Bitcoin Core, etc.)
2. Verify the balance and transaction history
3. Create a new secure wallet with a fresh mnemonic
4. Transfer all funds to the new secure wallet
5. Securely delete all traces of this discovery

Generated by Bitcoin Mnemonic Hunter v2.0
https://github.com/Michal2SAB/Bitcoin-Stealer
`;

    try {
      fs.writeFileSync(filename, details);
      console.log(chalk.green(`\n✅ Wallet details saved to: ${chalk.bold(filename)}`));
      
      // Also save to main success file for compatibility
      fs.writeFileSync(this.config.successFile, details);
      console.log(chalk.green(`✅ Also saved to: ${chalk.bold(this.config.successFile)}`));
      
    } catch (error) {
      this.logger.error('Failed to save wallet details:', error.message);
    }
  }
  
  /**
   * Start the hunting process
   */
  async start() {
    this.logger.info('Starting Bitcoin mnemonic hunting...');
    this.isRunning = true;
    
    // Start spinner
    this.spinner = ora({
      text: 'Hunting for lost Bitcoin wallets...',
      color: 'yellow'
    }).start();
    
    let iterationCount = 0;
    let lastStatsTime = Date.now();
    let lastApiStatsTime = Date.now();
    
    while (this.isRunning) {
      // Generate and check wallet
      const found = await this.generateAndCheck();
      
      iterationCount++;
      this.statistics.recordChecks(1);
      
      // Update spinner and stats periodically
      if (iterationCount % this.config.progressInterval === 0) {
        const stats = this.statistics.getFormattedStats();
        const foundCount = this.foundWallets.length;
        this.spinner.text = `🔍 Checked: ${stats.totalCheckedFormatted} | Rate: ${stats.currentRateFormatted} | Found: ${foundCount} | Uptime: ${stats.uptime}`;
      }
      
      // Display detailed stats periodically
      if (Date.now() - lastStatsTime >= this.config.statsInterval) {
        this.displayStats();
        lastStatsTime = Date.now();
      }
      
      // Display API stats if blockchain checking is enabled
      if (this.config.blockchain.enabled && Date.now() - lastApiStatsTime >= this.config.statsInterval * 2) {
        this.displayApiStats();
        lastApiStatsTime = Date.now();
      }
      
      // Memory management
      if (iterationCount % this.config.gcInterval === 0) {
        const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;
        if (memUsage > this.config.memoryThreshold) {
          if (global.gc) {
            global.gc();
            this.logger.debug(`Garbage collection triggered. Memory: ${memUsage.toFixed(2)} MB`);
          }
        }
      }
      
      // Small delay to prevent API overwhelming
      if (this.config.blockchain.enabled && iterationCount % this.config.blockchain.batchSize === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  
  /**
   * Display detailed statistics
   */
  displayStats() {
    const stats = this.statistics.getFormattedStats();
    
    console.log('\n' + chalk.blue.bold('📊 Hunting Statistics:'));
    console.log(`  Mnemonics Checked: ${chalk.green(stats.totalCheckedFormatted)}`);
    console.log(`  Current Rate: ${chalk.yellow(stats.currentRateFormatted)}`);
    console.log(`  Average Rate: ${chalk.yellow(stats.averageRateFormatted)}`);
    console.log(`  Wallets Found: ${chalk.green.bold(this.foundWallets.length)}`);
    console.log(`  Uptime: ${chalk.cyan(stats.uptime)}`);
    console.log(`  Estimated Daily: ${chalk.magenta(stats.estimatedDailyFormatted)}`);
    console.log(`  Memory Usage: ${chalk.gray((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' MB')}`);
    
    if (this.foundWallets.length > 0) {
      const totalBTC = this.foundWallets.reduce((sum, w) => sum + w.balanceResult.balanceBTC, 0);
      console.log(`  Total BTC Found: ${chalk.green.bold(totalBTC.toFixed(8) + ' BTC')}`);
    }
    
    console.log();
  }
  
  /**
   * Display API usage statistics
   */
  displayApiStats() {
    if (!this.config.blockchain.enabled) return;
    
    const apiStats = this.blockchainAPI.getUsageStats();
    
    console.log(chalk.blue.bold('🌐 API Usage Statistics:'));
    for (const [provider, stats] of Object.entries(apiStats)) {
      const percentage = stats.limit > 0 ? ((stats.requests / stats.limit) * 100).toFixed(1) : '0';
      console.log(`  ${provider}: ${chalk.yellow(stats.requests)}/${chalk.green(stats.limit)} (${percentage}%)`);
    }
    
    // Show proxy statistics if proxies are being used
    const proxySummary = this.blockchainAPI.getProxySummary();
    if (proxySummary.total > 0) {
      console.log(chalk.magenta.bold('🔄 Proxy Statistics:'));
      console.log(`  Total Proxies: ${chalk.green(proxySummary.total)}`);
      console.log(`  Active: ${chalk.green(proxySummary.active)} | Failed: ${chalk.red(proxySummary.failed)}`);
      console.log(`  Current: ${chalk.blue(proxySummary.currentProxy)}`);
      console.log(`  Requests via Proxies: ${chalk.yellow(proxySummary.requestCount)}`);
    }
    
    console.log();
  }
  
  /**
   * Stop the hunting process
   */
  stop() {
    this.logger.info('Stopping Bitcoin mnemonic hunting...');
    this.isRunning = false;
    
    if (this.spinner) {
      this.spinner.stop();
    }
    
    this.displayStats();
    
    if (this.foundWallets.length > 0) {
      console.log(chalk.green.bold(`\n🎉 Hunt Summary: Found ${this.foundWallets.length} wallet(s) with Bitcoin!`));
      this.foundWallets.forEach((wallet, index) => {
        console.log(`  ${index + 1}. ${chalk.cyan(wallet.balanceResult.address)} - ${chalk.green(wallet.balanceResult.balanceBTC + ' BTC')}`);
      });
    } else {
      console.log(chalk.yellow('\n🔍 No wallets with balances found in this session.'));
    }
    
    console.log(chalk.yellow('\n👋 Hunt stopped. Keep searching - lost Bitcoin is out there! 🚀\n'));
  }
  
  /**
   * Setup graceful shutdown handlers
   */
  setupGracefulShutdown() {
    const shutdown = (signal) => {
      console.log(chalk.yellow(`\n\n🛑 Received ${signal}. Shutting down gracefully...`));
      this.stop();
      process.exit(0);
    };
    
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGQUIT', () => shutdown('SIGQUIT'));
  }
}

// CLI Setup
const program = new Command();

program
  .name('bitcoin-mnemonic-hunter')
  .description('Advanced Bitcoin mnemonic hunter for lost wallet recovery')
  .version('2.0.0')
  .option('-n, --network <network>', 'Bitcoin network (mainnet|testnet)', 'mainnet')
  .option('-s, --secure', 'Use cryptographically secure random generation', true)
  .option('-f, --fast', 'Use fast pseudo-random generation (less secure)', false)
  .option('--strength <bits>', 'Mnemonic strength in bits (128,160,192,224,256)', '128')
  .option('--addresses <count>', 'Number of addresses to derive per type', '5')
  .option('--live-check', 'Enable live blockchain balance checking', false)
  .option('--rate-limit <rps>', 'API requests per second', '5')
  .option('--min-balance <satoshis>', 'Minimum balance to consider (satoshis)', '0')
  .option('-m, --memory <mb>', 'Memory threshold for garbage collection (MB)', '500')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .option('--legacy-only', 'Generate legacy addresses only', false)
  .option('--segwit-only', 'Generate SegWit addresses only', false)
  .option('--nested-only', 'Generate nested SegWit addresses only', false)
  .option('--proxy-file <path>', 'Path to proxy list file', './data/proxies.txt')
  .option('--test-proxies', 'Test all proxies before starting', false)
  .option('--proxy-rotation <count>', 'Requests per proxy before rotation', '5');

program.action(async (options) => {
  try {
    // Configure based on CLI options
    const hunterConfig = {
      network: options.network,
      useSecureRandom: options.secure && !options.fast,
      memoryThreshold: parseInt(options.memory),
      logLevel: options.verbose ? 'debug' : 'info',
      mode: 'mnemonic',
      mnemonic: {
        strength: parseInt(options.strength),
        addressCount: parseInt(options.addresses),
        accountIndex: 0,
        passphrase: ''
      },
      blockchain: {
        enabled: options.liveCheck,
        checkMode: 'api',
        rateLimitPerSecond: parseInt(options.rateLimit),
        timeout: 10000,
        retryAttempts: 3,
        retryDelay: 1000,
        minBalance: parseInt(options.minBalance),
        batchSize: 10,
        proxyFile: options.proxyFile,
        proxyRotationInterval: parseInt(options.proxyRotation)
      }
    };
    
    // Configure address types
    if (options.legacyOnly || options.segwitOnly || options.nestedOnly) {
      hunterConfig.addressTypes = {
        legacy: !!options.legacyOnly,
        segwit: !!options.segwitOnly,
        nested: !!options.nestedOnly
      };
    }
    
    // Validate mnemonic strength
    const validStrengths = [128, 160, 192, 224, 256];
    if (!validStrengths.includes(hunterConfig.mnemonic.strength)) {
      throw new Error(`Invalid mnemonic strength. Must be one of: ${validStrengths.join(', ')}`);
    }
    
    // Create and start hunter
    const hunter = new BitcoinMnemonicHunter(hunterConfig);
    await hunter.initialize();
    
    // Test proxies if requested
    if (options.testProxies && options.liveCheck) {
      console.log(chalk.blue('🔍 Testing proxies...'));
      const proxyResults = await hunter.blockchainAPI.testProxies();
      console.log(chalk.green(`✅ Proxy test completed: ${proxyResults.working}/${proxyResults.total} working`));
      
      if (proxyResults.working === 0 && proxyResults.total > 0) {
        console.log(chalk.yellow('⚠️  No working proxies found. Continuing without proxy support.'));
      }
    }
    
    await hunter.start();
    
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error.message);
    process.exit(1);
  }
});

// Parse CLI arguments
program.parse();