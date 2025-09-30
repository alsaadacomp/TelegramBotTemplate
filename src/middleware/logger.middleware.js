/**
 * Logger Middleware
 * 
 * Purpose:
 * - Automatically log all incoming messages and commands
 * - Track user activity
 * - Measure response time
 * - Log errors that occur during message processing
 * 
 * Features:
 * - Logs in English for developers
 * - Tracks user ID, username, command
 * - Measures execution time
 * - Logs both successful and failed requests
 * 
 * @module logger.middleware
 */

const Logger = require('../utils/logger.util');

/**
 * Logger Middleware
 * Logs all incoming messages and commands
 */
async function loggerMiddleware(ctx, next) {
  const startTime = Date.now();
  
  // Extract user information
  const userId = ctx.from?.id;
  const username = ctx.from?.username || 'N/A';
  const firstName = ctx.from?.first_name || '';
  const lastName = ctx.from?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  
  // Extract message information
  const messageType = ctx.updateType;
  let messageContent = '';
  
  if (ctx.message?.text) {
    messageContent = ctx.message.text;
  } else if (ctx.callbackQuery?.data) {
    messageContent = `[Callback] ${ctx.callbackQuery.data}`;
  } else if (ctx.message?.photo) {
    messageContent = '[Photo]';
  } else if (ctx.message?.document) {
    messageContent = '[Document]';
  } else if (ctx.message?.voice) {
    messageContent = '[Voice]';
  } else if (ctx.message?.location) {
    messageContent = '[Location]';
  } else {
    messageContent = `[${messageType}]`;
  }
  
  // Log incoming message
  Logger.userAction(
    userId,
    'message_received',
    `Received message from user`,
    {
      username,
      fullName,
      messageType,
      content: messageContent.substring(0, 100) // Limit to 100 chars
    }
  );
  
  try {
    // Continue to next middleware
    await next();
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Log successful processing
    Logger.userAction(
      userId,
      'message_processed',
      `Message processed successfully`,
      {
        username,
        responseTime: `${responseTime}ms`
      }
    );
    
  } catch (error) {
    // Calculate response time even on error
    const responseTime = Date.now() - startTime;
    
    // Log error
    Logger.error(`Error processing message from user ${userId}`, {
      userId,
      username,
      error: error.message,
      stack: error.stack,
      messageContent: messageContent.substring(0, 100),
      responseTime: `${responseTime}ms`
    });
    
    // Re-throw error to be handled by error middleware
    throw error;
  }
}

/**
 * Command Logger Middleware
 * Specifically logs command execution
 */
function commandLoggerMiddleware(commandName) {
  return async (ctx, next) => {
    const userId = ctx.from?.id;
    const username = ctx.from?.username || 'N/A';
    
    // Log command execution
    Logger.command(userId, commandName, {
      username,
      fullCommand: ctx.message?.text
    });
    
    // Continue to next middleware
    await next();
  };
}

/**
 * Access Logger
 * Logs successful user access to specific resources/sections
 */
function accessLogger(resourceType, resourceId) {
  return async (ctx, next) => {
    const userId = ctx.from?.id;
    const username = ctx.from?.username || 'N/A';
    
    Logger.userAction(
      userId,
      `access_${resourceType}`,
      `User accessed ${resourceType}: ${resourceId}`,
      {
        username,
        resourceType,
        resourceId
      }
    );
    
    await next();
  };
}

module.exports = {
  loggerMiddleware,
  commandLoggerMiddleware,
  accessLogger
};
