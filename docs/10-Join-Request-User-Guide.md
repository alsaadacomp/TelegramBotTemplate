# 📝 Join Request User Guide

This guide explains how new users can request access to the bot and how administrators manage these requests.

---

## For New Users (Visitors)

If you are a new user, you will have the `Visitor` role by default, which has no permissions.

### 1. Starting the Bot

- Send the `/start` command to the bot.
- You will receive a welcome message informing you that you don't have permissions.

### 2. Requesting Access

- Click the **"🔐 Request to Join"** button.
- The bot will then guide you through a two-step process:
  1.  **Enter Your Full Name:** Provide your full name in Arabic.
  2.  **Enter Your Phone Number:** Provide your mobile number.

### 3. Confirmation

- The bot will show you the details you entered and ask for confirmation.
- If the details are correct, click **"✅ Confirm & Send"**.
- Your request will be sent to the system administrator for approval.
- You will receive a notification once your request has been reviewed.

---

## For Super Admins

As a `Super Admin`, you are responsible for managing join requests.

### 1. Receiving Notifications

- When a new user submits a join request, you will receive a real-time notification with the user's details.
- This notification will have two buttons: **"✅ Approve"** and **"❌ Reject"**.

### 2. Managing Requests via Command

- You can view all pending requests at any time by sending the `/requests` command.
- The bot will display a list of all pending requests, each with its own `Approve` and `Reject` buttons.

### 3. Approving a Request

- When you click **"✅ Approve"**:
  - The user's role will be automatically promoted from `Visitor` to `Admin`.
  - The user will receive a notification informing them that their request was approved.
  - They will now have access to all the bot's features for admins.

### 4. Rejecting a Request

- When you click **"❌ Reject"**:
  - The request will be marked as `rejected` in the system.
  - The user will be notified that their request was not approved.
  - They will have to wait 24 hours before they can submit a new request.
