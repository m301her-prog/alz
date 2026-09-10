// طبقة خدمة وسيطة تعمل كـ Mock API بين الواجهة والبيانات
// تحاكي إنشاء الحسابات وتسجيل الدخول باستخدام LocalStorage

import { SEED_USERS } from "./seedData.js";

const USERS_KEY = "chatapp_users";
const CURRENT_USER_KEY = "chatapp_current_user";

// محاكاة تأخير الشبكة
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// التأكد من تهيئة البيانات الأولية
function ensureUsersInitialized() {
  const existing = localStorage.getItem(USERS_KEY);
  if (!existing) {
    localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
  }
}

// جلب جميع المستخدمين
function getAllUsers() {
  ensureUsersInitialized();
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

// حفظ قائمة المستخدمين
function saveAllUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// توليد معرف فريد
function generateId(prefix = "u") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// اختيار لون عشوائي للصورة الرمزية
const AVATAR_COLORS = [
  "#3b82f6",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
];

function pickRandomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

// التحقق من صيادة البريد الإلكتروني
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// إنشاء حساب جديد
export async function signup({ name, email, password }) {
  await delay(600);

  ensureUsersInitialized();
  const users = getAllUsers();

  // التحقق من عدم وجود بريد مكرر
  const existingUser = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (existingUser) {
    throw new Error("هذا البريد الإلكتروني مسجل بالفعل");
  }

  const newUser = {
    id: generateId("u"),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    avatar: name.trim().charAt(0),
    color: pickRandomColor(),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveAllUsers(users);

  // تسجيل الدخول تلقائياً بعد إنشاء الحساب
  const { password: _pwd, ...userWithoutPassword } = newUser;
  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(userWithoutPassword)
  );

  return userWithoutPassword;
}

// تسجيل الدخول
export async function login({ email, password }) {
  await delay(500);

  ensureUsersInitialized();
  const users = getAllUsers();

  const user = users.find(
    (u) =>
      u.email.toLowerCase() === email.trim().toLowerCase() &&
      u.password === password
  );

  if (!user) {
    throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  }

  const { password: _pwd, ...userWithoutPassword } = user;
  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(userWithoutPassword)
  );

  return userWithoutPassword;
}

// تسجيل الخروج
export async function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// جلب المستخدم الحالي
export function getCurrentUser() {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
}
