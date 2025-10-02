/**
 * Message Service
 * A simple and scalable service for retrieving and formatting message templates.
 * 
 * @module services/message.service
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger.util');

class MessageService {
  constructor() {
    this.messages = {};
    this.loadMessages();
  }

  /**
   * Loads message templates from a JSON file.
   */
  loadMessages() {
    try {
      const messagesPath = path.join(__dirname, '../../templates/messages.json');
      this.messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
      logger.info('Message templates loaded successfully.', 'MessageService');
    } catch (error) {
      logger.error('Failed to load messages.json:', 'MessageService', error);
      this.messages = { error: { generic: 'An unexpected error occurred.' } };
    }
  }

  /**
   * Retrieves and formats a message template.
   * @param {string} key - The key of the message template (e.g., 'welcome.visitor').
   * @param {object} [variables={}] - An object of variables to replace in the template.
   * @returns {string} The formatted message.
   */
  get(key, variables = {}) {
    const template = this.getTemplate(key);
    if (!template) {
      logger.warn(`Message template not found for key: ${key}`, 'MessageService');
      return this.getTemplate('error.generic') || 'An error occurred.';
    }
    return this.replaceVariables(template, variables);
  }

  /**
   * Navigates the messages object to find a template by its key.
   * @param {string} key - The dot-separated key.
   * @returns {string|null} The message template or null if not found.
   */
  getTemplate(key) {
    return key.split('.').reduce((obj, k) => (obj && obj[k] !== 'undefined') ? obj[k] : null, this.messages);
  }

  /**
   * Replaces placeholders in a string with provided values.
   * @param {string} template - The string containing {placeholders}.
   * @param {object} variables - The key-value pairs for replacement.
   * @returns {string} The formatted string.
   */
  replaceVariables(template, variables) {
    if (typeof template !== 'string') return '';

    // Add any global variables you might want
    const allVariables = {
      botName: this.messages.botName || 'Bot',
      ...variables,
    };

    return template.replace(/\{(\w+)\}/g, (placeholder, key) => {
      return allVariables.hasOwnProperty(key) ? allVariables[key] : placeholder;
    });
  }
}

// Export a singleton instance
const instance = new MessageService();
module.exports = instance;