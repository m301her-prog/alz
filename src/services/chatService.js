// طبقة خدمة وسيطة تعمل كـ Mock API بين الواجهة والبيانات
// تحاكي جلب الغرف والرسائل وإرسالها باستخدام LocalStorage

import { SEED_ROOMS, SEED_MESSAGES } from "./seedData.js";

const ROOMS_KEY = "chatapp_rooms";
const MESSAGES_KEY = "chatapp_messages";

// محاكاة تأخير الشبكة
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// التأكد من تهيئة البيانات الأولية
function ensureRoomsInitialized() {
  const existing = localStorage.getItem(ROOMS_KEY);
  if (!existing) {
    localStorage.setItem(ROOMS_KEY, JSON.stringify(SEED_ROOMS));
  }
}

function ensureMessagesInitialized() {
  const existing = localStorage.getItem(MESSAGES_KEY);
  if (!existing) {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(SEED_MESSAGES));
  }
}

// جلب جميع الغرف
export async function getRooms() {
  await delay(400);
  ensureRoomsInitialized();
  const data = localStorage.getItem(ROOMS_KEY);
  return data ? JSON.parse(data) : [];
}

// جلب رسائل غرفة معينة
export async function getMessages(roomId) {
  await delay(300);
  ensureMessagesInitialized();
  const data = localStorage.getItem(MESSAGES_KEY);
  const allMessages = data ? JSON.parse(data) : [];
  return allMessages
    .filter((m) => m.roomId === roomId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

// توليد معرف فريد
function generateMessageId() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// إرسال رسالة جديدة
export async function sendMessage(roomId, user, text) {
  await delay(200);
  ensureMessagesInitialized();
  const data = localStorage.getItem(MESSAGES_KEY);
  const allMessages = data ? JSON.parse(data) : [];

  const newMessage = {
    id: generateMessageId(),
    roomId,
    userId: user.id,
    userName: user.name,
    avatar: user.avatar,
    color: user.color,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  allMessages.push(newMessage);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages));

  return newMessage;
}
