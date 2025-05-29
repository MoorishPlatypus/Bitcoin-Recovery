/**
 * Configuration settings for the Bitcoin wallet generator
 */

export const config = {
  // File paths
  richWalletsFile: './data/riches.txt',
  successFile: './Success.txt',
  logFile: './logs/generator.log',
  
  // Performance settings
  memoryThreshold: 500, // MB
  gcInterval: 10000, // iterations
  batchSize: 1000, // wallets to generate before checking memory
  
  // Display settings
  progressInterval: 1000, // iterations
  statsInterval: 60000, // ms (1 minute)
  
  // Security settings
  useSecureRandom: true,
  
  // Worker settings
  useWorkers: false,
  workerCount: 4, // Default worker count
  
  // Logging
  enableLogging: true,
  logLevel: 'info', // 'debug', 'info', 'warn', 'error'
  
  // Bitcoin network
  network: 'mainnet', // 'mainnet' or 'testnet'
  
  // Generation mode
  mode: 'private-key', // 'private-key' or 'mnemonic'
  
  // Address types to generate
  addressTypes: {
    legacy: true,      // P2PKH (1...)
    segwit: true,      // P2WPKH (bc1...)
    nested: true       // P2SH-P2WPKH (3...)
  },
  
  // Mnemonic settings
  mnemonic: {
    strength: 128,     // 128, 160, 192, 224, 256 bits
    addressCount: 5,   // Number of addresses to derive per type
    accountIndex: 0,   // BIP44 account index
    passphrase: ''     // Optional passphrase
  },
  
  // Blockchain checking
  blockchain: {
    enabled: false,           // Enable live blockchain balance checking
    checkMode: 'api',         // 'api' or 'static' (static uses riches.txt)
    rateLimitPerSecond: 5,    // API requests per second
    timeout: 10000,           // Request timeout in ms
    retryAttempts: 3,         // Number of retry attempts
    retryDelay: 1000,         // Delay between retries
    minBalance: 0,            // Minimum balance to consider (satoshis)
    batchSize: 10             // Addresses to check per batch
  }
};

export default config;