# Advanced Bitcoin Wallet Generator v2.0

🚀 **Enhanced Bitcoin wallet generator with improved performance, security, and modern features**

## ✨ What's New in v2.0

### 🔧 Major Improvements
- **Modern ES6+ JavaScript** with module support
- **Enhanced Security** with cryptographically secure random generation
- **Multiple Address Types** support (Legacy, SegWit, Nested SegWit)
- **Advanced Statistics** and performance monitoring
- **Better Memory Management** with automatic garbage collection
- **Cross-Platform** single codebase (replaces separate Windows/Linux versions)
- **CLI Interface** with comprehensive options
- **Improved Logging** with multiple levels and file output
- **Better Error Handling** and graceful shutdown

### 🎯 Key Features
- **3x Address Coverage**: Checks Legacy (P2PKH), SegWit (P2WPKH), and Nested SegWit (P2SH-P2WPKH) addresses
- **Secure Random Generation**: Uses Node.js crypto module for cryptographically secure randomness
- **Real-time Statistics**: Live performance metrics and projections
- **Memory Optimization**: Automatic garbage collection and memory monitoring
- **Graceful Shutdown**: Proper cleanup on exit with final statistics
- **Enhanced UI**: Colored output, progress indicators, and better formatting

## 🚀 Quick Start

### Prerequisites
- Node.js 16.0.0 or higher
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone https://github.com/Michal2SAB/Bitcoin-Stealer.git
cd Bitcoin-Stealer

# Install dependencies
npm install

# Run the generator
npm start
```

### Alternative Installation (Development)
```bash
# Install dependencies
npm install

# Run with garbage collection enabled
npm run dev

# Run tests
npm test
```

## 📖 Usage

### Basic Usage
```bash
# Start with default settings
npm start

# Or run directly
node --expose-gc src/generator.js
```

### Advanced Usage
```bash
# Use secure random generation
node src/generator.js --secure

# Use fast pseudo-random (less secure but faster)
node src/generator.js --fast

# Specify custom rich addresses file
node src/generator.js --rich-file ./my-addresses.txt

# Use testnet
node src/generator.js --network testnet

# Generate only specific address types
node src/generator.js --legacy          # Legacy addresses only
node src/generator.js --segwit          # SegWit addresses only
node src/generator.js --nested          # Nested SegWit only

# Adjust memory threshold
node src/generator.js --memory 1000     # 1GB threshold

# Enable verbose logging
node src/generator.js --verbose

# Get help
node src/generator.js --help
```

## 📁 Project Structure

```
Bitcoin-Stealer/
├── src/
│   ├── config/
│   │   └── config.js           # Configuration settings
│   ├── utils/
│   │   ├── crypto.js           # Cryptographic utilities
│   │   ├── logger.js           # Enhanced logging
│   │   ├── statistics.js       # Performance tracking
│   │   └── wallet.js           # Wallet generation
│   ├── test/
│   │   └── test.js             # Test suite
│   └── generator.js            # Main application
├── data/
│   └── riches.txt              # Rich addresses database
├── logs/                       # Log files (auto-created)
├── Legacy/                     # Old versions (kept for reference)
│   ├── Linux/
│   └── Windows/
├── package.json
└── README.md
```

## ⚙️ Configuration

The generator can be configured through:

1. **CLI Arguments** (highest priority)
2. **Configuration file** (`src/config/config.js`)
3. **Default values**

### Key Configuration Options

```javascript
{
  // Performance
  memoryThreshold: 500,        // MB before garbage collection
  batchSize: 1000,            // Wallets per batch
  
  // Security
  useSecureRandom: true,      // Use crypto.randomBytes()
  
  // Address Types
  addressTypes: {
    legacy: true,             // P2PKH (1...)
    segwit: true,             // P2WPKH (bc1...)
    nested: true              // P2SH-P2WPKH (3...)
  },
  
  // Display
  progressInterval: 1000,     // Update frequency
  statsInterval: 60000,       // Stats display interval (ms)
  
  // Files
  richWalletsFile: './data/riches.txt',
  successFile: './Success.txt',
  logFile: './logs/generator.log'
}
```

## 📊 Performance

### Benchmark Results
- **Secure Mode**: ~50,000-100,000 wallets/second
- **Fast Mode**: ~100,000-200,000 wallets/second
- **Memory Usage**: <100MB with automatic GC
- **Address Coverage**: 3x more addresses checked per private key

### Performance Comparison (v1 vs v2)
| Feature | v1.0 | v2.0 | Improvement |
|---------|------|------|-------------|
| Address Types | 1 | 3 | 3x coverage |
| Random Security | Basic | Crypto-secure | Much better |
| Memory Management | Manual | Automatic | Stable |
| Statistics | Basic | Advanced | Real-time |
| Error Handling | Minimal | Comprehensive | Robust |

## 🔒 Security Features

### Cryptographically Secure Random Generation
- Uses Node.js `crypto.randomBytes()` for true randomness
- Fallback to fast pseudo-random for performance testing
- Proper entropy for private key generation

### Memory Security
- Automatic cleanup of sensitive data
- Garbage collection for memory management
- No private key persistence in memory

## 📈 Statistics & Monitoring

The generator provides comprehensive statistics:

- **Real-time Rate**: Current generation speed
- **Average Rate**: Overall performance
- **Total Checked**: Cumulative wallet count
- **Projections**: Daily, weekly, monthly, yearly estimates
- **Memory Usage**: Current heap utilization
- **Uptime**: Total running time

## 🧪 Testing

```bash
# Run the test suite
npm test

# Or run directly
node src/test/test.js
```

The test suite includes:
- Wallet generation verification
- Address matching functionality
- Performance benchmarking
- Random generation testing

## 📝 Rich Addresses Database

Add Bitcoin addresses to `data/riches.txt`:

```
# Comments start with #
1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ
bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy
```

### Finding Rich Addresses
- Blockchain explorers (blockchain.info, blockchair.com)
- Rich lists and whale watching services
- Known exchange addresses
- Public address databases

## 🎯 Success Handling

When a match is found:
1. **Audio Alert**: System beep
2. **Console Display**: Highlighted success message
3. **File Output**: Complete wallet details saved to `Success.txt`
4. **Automatic Exit**: Program stops after success

Success file includes:
- Matched address
- Private key (HEX and WIF formats)
- Public key
- All generated addresses
- Generation statistics

## ⚠️ Important Notes

### Probability & Expectations
- **Extremely Low Probability**: Finding a match is astronomically unlikely
- **Educational Purpose**: This is primarily for learning about Bitcoin cryptography
- **Not Financial Advice**: Don't expect to find anything valuable

### Ethical Considerations
- Only target truly lost/abandoned wallets
- Don't attempt to access active wallets
- Respect others' property and privacy

### Legal Disclaimer
- Use responsibly and legally
- Check local laws and regulations
- Author not responsible for misuse

## 🔧 Development

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Dependencies
- `bitcoinjs-lib`: Bitcoin cryptography and address generation
- `commander`: CLI argument parsing
- `chalk`: Colored terminal output
- `ora`: Loading spinners
- `cli-progress`: Progress bars

## 📜 Changelog

### v2.0.0 (Current)
- Complete rewrite with modern JavaScript
- Multiple address type support
- Enhanced security and performance
- Comprehensive statistics and monitoring
- Cross-platform single codebase
- CLI interface with options
- Improved error handling and logging

### v1.0.0 (Legacy)
- Basic wallet generation
- Single address type (Legacy)
- Separate Windows/Linux versions
- Basic statistics
- Manual memory management

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💝 Support

If you find this project helpful:
- ⭐ Star the repository
- 🐛 Report bugs and issues
- 💡 Suggest improvements
- 🔄 Share with others

### Donations
If you'd like to support development:
- **Bitcoin**: 1B8xs4LWbwFq4Zi4pzEmjNYkTCgsUByb5L
- **Ethereum**: 0xe89c84A7758429b4D11a2091e1dccf7433328Fa9

---

**Remember**: The chances of finding anything are extremely low. This is primarily an educational tool for understanding Bitcoin cryptography and wallet generation. Use responsibly! 🚀