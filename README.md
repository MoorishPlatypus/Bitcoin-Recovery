# 🔑 Bitcoin Recovery Tool

**Professional-grade Bitcoin wallet recovery tool for legitimate wallet recovery operations**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-18%2B-green.svg)](https://nodejs.org/)
[![Performance](https://img.shields.io/badge/performance-200%2B%20mnemonics%2Fs-brightgreen.svg)](#performance)

## 🎯 Purpose

Bitcoin Recovery Tool is designed for **legitimate wallet recovery operations** including:

- 🔍 **Lost Wallet Recovery**: Help recover forgotten Bitcoin wallets with known partial information
- 🎓 **Educational Research**: Learn about Bitcoin cryptography and mnemonic generation
- 🔒 **Security Analysis**: Test wallet security and recovery procedures
- 🛠️ **Professional Services**: Wallet recovery service providers

## ✨ Key Features

### 🔑 Advanced Mnemonic Generation
- **High-performance generation**: 50-200 mnemonics per second
- **Multiple strength levels**: 128, 160, 192, 224, 256-bit entropy
- **BIP39 compliant**: Standard mnemonic phrase generation
- **Cryptographically secure**: Uses secure random number generation

### 🌐 Live Blockchain Integration
- **Real-time balance checking**: Instant wallet balance verification
- **Multiple API providers**: BlockCypher, Blockchain.info, Blockstream
- **Automatic failover**: Smart provider switching for reliability
- **Rate limiting**: Respects API constraints and limits

### 🔄 Advanced Proxy Support
- **Full proxy integration**: Route API requests through proxy servers
- **Authentication support**: Username/password proxy authentication
- **Automatic rotation**: Smart proxy switching to bypass rate limits
- **Health monitoring**: Real-time proxy performance tracking
- **Failover system**: Automatic proxy switching on failures

### 📊 Professional Monitoring
- **Real-time statistics**: Live performance and success metrics
- **Memory management**: Configurable memory limits and optimization
- **Progress tracking**: Detailed progress bars and time estimates
- **Audio alerts**: Immediate notification when wallets are found
- **Comprehensive logging**: Detailed operation logs for analysis

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/MoorishPlatypus/Bitcoin-Recovery.git
cd Bitcoin-Recovery

# Install dependencies
npm install
```

### Basic Usage

```bash
# Offline mnemonic generation (testing)
npm run mnemonic

# Live wallet recovery with blockchain checking
npm run mnemonic-live

# Advanced recovery with proxy support
node src/mnemonic-generator.js --live-check --proxy-file ./data/proxies.txt --test-proxies

# High-speed recovery mode
node src/mnemonic-generator.js --live-check --fast --rate-limit 15
```

## 📖 Documentation

- **[Complete Usage Guide](docs/MNEMONIC-HUNTER.md)** - Comprehensive documentation
- **[Technical Overview](docs/IMPROVEMENTS-SUMMARY.md)** - Detailed technical information
- **[Proxy Configuration](docs/PROXY-SETUP.md)** - Proxy setup and configuration
- **[API Reference](docs/API-REFERENCE.md)** - Complete API documentation

## 🔧 Configuration

### Proxy Setup

Create `data/proxies.txt` with your proxy configuration:

```
# Format: host:port:username:password
154.36.110.199:6853:username:password
192.168.1.100:8080:user1:pass1
10.0.0.100:3128
```

### Command Line Options

```bash
node src/mnemonic-generator.js [options]

Options:
  --live-check          Enable live blockchain checking
  --fast               Use fast generation mode (less secure)
  --rate-limit <n>     API requests per second (default: 2)
  --proxy-file <path>  Path to proxy configuration file
  --test-proxies       Test proxy connectivity before use
  --memory <mb>        Memory limit in MB (default: 100)
  --verbose            Enable verbose logging
  --help               Show help information
```

## 📊 Performance

- **Generation Rate**: 50-200 mnemonics per second
- **Memory Usage**: Configurable, typically 50-200 MB
- **API Integration**: Real-time blockchain checking
- **Proxy Support**: Full integration with rotation and failover

## 🛡️ Security Features

- **Secure Random Generation**: Cryptographically secure entropy
- **Memory Management**: Automatic cleanup of sensitive data
- **Rate Limiting**: Prevents API abuse and detection
- **Proxy Rotation**: Enhanced privacy and reliability
- **Error Handling**: Robust error recovery and logging

## ⚠️ Ethical Usage

This tool is designed for **legitimate purposes only**:

- ✅ **Recovering your own lost wallets**
- ✅ **Educational and research purposes**
- ✅ **Professional wallet recovery services**
- ✅ **Security analysis and testing**

**❌ Do NOT use for unauthorized access to wallets you don't own**

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our comprehensive guides in the `docs/` folder
- **Issues**: Report bugs or request features via GitHub Issues
- **Discussions**: Join our community discussions

## 🔗 Related Projects

- [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) - Mnemonic code standard
- [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) - Bitcoin library for JavaScript
- [bip32](https://github.com/bitcoinjs/bip32) - BIP32 hierarchical deterministic keys

---

**⚠️ Disclaimer**: This tool is for legitimate wallet recovery only. Users are responsible for ensuring compliance with applicable laws and regulations. The developers are not responsible for any misuse of this software.

**🚀 Professional wallet recovery made simple and secure!**
