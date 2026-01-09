-- Create user settings table for notification preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  notifications_enabled BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT false,
  sms_notifications BOOLEAN DEFAULT false,
  notification_time TIME DEFAULT '05:00:00',
  email VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
