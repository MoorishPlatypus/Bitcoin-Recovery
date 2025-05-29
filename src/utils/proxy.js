/**
 * Proxy management utilities for blockchain API requests
 */

import fs from 'fs';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';

export class ProxyManager {
  constructor(options = {}) {
    this.proxyFile = options.proxyFile || './data/proxies.txt';
    this.proxies = [];
    this.currentProxyIndex = 0;
    this.failedProxies = new Set();
    this.proxyStats = new Map();
    this.rotationInterval = options.rotationInterval || 10; // requests per proxy
    this.requestCount = 0;
    
    this.loadProxies();
  }
  
  /**
   * Load proxies from file
   */
  loadProxies() {
    try {
      if (fs.existsSync(this.proxyFile)) {
        const data = fs.readFileSync(this.proxyFile, 'utf8');
        const lines = data.split('\n').filter(line => line.trim());
        
        this.proxies = lines.map(line => this.parseProxy(line.trim())).filter(Boolean);
        
        console.log(`Loaded ${this.proxies.length} proxies from ${this.proxyFile}`);
        
        // Initialize stats
        this.proxies.forEach(proxy => {
          this.proxyStats.set(proxy.id, {
            requests: 0,
            successes: 0,
            failures: 0,
            lastUsed: null,
            avgResponseTime: 0
          });
        });
      } else {
        console.log('No proxy file found. Running without proxies.');
      }
    } catch (error) {
      console.error('Error loading proxies:', error.message);
    }
  }
  
  /**
   * Parse proxy string in format: ip:port:username:password
   */
  parseProxy(proxyString) {
    const parts = proxyString.split(':');
    
    if (parts.length === 2) {
      // Format: ip:port
      return {
        id: proxyString,
        host: parts[0],
        port: parseInt(parts[1]),
        auth: null,
        url: `http://${parts[0]}:${parts[1]}`
      };
    } else if (parts.length === 4) {
      // Format: ip:port:username:password
      return {
        id: proxyString,
        host: parts[0],
        port: parseInt(parts[1]),
        auth: {
          username: parts[2],
          password: parts[3]
        },
        url: `http://${parts[2]}:${parts[3]}@${parts[0]}:${parts[1]}`
      };
    }
    
    console.warn(`Invalid proxy format: ${proxyString}`);
    return null;
  }
  
  /**
   * Get current proxy
   */
  getCurrentProxy() {
    if (this.proxies.length === 0) {
      return null;
    }
    
    // Skip failed proxies
    let attempts = 0;
    while (attempts < this.proxies.length) {
      const proxy = this.proxies[this.currentProxyIndex];
      
      if (!this.failedProxies.has(proxy.id)) {
        return proxy;
      }
      
      this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
      attempts++;
    }
    
    // If all proxies failed, reset failed list and try again
    if (this.failedProxies.size === this.proxies.length) {
      console.log('All proxies failed. Resetting failed proxy list.');
      this.failedProxies.clear();
      return this.proxies[this.currentProxyIndex];
    }
    
    return null;
  }
  
  /**
   * Get next proxy (rotation)
   */
  getNextProxy() {
    if (this.proxies.length === 0) {
      return null;
    }
    
    this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
    return this.getCurrentProxy();
  }
  
  /**
   * Create HTTP agent for proxy
   */
  createAgent(proxy, isHttps = true) {
    if (!proxy) {
      return null;
    }
    
    const agentOptions = {
      host: proxy.host,
      port: proxy.port,
      auth: proxy.auth ? `${proxy.auth.username}:${proxy.auth.password}` : null
    };
    
    return isHttps ? new HttpsProxyAgent(proxy.url) : new HttpProxyAgent(proxy.url);
  }
  
  /**
   * Get axios config with proxy
   */
  getAxiosConfig(timeout = 10000) {
    const proxy = this.getCurrentProxy();
    
    if (!proxy) {
      return { timeout };
    }
    
    // Rotate proxy if needed
    this.requestCount++;
    if (this.requestCount % this.rotationInterval === 0) {
      this.getNextProxy();
    }
    
    const config = {
      timeout,
      httpsAgent: this.createAgent(proxy, true),
      httpAgent: this.createAgent(proxy, false),
      proxy: false // Disable axios built-in proxy to use our agent
    };
    
    // Update stats
    const stats = this.proxyStats.get(proxy.id);
    if (stats) {
      stats.requests++;
      stats.lastUsed = new Date();
    }
    
    return config;
  }
  
  /**
   * Mark proxy as failed
   */
  markProxyFailed(proxy, error) {
    if (!proxy) return;
    
    this.failedProxies.add(proxy.id);
    
    const stats = this.proxyStats.get(proxy.id);
    if (stats) {
      stats.failures++;
    }
    
    console.log(`Proxy ${proxy.host}:${proxy.port} marked as failed: ${error.message}`);
    
    // Move to next proxy
    this.getNextProxy();
  }
  
  /**
   * Mark proxy as successful
   */
  markProxySuccess(proxy, responseTime) {
    if (!proxy) return;
    
    const stats = this.proxyStats.get(proxy.id);
    if (stats) {
      stats.successes++;
      stats.avgResponseTime = (stats.avgResponseTime + responseTime) / 2;
    }
  }
  
  /**
   * Get proxy statistics
   */
  getProxyStats() {
    const stats = {};
    
    for (const [proxyId, data] of this.proxyStats.entries()) {
      const proxy = this.proxies.find(p => p.id === proxyId);
      if (proxy) {
        stats[proxyId] = {
          host: `${proxy.host}:${proxy.port}`,
          requests: data.requests,
          successes: data.successes,
          failures: data.failures,
          successRate: data.requests > 0 ? ((data.successes / data.requests) * 100).toFixed(1) + '%' : '0%',
          avgResponseTime: data.avgResponseTime.toFixed(0) + 'ms',
          lastUsed: data.lastUsed ? data.lastUsed.toISOString() : 'Never',
          status: this.failedProxies.has(proxyId) ? 'Failed' : 'Active'
        };
      }
    }
    
    return stats;
  }
  
  /**
   * Test proxy connectivity
   */
  async testProxy(proxy, testUrl = 'https://api.blockcypher.com/v1/btc/main') {
    const axios = (await import('axios')).default;
    
    try {
      const startTime = Date.now();
      const agent = this.createAgent(proxy, true);
      
      const response = await axios.get(testUrl, {
        timeout: 5000,
        httpsAgent: agent,
        httpAgent: this.createAgent(proxy, false),
        proxy: false
      });
      
      const responseTime = Date.now() - startTime;
      
      console.log(`✅ Proxy ${proxy.host}:${proxy.port} - OK (${responseTime}ms)`);
      this.markProxySuccess(proxy, responseTime);
      
      return true;
    } catch (error) {
      console.log(`❌ Proxy ${proxy.host}:${proxy.port} - Failed: ${error.message}`);
      this.markProxyFailed(proxy, error);
      
      return false;
    }
  }
  
  /**
   * Test all proxies
   */
  async testAllProxies() {
    console.log(`Testing ${this.proxies.length} proxies...`);
    
    const results = await Promise.allSettled(
      this.proxies.map(proxy => this.testProxy(proxy))
    );
    
    const working = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.length - working;
    
    console.log(`Proxy test complete: ${working} working, ${failed} failed`);
    
    return { working, failed, total: results.length };
  }
  
  /**
   * Reset failed proxies (give them another chance)
   */
  resetFailedProxies() {
    const failedCount = this.failedProxies.size;
    this.failedProxies.clear();
    console.log(`Reset ${failedCount} failed proxies`);
  }
  
  /**
   * Get summary
   */
  getSummary() {
    const total = this.proxies.length;
    const failed = this.failedProxies.size;
    const active = total - failed;
    const current = this.getCurrentProxy();
    
    return {
      total,
      active,
      failed,
      currentProxy: current ? `${current.host}:${current.port}` : 'None',
      requestCount: this.requestCount
    };
  }
}

export default ProxyManager;