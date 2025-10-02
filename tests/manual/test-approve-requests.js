/**
 * Manual Test for Approving/Rejecting Join Requests
 */

const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

// This test requires you to be logged in as the SUPER_ADMIN.

console.log('Starting request approval manual test...');

// Pre-requisite: A user must have submitted a join request.

// 1. As the super admin, send the /requests command.
//    Expected: See a list of all pending join requests with 'Approve' and 'Reject' buttons.

// 2. Click the 'Approve' button for one of the requests.
//    Expected: The original message is updated to show 'Approved'.
//    Expected: The user who made the request receives a notification that they have been approved.

// 3. The approved user sends /start again.
//    Expected: They see the admin welcome message and the main keyboard.

// 4. As the super admin, send /requests again.
//    Expected: The approved request is no longer in the list.

// 5. Click the 'Reject' button for another request.
//    Expected: The original message is updated to show 'Rejected'.
//    Expected: The user who made the request receives a rejection notification.

console.log('Test finished. Check the bot, super admin, and user accounts for results.');
