/**
 * Approve Requests Handler
 * Manages the approval and rejection of join requests by the super admin.
 * 
 * @module handlers/approve-requests.handler
 */

const logger = require('../utils/logger.util');
const permissionService = require('../services/permission.service');
const messageService = require('../services/message.service');
const { ROLES } = require('../../config/permissions.config');

class ApproveRequestsHandler {

  /**
   * Handles the /requests command to display pending join requests.
   * @param {object} ctx - Telegraf context.
   */
  async handleRequestsCommand(ctx) {
    if (ctx.user.role !== ROLES.SUPER_ADMIN) {
      await ctx.reply(messageService.get('error.permissionDenied'));
      return;
    }

    try {
      const pendingRequests = await permissionService.getPendingRequests();

      if (!pendingRequests || pendingRequests.length === 0) {
        await ctx.reply(messageService.get('requests.nonePending'));
        return;
      }

      await ctx.reply(messageService.get('requests.listTitle', { count: pendingRequests.length }));

      for (const request of pendingRequests) {
        const message = messageService.get('requests.requestEntry', request);
        const keyboard = {
          inline_keyboard: [
            [
              { text: '✅ Approve', callback_data: `request:approve:${request.id}` },
              { text: '❌ Reject', callback_data: `request:reject:${request.id}` },
            ],
          ],
        };
        await ctx.reply(message, { reply_markup: keyboard, parse_mode: 'Markdown' });
      }
    } catch (error) {
      logger.error('Error handling /requests command:', 'ApproveRequests', error);
      await ctx.reply(messageService.get('error.generic'));
    }
  }

  /**
   * Handles the callback queries for approving or rejecting requests.
   * @param {object} ctx - Telegraf context.
   */
  async handleCallback(ctx) {
    if (ctx.user.role !== ROLES.SUPER_ADMIN) {
      await ctx.answerCbQuery('Permission Denied!', { show_alert: true });
      return;
    }

    const [_, action, requestIdStr] = ctx.callbackQuery.data.split(':');
    const requestId = parseInt(requestIdStr, 10);
    const adminId = ctx.from.id;

    await ctx.answerCbQuery();

    try {
      if (action === 'approve') {
        await this.approve(ctx, requestId, adminId);
      } else if (action === 'reject') {
        // For simplicity, we are not asking for a reason in this version.
        // This can be added later by creating a conversation workflow.
        await this.reject(ctx, requestId, adminId, 'Not specified');
      }
    } catch (error) {
      logger.error(`Failed to process request ${requestId}:`, 'ApproveRequests', error);
      await ctx.reply(`An error occurred while processing request ${requestId}.`);
    }
  }

  async approve(ctx, requestId, adminId) {
    const request = await permissionService.approveRequest(requestId, adminId);
    
    // Update the original message to show it's been handled
    await ctx.editMessageText(
      ctx.callbackQuery.message.text + `\n\n--- \n*✅ Approved by ${ctx.from.first_name}*`,
      { parse_mode: 'Markdown' }
    );

    // Notify the user
    await ctx.telegram.sendMessage(
      request.telegram_id,
      messageService.get('joinRequest.approved', { firstName: request.first_name })
    );

    logger.info(`Request ${requestId} approved by ${adminId}.`, 'ApproveRequests');
  }

  async reject(ctx, requestId, adminId, reason) {
    const request = await permissionService.rejectRequest(requestId, adminId, reason);

    // Update the original message
    await ctx.editMessageText(
      ctx.callbackQuery.message.text + `\n\n--- \n*❌ Rejected by ${ctx.from.first_name}*`,
      { parse_mode: 'Markdown' }
    );

    // Notify the user
    await ctx.telegram.sendMessage(
      request.telegram_id,
      messageService.get('joinRequest.rejected', { firstName: request.first_name, reason })
    );

    logger.info(`Request ${requestId} rejected by ${adminId}.`, 'ApproveRequests');
  }
}

module.exports = new ApproveRequestsHandler();
