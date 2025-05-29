/**
 * Statistics tracking and performance monitoring
 */

export class Statistics {
  constructor() {
    this.startTime = Date.now();
    this.totalChecked = 0;
    this.lastCheckTime = Date.now();
    this.lastCheckedCount = 0;
    this.checkHistory = [];
    this.maxHistorySize = 60; // Keep last 60 measurements
  }
  
  /**
   * Record wallet checks
   * @param {number} count - Number of wallets checked
   */
  recordChecks(count = 1) {
    this.totalChecked += count;
  }
  
  /**
   * Get current statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    const now = Date.now();
    const totalTime = (now - this.startTime) / 1000; // seconds
    const intervalTime = (now - this.lastCheckTime) / 1000; // seconds
    const intervalChecks = this.totalChecked - this.lastCheckedCount;
    
    const currentRate = intervalTime > 0 ? intervalChecks / intervalTime : 0;
    const averageRate = totalTime > 0 ? this.totalChecked / totalTime : 0;
    
    // Update history
    if (intervalTime >= 1) { // Update every second
      this.checkHistory.push(currentRate);
      if (this.checkHistory.length > this.maxHistorySize) {
        this.checkHistory.shift();
      }
      this.lastCheckTime = now;
      this.lastCheckedCount = this.totalChecked;
    }
    
    return {
      totalChecked: this.totalChecked,
      totalTime: totalTime,
      averageRate: Math.round(averageRate),
      currentRate: Math.round(currentRate),
      rateHistory: [...this.checkHistory],
      estimatedDaily: Math.round(averageRate * 86400), // 24 * 60 * 60
      estimatedWeekly: Math.round(averageRate * 604800), // 7 * 24 * 60 * 60
      estimatedMonthly: Math.round(averageRate * 2592000), // 30 * 24 * 60 * 60
      estimatedYearly: Math.round(averageRate * 31536000), // 365 * 24 * 60 * 60
      uptime: this.formatTime(totalTime)
    };
  }
  
  /**
   * Format time in human readable format
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  formatTime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${secs}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
  
  /**
   * Format large numbers with appropriate units
   * @param {number} num - Number to format
   * @returns {string} Formatted number string
   */
  formatNumber(num) {
    if (num >= 1e12) {
      return (num / 1e12).toFixed(2) + 'T';
    } else if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + 'K';
    } else {
      return num.toString();
    }
  }
  
  /**
   * Get formatted statistics for display
   * @returns {Object} Formatted statistics
   */
  getFormattedStats() {
    const stats = this.getStats();
    return {
      ...stats,
      totalCheckedFormatted: this.formatNumber(stats.totalChecked),
      averageRateFormatted: this.formatNumber(stats.averageRate) + '/s',
      currentRateFormatted: this.formatNumber(stats.currentRate) + '/s',
      estimatedDailyFormatted: this.formatNumber(stats.estimatedDaily),
      estimatedWeeklyFormatted: this.formatNumber(stats.estimatedWeekly),
      estimatedMonthlyFormatted: this.formatNumber(stats.estimatedMonthly),
      estimatedYearlyFormatted: this.formatNumber(stats.estimatedYearly)
    };
  }
  
  /**
   * Reset statistics
   */
  reset() {
    this.startTime = Date.now();
    this.totalChecked = 0;
    this.lastCheckTime = Date.now();
    this.lastCheckedCount = 0;
    this.checkHistory = [];
  }
}

export default Statistics;