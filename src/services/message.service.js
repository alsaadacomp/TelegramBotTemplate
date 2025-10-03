/**
 * Message Service
 * A simple and scalable service for retrieving and formatting message templates.
 * 
 * @module services/message.service
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger.util');
const cacheService = require('./cache.service');

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

  /**
   * Send a message to Telegram context and cache conversation state
   * @param {Object} ctx - Telegram context
   * @param {string} message - Message to send
   * @param {Object} [options] - Additional options like keyboard
   * @returns {Promise} Promise that resolves when message is sent
   */
  async sendMessage(ctx, message, options = {}) {
    try {
      await ctx.reply(message, options);
      
      // Cache conversation state if user exists
      if (ctx.from && ctx.from.id) {
        cacheService.cacheConversation(ctx.from.id, {
          userId: ctx.from.id,
          lastMessage: message,
          timestamp: Date.now()
        });
      }
      
      logger.info('Message sent successfully', 'MessageService');
    } catch (error) {
      logger.error('Failed to send message', 'MessageService', error);
      throw error;
    }
  }

  /**
   * Update conversation state for a user
   * @param {number} userId - User ID
   * @param {string} workflow - Workflow name
   * @param {string} step - Current step
   * @param {Object} [data] - Additional data
   * @returns {Promise} Promise that resolves when state is updated
   */
  async updateConversationState(userId, workflow, step, data = {}) {
    try {
      const state = {
        userId,
        workflow,
        step,
        data,
        timestamp: Date.now()
      };
      
      cacheService.cacheConversation(userId, state);
      logger.info('Conversation state updated', 'MessageService', { userId, workflow, step });
    } catch (error) {
      logger.error('Failed to update conversation state', 'MessageService', error);
      throw error;
    }
  }

  /**
   * Clear conversation state for a user
   * @param {number} userId - User ID
   * @returns {Promise} Promise that resolves when state is cleared
   */
  async clearConversationState(userId) {
    try {
      cacheService.deleteConversation(userId);
      logger.info('Conversation state cleared', 'MessageService', { userId });
    } catch (error) {
      logger.error('Failed to clear conversation state', 'MessageService', error);
      throw error;
    }
  }

  /**
   * Send a formatted message with variable replacement
   * @param {Object} ctx - Telegram context
   * @param {string} message - Message template with variables
   * @param {Object} variables - Variables to replace in message
   * @param {Object} [options] - Additional options
   * @returns {Promise} Promise that resolves when message is sent
   */
  async sendFormattedMessage(ctx, message, variables = {}, options = {}) {
    try {
      // Replace {{variable}} patterns with variables
      let formattedMessage = message;
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        formattedMessage = formattedMessage.replace(regex, variables[key]);
      });

      await this.sendMessage(ctx, formattedMessage, options);
    } catch (error) {
      logger.error('Failed to send formatted message', 'MessageService', error);
      throw error;
    }
  }
}

// Export a singleton instance
const instance = new MessageService();
module.exports = instance;