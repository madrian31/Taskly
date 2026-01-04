/**
 * Error Handler Service
 * Centralized error handling and logging
 */

class ErrorHandler {
  /**
   * Log error to console and optionally show to user
   */
  static handle(error, context = '', showToUser = true) {
    console.error(`❌ [${context}] Error:`, error);

    if (showToUser && error.message) {
      this.displayError(error.message, context);
    }

    // In production, you could send errors to a logging service
    // this.sendToLoggingService(error, context);
  }

  /**
   * Display error to user
   */
  static displayError(message, title = 'Error') {
    const ModalService = require('./ModalService.js').default;
    ModalService.showError(message, title);
  }

  /**
   * Log info message
   */
  static info(message, context = '') {
    console.log(`ℹ️ [${context}] ${message}`);
  }

  /**
   * Log success message
   */
  static success(message, context = '') {
    console.log(`✅ [${context}] ${message}`);
  }

  /**
   * Log warning message
   */
  static warn(message, context = '') {
    console.warn(`⚠️ [${context}] ${message}`);
  }

  /**
   * Log debug message (only in development)
   */
  static debug(message, context = '') {
    if (this.isDevelopment()) {
      console.debug(`🔧 [${context}] ${message}`);
    }
  }

  /**
   * Check if running in development mode
   */
  static isDevelopment() {
    return !window.location.hostname.includes('prod');
  }

  /**
   * Create custom error
   */
  static createError(message, code = 'UNKNOWN_ERROR') {
    const error = new Error(message);
    error.code = code;
    return error;
  }
}

export default ErrorHandler;
