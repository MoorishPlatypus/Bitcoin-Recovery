# 🔍 Bitcoin Mnemonic Hunter - Lost Wallet Recovery Tool

**Advanced Bitcoin mnemonic phrase generator with live blockchain balance checking**

## 🎯 Mission

This tool is specifically designed to help recover **truly lost and forgotten Bitcoin wallets** by generating mnemonic phrases and checking them against the Bitcoin blockchain for positive balances. Many early Bitcoin adopters have lost access to their wallets due to forgotten mnemonic phrases, and this tool aims to help recover those lost funds.

## ✨ Key Features

### 🔑 Mnemonic Phrase Generation
- **Multiple Strengths**: 128, 160, 192, 224, 256-bit entropy (12-24 words)
- **Cryptographically Secure**: Uses Node.js crypto module for true randomness
- **BIP39 Standard**: Full compliance with Bitcoin Improvement Proposal 39
- **Multiple Derivation Paths**: BIP44 (Legacy), BIP84 (SegWit), BIP49 (Nested SegWit)

### 🌐 Live Blockchain Checking
- **Real-time Balance Verification**: Checks generated addresses against live Bitcoin blockchain
- **Multiple API Providers**: BlockCypher, Blockchain.info, Blockstream (automatic failover)
- **Rate Limiting**: Intelligent rate limiting to avoid API restrictions
- **Batch Processing**: Efficient checking of multiple addresses

### 💾 Automatic Success Handling
- **Instant Alerts**: Audio and visual notifications when balance found
- **Detailed Logging**: Complete wallet information saved to files
- **Recovery Information**: Full mnemonic phrase, derivation paths, private keys
- **Multiple Formats**: WIF, HEX, and mnemonic phrase formats

### 🚀 Performance Optimized
- **High Speed**: 50-100+ mnemonic generations per second
- **Memory Efficient**: Automatic garbage collection and memory management
- **Multi-Address Coverage**: Checks Legacy, SegWit, and Nested SegWit addresses
- **Comprehensive Statistics**: Real-time performance monitoring

## 🚀 Quick Start

### Installation
```bash
# Clone the repository
git clone https://github.com/Michal2SAB/Bitcoin-Stealer.git
cd Bitcoin-Stealer

# Install dependencies
npm install
```

### Basic Usage

#### 1. Offline Mode (Testing)
```bash
# Generate mnemonics without blockchain checking
npm run mnemonic
```

#### 2. Live Mode (Real Hunting)
```bash
# Generate mnemonics with live blockchain balance checking
npm run mnemonic-live
```

#### 3. Advanced Options
```bash
# Use 24-word mnemonics (256-bit entropy)
node src/mnemonic-generator.js --live-check --strength 256

# Focus on SegWit addresses only
node src/mnemonic-generator.js --live-check --segwit-only

# Increase API rate limit
node src/mnemonic-generator.js --live-check --rate-limit 10

# Set minimum balance threshold (1000 satoshis)
node src/mnemonic-generator.js --live-check --min-balance 1000

# Generate more addresses per mnemonic
node src/mnemonic-generator.js --live-check --addresses 10
```

## 📊 Understanding the Output

### Real-time Statistics
```
🔍 Checked: 1.2K | Rate: 85/s | Found: 0 | Uptime: 14s
```
- **Checked**: Total mnemonics processed
- **Rate**: Current generation rate per second
- **Found**: Number of wallets with balances discovered
- **Uptime**: Total running time

### Detailed Statistics (Every Minute)
```
📊 Hunting Statistics:
  Mnemonics Checked: 5,234
  Current Rate: 87/s
  Average Rate: 82/s
  Wallets Found: 0
  Uptime: 1m 3s
  Estimated Daily: 7.1M
  Memory Usage: 45.2 MB
```

### API Usage Statistics
```
🌐 API Usage Statistics:
  BlockCypher: 45/200 (22.5%)
  Blockchain.info: 23/300 (7.7%)
  Blockstream: 12/600 (2.0%)

🔄 Proxy Statistics:
  Total Proxies: 5
  Active: 4 | Failed: 1
  Current: 192.168.1.100:8080
  Requests via Proxies: 127
```

## 🎉 When a Wallet is Found

When a mnemonic phrase generates addresses with Bitcoin balances:

### 1. Immediate Alert
- **Audio beep** notification
- **Console highlight** with balance information
- **Automatic file saving** with complete details

### 2. Saved Information
The tool automatically saves:
- **Complete mnemonic phrase**
- **All derived addresses** (Legacy, SegWit, Nested)
- **Private keys** in multiple formats (WIF, HEX)
- **Derivation paths** for each address
- **Balance information** and blockchain provider
- **Generation statistics** at time of discovery

### 3. File Locations
- `found-wallets/BITCOIN-WALLET-[timestamp].txt` - Detailed wallet information
- `Success.txt` - Main success file (for compatibility)

### 4. Example Success Output
```
🎉 JACKPOT! BITCOIN WALLET WITH BALANCE FOUND! 🎉

💰 Balance Found: 0.00123456 BTC (123456 satoshis)
📍 Address: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
🔑 Mnemonic Phrase: abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
🌐 Provider: BlockCypher

📋 All Derived Addresses:
  LEGACY:
    0: 1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA
    1: 1C6Rc3w25VHud3dLDamutbXaXt9s14aHr
  SEGWIT:
    0: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh ← MATCH!
    1: bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4
  NESTED:
    0: 3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy
    1: 3QJmV3qfvL9SuYo34YihAf3sRCW3qSinyC
```

## ⚙️ Configuration Options

### Mnemonic Strength
- **128 bits (12 words)**: Standard, fastest generation
- **160 bits (15 words)**: Enhanced security
- **192 bits (18 words)**: Strong security
- **224 bits (21 words)**: Very strong security
- **256 bits (24 words)**: Maximum security (recommended for serious hunting)

### Address Types
- **Legacy (P2PKH)**: Traditional addresses starting with "1"
- **SegWit (P2WPKH)**: Native SegWit addresses starting with "bc1"
- **Nested (P2SH-P2WPKH)**: Nested SegWit addresses starting with "3"

### API Rate Limits
- **Conservative**: 2-5 requests/second (recommended for 24/7 operation)
- **Moderate**: 5-10 requests/second (good balance)
- **Aggressive**: 10+ requests/second (may hit limits faster)

## 🎯 Hunting Strategies

### 1. Comprehensive Coverage (Recommended)
```bash
node src/mnemonic-generator.js --live-check --strength 256 --addresses 10
```
- Uses 24-word mnemonics for maximum entropy
- Checks 10 addresses per derivation path
- Covers all address types

### 2. Legacy Focus (Early Bitcoin)
```bash
node src/mnemonic-generator.js --live-check --legacy-only --addresses 20
```
- Focuses on Legacy addresses (early Bitcoin era)
- Checks more addresses per mnemonic
- Good for finding very old wallets

### 3. SegWit Focus (Modern Wallets)
```bash
node src/mnemonic-generator.js --live-check --segwit-only --strength 256
```
- Focuses on modern SegWit addresses
- Uses maximum entropy
- Good for finding newer lost wallets

### 4. High-Speed Scanning
```bash
node src/mnemonic-generator.js --live-check --fast --rate-limit 15
```
- Uses faster (less secure) random generation
- Higher API rate limit
- Good for quick scanning sessions

### 5. Using Proxies for Enhanced Performance
```bash
node src/mnemonic-generator.js --live-check --proxy-file ./data/proxies.txt --test-proxies
```
- Routes API requests through proxy servers
- Bypasses rate limits and IP restrictions
- Automatic proxy rotation and failover
- Tests proxy connectivity before starting

## 📈 Expected Performance

### Generation Rates
- **Secure Mode**: 50-100 mnemonics/second
- **Fast Mode**: 100-200 mnemonics/second
- **With Live Checking**: Limited by API rate limits (5-15/second)

### Coverage Estimates
With default settings (5 addresses per type, 3 types):
- **Per Mnemonic**: 15 addresses checked
- **Per Hour**: ~270,000 addresses (at 5 mnemonics/second)
- **Per Day**: ~6.5 million addresses

### Probability Considerations
- **Total Bitcoin Addresses**: 2^160 possible addresses
- **Realistic Timeframe**: Finding a wallet with balance is extremely unlikely
- **Educational Value**: Excellent for learning Bitcoin cryptography
- **Lost Wallet Recovery**: Possible but requires patience and luck

## 🔒 Security & Ethics

### Responsible Use
- ✅ **Recovering truly lost wallets**: Help people recover their own forgotten funds
- ✅ **Educational purposes**: Learning about Bitcoin cryptography and security
- ✅ **Research**: Understanding Bitcoin address space and entropy
- ❌ **Attacking active wallets**: Never attempt to access wallets belonging to others
- ❌ **Malicious use**: Don't use for theft or unauthorized access

### Security Best Practices
1. **Immediate Transfer**: If you find a wallet with balance, transfer funds to a secure wallet immediately
2. **Secure Environment**: Run the tool on a secure, offline-capable machine
3. **Private Keys**: Never share found private keys or mnemonic phrases
4. **Clean Up**: Securely delete wallet files after successful recovery

## 🛠️ Technical Details

### Dependencies
- **bitcoinjs-lib**: Bitcoin cryptography and address generation
- **bip39**: Mnemonic phrase generation and validation
- **bip32**: Hierarchical deterministic wallet derivation
- **axios**: HTTP client for blockchain API calls
- **p-limit**: Rate limiting for API requests

### Blockchain APIs
1. **BlockCypher**: 200 requests/hour (free tier)
2. **Blockchain.info**: 300 requests/hour
3. **Blockstream**: 600 requests/hour (most generous)

### Memory Usage
- **Typical**: 20-50 MB
- **With GC**: Automatic cleanup every 10,000 iterations
- **Threshold**: Configurable memory limit (default 500 MB)

## 🐛 Troubleshooting

### Common Issues

#### API Rate Limits
```
Error: Request failed with status code 429
```
**Solution**: Reduce rate limit with `--rate-limit 2`

#### Network Connectivity
```
Error: getaddrinfo ENOTFOUND api.blockcypher.com
```
**Solution**: Check internet connection, APIs may be temporarily down

#### Memory Issues
```
JavaScript heap out of memory
```
**Solution**: Lower memory threshold with `--memory 200`

#### No Balances Found
This is normal! Finding wallets with balances is extremely rare.

### Performance Optimization

#### For Maximum Speed
```bash
node --max-old-space-size=4096 src/mnemonic-generator.js --live-check --fast
```

#### For 24/7 Operation
```bash
node src/mnemonic-generator.js --live-check --rate-limit 2 --memory 200
```

#### For Testing
```bash
node src/mnemonic-generator.js --verbose
```

## 🔄 Proxy Configuration

### Setting Up Proxies

1. **Edit the proxy file** (`data/proxies.txt`):
```
# Format: ip:port:username:password
154.36.110.199:6853:acstdtpb:70fjieohpgdp
192.168.1.100:8080:user1:pass1

# Or without authentication:
192.168.1.200:8080
10.0.0.100:3128
```

2. **Test your proxies**:
```bash
node src/mnemonic-generator.js --live-check --test-proxies
```

3. **Configure proxy rotation**:
```bash
node src/mnemonic-generator.js --live-check --proxy-rotation 10
```

### Proxy Features
- **Automatic rotation**: Switches proxies after specified requests
- **Health monitoring**: Tracks response times and failures
- **Failover support**: Automatically skips failed proxies
- **Authentication**: Supports username/password authentication
- **Statistics**: Real-time proxy performance monitoring

### Proxy Benefits
- **Bypass rate limits**: Each proxy gets separate API limits
- **Geographic diversity**: Access APIs from different locations
- **Anonymity**: Hide your real IP address
- **Reliability**: Continue operation if some proxies fail

## 📚 Learning Resources

### Bitcoin Cryptography
- [BIP39 - Mnemonic Phrases](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [BIP32 - Hierarchical Deterministic Wallets](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)
- [BIP44 - Multi-Account Hierarchy](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)

### Address Formats
- [BIP84 - Native SegWit](https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki)
- [BIP49 - Nested SegWit](https://github.com/bitcoin/bips/blob/master/bip-0049.mediawiki)

## ⚖️ Legal Disclaimer

This tool is provided for educational and legitimate wallet recovery purposes only. Users are responsible for:

- Complying with local laws and regulations
- Using the tool ethically and responsibly
- Not attempting to access wallets belonging to others
- Understanding the extremely low probability of success

The authors are not responsible for any misuse of this tool.

## 🤝 Contributing

Contributions are welcome! Areas for improvement:

- Additional blockchain API providers
- Performance optimizations
- Better success detection algorithms
- Enhanced statistics and reporting
- Mobile/web interface

## 💝 Support

If this tool helps you recover lost Bitcoin:

- ⭐ Star the repository
- 🐛 Report bugs and issues
- 💡 Suggest improvements
- 🔄 Share with others who might benefit

### Donations
- **Bitcoin**: 1B8xs4LWbwFq4Zi4pzEmjNYkTCgsUByb5L
- **Ethereum**: 0xe89c84A7758429b4D11a2091e1dccf7433328Fa9

---

**Remember**: The chances of finding a wallet with balance are astronomically low, but every lost Bitcoin recovered helps the community. Use this tool responsibly and ethically! 🚀

*"Not your keys, not your Bitcoin. But if you've lost your keys, maybe we can help you find them."*