-- ===================================================================
-- مخطط قاعدة بيانات تطبيق الدردشة
-- Database Schema for Chat Application
-- يعمل على PostgreSQL أو أي SQL قياسي
-- ===================================================================

-- =====================
-- جدول المستخدمين (Users)
-- =====================
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

-- فهرس للبحث السريع بالبريد الإلكتروني
CREATE INDEX idx_users_email ON users(email);

-- =====================
-- جدول الغرف (Rooms)
-- =====================
CREATE TABLE rooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  icon        VARCHAR(50)  NOT NULL DEFAULT 'MessageCircle',
  color       VARCHAR(7)   NOT NULL DEFAULT '#3b82f6',
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =====================
-- جدول الرسائل (Messages)
-- =====================
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- فهارس لتحسين أداء استعلامات الرسائل
CREATE INDEX idx_messages_room_id    ON messages(room_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_user_id    ON messages(user_id);

-- فهرس مركب لجلب رسائل غرفة معينة مرتبة زمنياً بكفاءة
CREATE INDEX idx_messages_room_time  ON messages(room_id, created_at DESC);

-- =====================
-- جدول عضوية المستخدمين في الغرف (Room Members)
-- =====================
CREATE TABLE room_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX idx_room_members_room_id ON room_members(room_id);
CREATE INDEX idx_room_members_user_id ON room_members(user_id);

-- =====================
-- دالة لتحديث حقل updated_at تلقائياً
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
