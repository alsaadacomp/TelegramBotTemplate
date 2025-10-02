/**
 * Join Request Handler
 * Manages the multi-step workflow for new users to request access.
 * 
 * @module handlers/join-request.handler
 */

const logger = require('../utils/logger.util');
const permissionService = require('../services/permission.service');
const dbService = require('../services/database.service');
const messageService = require('../services/message.service');
const botConfig = require('../../config/bot.config');
const { validateFullName, validatePhone, normalizePhone } = require('../utils/validators.util');

class JoinRequestHandler {

  /**
   * Starts the join request workflow.
   * @param {object} ctx - Telegraf context.
   */
  async startWorkflow(ctx) {
    try {
      const userId = ctx.from.id;
      logger.info(`User ${userId} initiated join request workflow.`, 'JoinRequest');

      const existingRequest = await dbService.getJoinRequestByTelegramId(userId);
      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          await ctx.reply(messageService.get('joinRequest.alreadyPending'));
          return;
        }
        if (existingRequest.status === 'rejected') {
          const hoursSinceRejection = (Date.now() - new Date(existingRequest.reviewed_at).getTime()) / 3600000;
          if (hoursSinceRejection < 24) {
            await ctx.reply(messageService.get('joinRequest.rejectedTooSoon', { hours: Math.ceil(24 - hoursSinceRejection) }));
            return;
          }
        }
      }

      // Initialize conversation state for the workflow
      await dbService.setConversationState(userId, {
        workflow_id: 'join_request',
        current_step: 'ask_full_name',
        data: {
          telegram_id: userId,
          username: ctx.from.username,
          first_name: ctx.from.first_name,
          last_name: ctx.from.last_name,
        },
      });

      await ctx.reply(messageService.get('joinRequest.askFullName'), { reply_markup: { force_reply: true } });
    } catch (error) {
      logger.error('Error starting join request workflow:', 'JoinRequest', error);
      await ctx.reply(messageService.get('error.generic'));
    }
  }

  /**
   * Handles incoming text messages during the workflow.
   * @param {object} ctx - Telegraf context.
   * @param {object} state - The user's current conversation state.
   */
  async handleStep(ctx, state) {
    const text = ctx.message.text.trim();

    try {
      switch (state.current_step) {
        case 'ask_full_name':
          await this.processFullName(ctx, state, text);
          break;
        case 'ask_phone':
          await this.processPhone(ctx, state, text);
          break;
        default:
          // If the user is in a weird state, just end it.
          await dbService.deleteConversationState(ctx.from.id);
          break;
      }
    } catch (error) {
      logger.error(`Error handling step ${state.current_step}:`, 'JoinRequest', error);
      await ctx.reply(messageService.get('error.generic'));
    }
  }

  async processFullName(ctx, state, fullName) {
    if (!validateFullName(fullName)) {
      await ctx.reply(messageService.get('validation.invalidFullName'));
      return;
    }
    state.data.full_name = fullName;
    state.current_step = 'ask_phone';
    await dbService.setConversationState(ctx.from.id, state);
    await ctx.reply(messageService.get('joinRequest.askPhone'), { reply_markup: { force_reply: true } });
  }

  async processPhone(ctx, state, phone) {
    const normalizedPhone = normalizePhone(phone);
    if (!validatePhone(normalizedPhone)) {
      await ctx.reply(messageService.get('validation.invalidPhone'));
      return;
    }
    state.data.phone = normalizedPhone;
    state.current_step = 'confirm_details';
    await dbService.setConversationState(ctx.from.id, state);

    const message = messageService.get('joinRequest.confirmDetails', state.data);
    const keyboard = {
      inline_keyboard: [
        [
          { text: messageService.get('button.confirm'), callback_data: 'workflow:join_request:confirm' },
          { text: messageService.get('button.cancel'), callback_data: 'workflow:join_request:cancel' },
        ],
      ],
    };
    await ctx.reply(message, { reply_markup: keyboard, parse_mode: 'Markdown' });
  }

  /**
   * Handles callback queries for confirming or canceling the request.
   * @param {object} ctx - Telegraf context.
   */
  async handleCallback(ctx) {
    const action = ctx.callbackQuery.data.split(':')[2];
    await ctx.answerCbQuery();

    if (action === 'confirm') {
      await this.submitRequest(ctx);
    } else if (action === 'cancel') {
      await this.cancelRequest(ctx);
    }
  }

  async submitRequest(ctx) {
    const state = await dbService.getConversationState(ctx.from.id);
    if (!state || state.current_step !== 'confirm_details') return;

    try {
      const request = await permissionService.createJoinRequest(state.data);
      await dbService.deleteConversationState(ctx.from.id);

      await ctx.editMessageText(messageService.get('joinRequest.submitted'));
      logger.info(`Join request ${request.id} submitted for user ${ctx.from.id}.`, 'JoinRequest');

      await this.notifySuperAdmin(ctx, request);
    } catch (error) {
      logger.error('Failed to submit join request:', 'JoinRequest', error);
      await ctx.editMessageText(messageService.get('error.generic'));
    }
  }

  async cancelRequest(ctx) {
    await dbService.deleteConversationState(ctx.from.id);
    await ctx.editMessageText(messageService.get('joinRequest.cancelled'));
    logger.info(`Join request cancelled by user ${ctx.from.id}.`, 'JoinRequest');
  }

  /**
   * Notifies the super admin about a new join request.
   * @param {object} ctx - Telegraf context.
   * @param {object} request - The join request object.
   */
  async notifySuperAdmin(ctx, request) {
    if (!botConfig.admins.superAdminId) {
      logger.warn('SUPER_ADMIN_ID is not configured. Cannot send notification.', 'JoinRequest');
      return;
    }

    const message = messageService.get('notification.newJoinRequest', request);
    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ Approve', callback_data: `request:approve:${request.id}` },
          { text: '❌ Reject', callback_data: `request:reject:${request.id}` },
        ],
      ],
    };

    try {
      await ctx.telegram.sendMessage(botConfig.admins.superAdminId, message, { reply_markup: keyboard, parse_mode: 'Markdown' });
      logger.info(`Sent join request notification to super admin for request ${request.id}.`, 'JoinRequest');
    } catch (error) {
      logger.error(`Failed to send notification to super admin:`, 'JoinRequest', error);
    }
  }
}

module.exports = new JoinRequestHandler();