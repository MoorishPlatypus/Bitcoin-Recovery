/**
 * Blockchain API utilities for checking wallet balances
 */

import axios from 'axios';
import pLimit from 'p-limit';
import ProxyManager from './proxy.js';

export class BlockchainAPI {
  constructor(options = {}) {
    this.rateLimitPerSecond = options.rateLimitPerSecond || 10;
    
    // Initialize proxy manager
    this.proxyManager = new ProxyManager({
      proxyFile: options.proxyFile || './data/proxies.txt',
      rotationInterval: options.proxyRotationInterval || 5
    });
    this.timeout = options.timeout || 10000;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
    
    // Rate limiting
    this.limiter = pLimit(this.rateLimitPerSecond);
    
    // API endpoints (multiple providers for redundancy)
    this.providers = [
      {
        name: 'BlockCypher',
        baseUrl: 'https://api.blockcypher.com/v1/btc/main',
        getBalance: (address) => `${this.providers[0].baseUrl}/addrs/${address}/balance`,
        parseBalance: (response) => response.data.balance || 0,
        rateLimit: 200 // requests per hour for free tier
      },
      {
        name: 'Blockchain.info',
        baseUrl: 'https://blockchain.info',
        getBalance: (address) => `${this.providers[1].baseUrl}/q/addressbalance/${address}`,
        parseBalance: (response) => parseInt(response.data) || 0,
        rateLimit: 300 // requests per hour
      },
      {
        name: 'Blockstream',
        baseUrl: 'https://blockstream.info/api',
        getBalance: (address) => `${this.providers[2].baseUrl}/address/${address}`,
        parseBalance: (response) => (response.data.chain_stats?.funded_txo_sum || 0) - (response.data.chain_stats?.spent_txo_sum || 0),
        rateLimit: 600 // more generous
      }
    ];
    
    this.currentProviderIndex = 0;
    this.requestCounts = new Map();
    this.lastResetTime = Date.now();
  }
  
  /**
   * Get current provider
   */
  getCurrentProvider() {
    return this.providers[this.currentProviderIndex];
  }
  
  /**
   * Switch to next provider
   */
  switchProvider() {
    this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
    console.log(`Switched to provider: ${this.getCurrentProvider().name}`);
  }
  
  /**
   * Check if we've hit rate limits
   */
  checkRateLimit() {
    const now = Date.now();
    const hoursSinceReset = (now - this.lastResetTime) / (1000 * 60 * 60);
    
    if (hoursSinceReset >= 1) {
      this.requestCounts.clear();
      this.lastResetTime = now;
    }
    
    const provider = this.getCurrentProvider();
    const currentCount = this.requestCounts.get(provider.name) || 0;
    
    if (currentCount >= provider.rateLimit) {
      this.switchProvider();
      return this.checkRateLimit(); // Check new provider
    }
    
    return true;
  }
  
  /**
   * Make API request with retry logic
   */
  async makeRequest(url, provider) {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        // Get proxy configuration
        const proxyConfig = this.proxyManager.getAxiosConfig(this.timeout);
        const currentProxy = this.proxyManager.getCurrentProxy();
        
        const config = {
          ...proxyConfig,
          headers: {
            'User-Agent': 'Bitcoin-Wallet-Generator/2.0'
          }
        };
        
        const startTime = Date.now();
        const response = await axios.get(url, config);
        const responseTime = Date.now() - startTime;
        
        // Mark proxy as successful
        if (currentProxy) {
          this.proxyManager.markProxySuccess(currentProxy, responseTime);
        }
        
        // Update request count
        const currentCount = this.requestCounts.get(provider.name) || 0;
        this.requestCounts.set(provider.name, currentCount + 1);
        
        return response;
      } catch (error) {
        // Mark proxy as failed if it's a proxy-related error
        const currentProxy = this.proxyManager.getCurrentProxy();
        if (currentProxy && (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND')) {
          this.proxyManager.markProxyFailed(currentProxy, error);
        }
        
        if (attempt === this.retryAttempts) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }
  
  /**
   * Check balance for a single address
   */
  async checkBalance(address) {
    return this.limiter(async () => {
      this.checkRateLimit();
      
      const provider = this.getCurrentProvider();
      const url = provider.getBalance(address);
      
      try {
        const response = await this.makeRequest(url, provider);
        const balance = provider.parseBalance(response);
        
        return {
          address,
          balance,
          balanceBTC: balance / 100000000, // Convert satoshis to BTC
          provider: provider.name,
          success: true
        };
      } catch (error) {
        // Try next provider on error
        if (error.response?.status === 429) {
          this.switchProvider();
          return this.checkBalance(address); // Retry with new provider
        }
        
        return {
          address,
          balance: 0,
          balanceBTC: 0,
          provider: provider.name,
          success: false,
          error: error.message
        };
      }
    });
  }
  
  /**
   * Check balances for multiple addresses
   */
  async checkBalances(addresses) {
    const promises = addresses.map(address => this.checkBalance(address));
    return Promise.all(promises);
  }
  
  /**
   * Check if any address has a positive balance
   */
  async hasPositiveBalance(addresses) {
    const results = await this.checkBalances(addresses);
    return results.find(result => result.success && result.balance > 0);
  }
  
  /**
   * Get API usage statistics
   */
  getUsageStats() {
    const stats = {};
    for (const [provider, count] of this.requestCounts.entries()) {
      const providerInfo = this.providers.find(p => p.name === provider);
      stats[provider] = {
        requests: count,
        limit: providerInfo?.rateLimit || 0,
        remaining: Math.max(0, (providerInfo?.rateLimit || 0) - count)
      };
    }
    return stats;
  }
  
  /**
   * Get proxy statistics
   */
  getProxyStats() {
    return this.proxyManager.getProxyStats();
  }
  
  /**
   * Get proxy summary
   */
  getProxySummary() {
    return this.proxyManager.getSummary();
  }
  
  /**
   * Test all proxies
   */
  async testProxies() {
    return await this.proxyManager.testAllProxies();
  }
  
  /**
   * Reset failed proxies
   */
  resetFailedProxies() {
    this.proxyManager.resetFailedProxies();
  }
}

export default BlockchainAPI;