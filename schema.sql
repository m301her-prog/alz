-- ===================================================
-- مخطط قاعدة بيانات تطبيق الدردشة (نسخة المعرف النصي للغرف الخاصة)
-- ===================================================

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  avatar      VARCHAR(10)  NOT NULL DEFAULT '',
  color       VARCHAR(7)   NOT NULL DEFAULT '#3b82f6',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- جدول الغرف (تم تحويل الـ id إلى VARCHAR ليقبل المعرفات النصية الخاصة مثل user1_private_chat_user2)
CREATE TABLE rooms (
  id          VARCHAR(255) PRIMARY KEY, -- لم يعد UUID، أصبح نصاً ليدعم الدمج البرمجي
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  icon        VARCHAR(50)  NOT NULL DEFAULT 'MessageCircle',
  color       VARCHAR(7)   NOT NULL DEFAULT '#3b82f6',
  is_private  BOOLEAN      NOT NULL DEFAULT FALSE, 
  password    VARCHAR(255) DEFAULT NULL,            
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- جدول عضوية الغرف
CREATE TABLE room_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     VARCHAR(255) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE, -- مُعدل ليطابق نوع الـ id في جدول rooms
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX idx_room_members_room_id ON room_members(room_id);
CREATE INDEX idx_room_members_user_id ON room_members(user_id);

-- جدول الرسائل
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     VARCHAR(255) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE, -- مُعدل ليطابق نوع الـ id في جدول rooms
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_room_time ON messages(room_id, created_at DESC);
