-- ===================================================
-- مخطط قاعدة بيانات تطبيق الدردشة (نسخة الغرف الخاصة)
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

-- جدول الغرف (تم إضافة دعم الخصوصية)
CREATE TABLE rooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  icon        VARCHAR(50)  NOT NULL DEFAULT 'MessageCircle',
  color       VARCHAR(7)   NOT NULL DEFAULT '#3b82f6',
  is_private  BOOLEAN      NOT NULL DEFAULT FALSE, -- تحديد ما إذا كانت الغرفة خاصة
  password    VARCHAR(255) DEFAULT NULL,            -- كلمة مرور الغرفة الخاصة (اختياري)
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- جدول عضوية الغرف (مهم جداً للغرف الخاصة للتحقق من المسموح لهم بالدخول)
CREATE TABLE room_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX idx_room_members_room_id ON room_members(room_id);
CREATE INDEX idx_room_members_user_id ON room_members(user_id);

-- جدول الرسائل
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_room_time ON messages(room_id, created_at DESC);
