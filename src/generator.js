#!/usr/bin/env node

/**
 * Advanced Bitcoin Wallet Generator
 * Enhanced version with improved performance, security, and features
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

import { config } from './config/config.js';
import Logger from './utils/logger.js';
import { SecureRandom, FastRandom } from './utils/crypto.js';
import WalletGenerator from './utils/wallet.js';
import Statistics from './utils/statistics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BitcoinWalletGenerator {
  constructor(options = {}) {
    this.config = { ...config, ...options };
    this.logger = new Logger(this.config);
    this.walletGenerator = new WalletGenerator(this.config.network);
    this.statistics = new Statistics();
    this.richAddresses = new Set();
    this.isRunning = false;
    this.spinner = null;
    
    // Set process title
    process.title = "Advanced Bitcoin Wallet Generator";
    
    // Setup graceful shutdown
    this.setupGracefulShutdown();
  }
  
  /**
   * Initialize the generator
   */
  async initialize() {
    this.logger.info('Initializing Bitcoin Wallet Generator...');
    
    // Create necessary directories
    this.createDirectories();
    
    // Load rich addresses
    await this.loadRichAddresses();
    
    // Display startup information
    this.displayStartupInfo();
    
    this.logger.success('Initialization complete!');
  }
  
  /**
   * Create necessary directories
   */
  createDirectories() {
    const dirs = ['./data', './logs'];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.logger.debug(`Created directory: ${dir}`);
      }
    });
  }
  
  /**
   * Load rich addresses from file
   */
  async loadRichAddresses() {
    try {
      let richFile = this.config.richWalletsFile;
      
      // Check if file exists, if not try legacy locations
      if (!fs.existsSync(richFile)) {
        const legacyPaths = ['./Linux/riches.txt', './Windows/riches.txt', './riches.txt'];
        for (const legacyPath of legacyPaths) {
          if (fs.existsSync(legacyPath)) {
            richFile = legacyPath;
            break;
          }
        }
      }
      
      if (!fs.existsSync(richFile)) {
        this.logger.warn(`Rich addresses file not found: ${richFile}`);
        this.logger.info('Creating sample rich addresses file...');
        this.createSampleRichFile();
        richFile = this.config.richWalletsFile;
      }
      
      const data = fs.readFileSync(richFile, 'utf8');
      const addresses = data.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#') && !line.startsWith('^'));
      
      addresses.forEach(address => this.richAddresses.add(address));
      
      this.logger.info(`Loaded ${this.richAddresses.size} rich addresses from ${richFile}`);
    } catch (error) {
      this.logger.error('Failed to load rich addresses:', error.message);
      throw error;
    }
  }
  
  /**
   * Create a sample rich addresses file
   */
  createSampleRichFile() {
    const sampleContent = `# Bitcoin Rich Addresses Database
# Add Bitcoin addresses with positive balances here
# One address per line, comments start with #

# Example addresses (these are real addresses with balances)
1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ
1FeexV6bAHb8ybZjqQMjJrcCrHGW9sb6uF
bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh

# Add more addresses below:
`;
    
    fs.writeFileSync(this.config.richWalletsFile, sampleContent);
    this.logger.info(`Created sample rich addresses file: ${this.config.richWalletsFile}`);
  }
  
  /**
   * Display startup information
   */
  displayStartupInfo() {
    console.log(chalk.cyan.bold('\n🚀 Advanced Bitcoin Wallet Generator v2.0.0\n'));
    console.log(chalk.yellow('Configuration:'));
    console.log(`  Network: ${chalk.green(this.config.network)}`);
    console.log(`  Rich addresses loaded: ${chalk.green(this.richAddresses.size)}`);
    console.log(`  Secure random: ${chalk.green(this.config.useSecureRandom ? 'Yes' : 'No')}`);
    console.log(`  Memory threshold: ${chalk.green(this.config.memoryThreshold + ' MB')}`);
    console.log(`  Address types: ${chalk.green(Object.entries(this.config.addressTypes).filter(([,v]) => v).map(([k]) => k).join(', '))}`);
    console.log();
  }
  
  /**
   * Generate a single wallet and check for matches
   */
  generateAndCheck() {
    try {
      // Generate private key
      const privateKey = this.config.useSecureRandom 
        ? SecureRandom.generatePrivateKey()
        : FastRandom.generatePrivateKey();
      
      // Generate wallet
      const wallet = this.walletGenerator.generateWallet(privateKey);
      
      // Check all enabled address types
      const addressesToCheck = [];
      if (this.config.addressTypes.legacy) addressesToCheck.push(wallet.addresses.legacy);
      if (this.config.addressTypes.segwit) addressesToCheck.push(wallet.addresses.segwit);
      if (this.config.addressTypes.nested) addressesToCheck.push(wallet.addresses.nested);
      
      // Check for matches
      for (const address of addressesToCheck) {
        if (this.richAddresses.has(address)) {
          this.handleSuccess(wallet, address);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      this.logger.error('Error generating wallet:', error.message);
      return false;
    }
  }
  
  /**
   * Handle successful match
   */
  handleSuccess(wallet, matchedAddress) {
    this.isRunning = false;
    
    if (this.spinner) {
      this.spinner.stop();
    }
    
    // Sound alert
    process.stdout.write('\x07');
    
    console.log('\n' + chalk.green.bold('🎉 SUCCESS! WALLET FOUND! 🎉\n'));
    console.log(chalk.yellow('Matched Address:'), chalk.green.bold(matchedAddress));
    console.log(chalk.yellow('Private Key (HEX):'), chalk.cyan(wallet.privateKey));
    console.log(chalk.yellow('Private Key (WIF):'), chalk.cyan(wallet.privateKeyWIF));
    console.log(chalk.yellow('Public Key:'), chalk.gray(wallet.publicKey));
    
    console.log(chalk.yellow('\nAll Addresses:'));
    console.log(`  Legacy (P2PKH): ${chalk.blue(wallet.addresses.legacy)}`);
    console.log(`  SegWit (P2WPKH): ${chalk.blue(wallet.addresses.segwit)}`);
    console.log(`  Nested (P2SH): ${chalk.blue(wallet.addresses.nested)}`);
    
    // Save to file
    const successData = {
      timestamp: new Date().toISOString(),
      matchedAddress,
      wallet,
      statistics: this.statistics.getFormattedStats()
    };
    
    const successString = `BITCOIN WALLET FOUND!\n\nTimestamp: ${successData.timestamp}\nMatched Address: ${matchedAddress}\n\nPrivate Key (HEX): ${wallet.privateKey}\nPrivate Key (WIF): ${wallet.privateKeyWIF}\nPublic Key: ${wallet.publicKey}\n\nAll Addresses:\nLegacy: ${wallet.addresses.legacy}\nSegWit: ${wallet.addresses.segwit}\nNested: ${wallet.addresses.nested}\n\nStatistics:\n${JSON.stringify(successData.statistics, null, 2)}`;
    
    try {
      fs.writeFileSync(this.config.successFile, successString);
      console.log(chalk.green(`\n✅ Success details saved to: ${this.config.successFile}`));
    } catch (error) {
      this.logger.error('Failed to save success file:', error.message);
    }
    
    this.logger.success('Wallet found!', { address: matchedAddress, privateKey: wallet.privateKeyWIF });
    
    // Exit after success
    setTimeout(() => process.exit(0), 2000);
  }
  
  /**
   * Start the generation process
   */
  async start() {
    this.logger.info('Starting wallet generation...');
    this.isRunning = true;
    
    // Start spinner
    this.spinner = ora({
      text: 'Generating wallets...',
      color: 'cyan'
    }).start();
    
    let iterationCount = 0;
    let lastStatsTime = Date.now();
    
    while (this.isRunning) {
      // Generate and check wallet
      const found = this.generateAndCheck();
      if (found) break;
      
      iterationCount++;
      this.statistics.recordChecks(1);
      
      // Update spinner and stats periodically
      if (iterationCount % this.config.progressInterval === 0) {
        const stats = this.statistics.getFormattedStats();
        this.spinner.text = `Generated: ${stats.totalCheckedFormatted} | Rate: ${stats.currentRateFormatted} | Uptime: ${stats.uptime}`;
      }
      
      // Display detailed stats periodically
      if (Date.now() - lastStatsTime >= this.config.statsInterval) {
        this.displayStats();
        lastStatsTime = Date.now();
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
      
      // Small delay to prevent blocking
      if (iterationCount % this.config.batchSize === 0) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }
  }
  
  /**
   * Display detailed statistics
   */
  displayStats() {
    const stats = this.statistics.getFormattedStats();
    
    console.log('\n' + chalk.blue.bold('📊 Performance Statistics:'));
    console.log(`  Total Checked: ${chalk.green(stats.totalCheckedFormatted)}`);
    console.log(`  Current Rate: ${chalk.yellow(stats.currentRateFormatted)}`);
    console.log(`  Average Rate: ${chalk.yellow(stats.averageRateFormatted)}`);
    console.log(`  Uptime: ${chalk.cyan(stats.uptime)}`);
    console.log(`  Estimated Daily: ${chalk.magenta(stats.estimatedDailyFormatted)}`);
    console.log(`  Estimated Weekly: ${chalk.magenta(stats.estimatedWeeklyFormatted)}`);
    console.log(`  Memory Usage: ${chalk.gray((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' MB')}`);
    console.log();
  }
  
  /**
   * Stop the generation process
   */
  stop() {
    this.logger.info('Stopping wallet generation...');
    this.isRunning = false;
    
    if (this.spinner) {
      this.spinner.stop();
    }
    
    this.displayStats();
    console.log(chalk.yellow('\n👋 Generator stopped. Final statistics displayed above.\n'));
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
  .name('bitcoin-generator')
  .description('Advanced Bitcoin wallet generator with enhanced performance and security')
  .version('2.0.0')
  .option('-n, --network <network>', 'Bitcoin network (mainnet|testnet)', 'mainnet')
  .option('-s, --secure', 'Use cryptographically secure random generation', false)
  .option('-f, --fast', 'Use fast pseudo-random generation (less secure)', false)
  .option('-r, --rich-file <file>', 'Path to rich addresses file', './data/riches.txt')
  .option('-m, --memory <mb>', 'Memory threshold for garbage collection (MB)', '500')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .option('--legacy', 'Generate legacy addresses only', false)
  .option('--segwit', 'Generate SegWit addresses only', false)
  .option('--nested', 'Generate nested SegWit addresses only', false);

program.action(async (options) => {
  try {
    // Configure based on CLI options
    const generatorConfig = {
      network: options.network,
      useSecureRandom: options.secure || !options.fast,
      richWalletsFile: options.richFile,
      memoryThreshold: parseInt(options.memory),
      logLevel: options.verbose ? 'debug' : 'info'
    };
    
    // Configure address types
    if (options.legacy || options.segwit || options.nested) {
      generatorConfig.addressTypes = {
        legacy: !!options.legacy,
        segwit: !!options.segwit,
        nested: !!options.nested
      };
    }
    
    // Create and start generator
    const generator = new BitcoinWalletGenerator(generatorConfig);
    await generator.initialize();
    await generator.start();
    
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error.message);
    process.exit(1);
  }
});

// Parse CLI arguments
program.parse();