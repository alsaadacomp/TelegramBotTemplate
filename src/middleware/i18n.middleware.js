/**
 * ===================================
 * i18n Middleware
 * ===================================
 * Middleware for internationalization and localization.
 * - Normalizes Arabic numerals in incoming messages to English numerals.
 * - Attaches number formatting helpers to the context.
 *
 * @module middleware/i1n8
 */

const { toEnglish, toArabic } = require('../utils/arabic-numbers.util');

/**
 * i18n Middleware for Telegraf.
 *
 * @param {object} ctx - The Telegraf context object.
 * @param {Function} next - The next middleware function.
 */
async function i18nMiddleware(ctx, next) {
  // 1. Attach helper functions to the context
  ctx.toArabic = toArabic;
  ctx.toEnglish = toEnglish;

  // 2. Normalize numbers in incoming text messages
  if (ctx.message && ctx.message.text) {
    ctx.message.text = toEnglish(ctx.message.text);
  }
  
  // 3. Normalize numbers in callback queries
  if (ctx.callbackQuery && ctx.callbackQuery.data) {
    // Be careful not to normalize callback data that might be sensitive
    // to character changes. A common pattern is `command:value`.
    const parts = ctx.callbackQuery.data.split(':');
    if (parts.length > 1) {
        const value = parts.slice(1).join(':');
        const normalizedValue = toEnglish(value);
        ctx.callbackQuery.data = `${parts[0]}:${normalizedValue}`;
    } else {
        ctx.callbackQuery.data = toEnglish(ctx.callbackQuery.data);
    }
  }

  // Proceed to the next middleware
  await next();
}

module.exports = {
  i18nMiddleware,
};
