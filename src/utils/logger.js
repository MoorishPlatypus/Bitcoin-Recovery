/**
 * Enhanced logging utility with multiple levels and file output
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

class Logger {
  constructor(config = {}) {
    this.logLevel = config.logLevel || 'info';
    this.enableLogging = config.enableLogging !== false;
    this.logFile = config.logFile;
    
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    this.colors = {
      debug: chalk.gray,
      info: chalk.blue,
      warn: chalk.yellow,
      error: chalk.red,
      success: chalk.green
    };
    
    // Ensure log directory exists
    if (this.logFile) {
      const logDir = path.dirname(this.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }
  
  shouldLog(level) {
    return this.enableLogging && this.levels[level] >= this.levels[this.logLevel];
  }
  
  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    const fullMessage = data ? `${message} ${JSON.stringify(data)}` : message;
    return `${prefix} ${fullMessage}`;
  }
  
  log(level, message, data = null) {
    if (!this.shouldLog(level)) return;
    
    const formattedMessage = this.formatMessage(level, message, data);
    const coloredMessage = this.colors[level] ? this.colors[level](formattedMessage) : formattedMessage;
    
    console.log(coloredMessage);
    
    // Write to file if configured
    if (this.logFile) {
      fs.appendFileSync(this.logFile, formattedMessage + '\n');
    }
  }
  
  debug(message, data) {
    this.log('debug', message, data);
  }
  
  info(message, data) {
    this.log('info', message, data);
  }
  
  warn(message, data) {
    this.log('warn', message, data);
  }
  
  error(message, data) {
    this.log('error', message, data);
  }
  
  success(message, data) {
    const formattedMessage = this.formatMessage('info', message, data);
    const coloredMessage = this.colors.success(formattedMessage);
    console.log(coloredMessage);
    
    if (this.logFile) {
      fs.appendFileSync(this.logFile, formattedMessage + '\n');
    }
  }
}

export default Logger;