-- Migration: Add join_requests table
-- Created: 2025-10-02
-- Purpose: Store user join requests for approval by super_admin

CREATE TABLE IF NOT EXISTS join_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_id INTEGER NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending',
  reviewed_by INTEGER,
  reviewed_at DATETIME,
  rejection_reason TEXT,
  metadata TEXT
);

CREATE INDEX IF NOT EXISTS idx_join_requests_telegram_id ON join_requests(telegram_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_status ON join_requests(status);
CREATE INDEX IF NOT EXISTS idx_join_requests_requested_at ON join_requests(requested_at DESC);

-- Update users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS join_request_id INTEGER REFERENCES join_requests(id);

-- Update existing roles
UPDATE users SET role = 'admin' WHERE role IN ('manager', 'moderator', 'user');
