// رابط السيرفر الأساسي على Vercel
const API_BASE_URL = "https://alz-taupe.vercel.app/api";

/**
 * التحقق من صحة البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني المراد التحقق منه
 * @returns {boolean} - صحيح أو خطأ
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * إنشاء حساب جديد للمستخدم
 * @param {Object} userData - بيانات المستخدم (name, email, password, avatar, color)
 * @returns {Promise<Object>} - بيانات المستخدم المنشأ
 */
export async function signup(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "فشل في إنشاء الحساب");
    }

    return data;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
}

/**
 * تسجيل دخول المستخدم
 * @param {string} email - البريد الإلكتروني
 * @param {string} password - كلمة المرور
 * @returns {Promise<Object>} - بيانات المستخدم المسجل
 */
export async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "فشل في تسجيل الدخول");
    }

    return data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

/**
 * الحصول على المستخدم الحالي المخزن في الذاكرة المحلية (localStorage)
 * @returns {Object|null} - بيانات المستخدم أو null إذا لم يكن مسجلاً
 */
export function getCurrentUser() {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * تسجيل الخروج وحذف بيانات المستخدم من الذاكرة المحلية
 */
export function logout() {
  try {
    localStorage.removeItem("user");
  } catch (error) {
    console.error("Error logging out:", error);
  }
}

/**
 * جلب الرسائل الخاصة بغرفة معينة مع التحقق من عضوية المستخدم
 * @param {string} roomId - معرف الغرفة
 * @param {string} userId - معرف المستخدم الحالي
 * @returns {Promise<Array>} - قائمة الرسائل
 */
export async function getRoomMessages(roomId, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/messages?roomId=${roomId}&userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "فشل في جلب الرسائل");
    }

    return data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
}

/**
 * إرسال رسالة جديدة إلى غرفة خاصة (يشترط أن يكون المستخدم عضواً فيها)
 * @param {string} roomId - معرف الغرفة
 * @param {string} userId - معرف المستخدم المرسل
 * @param {string} text - نص الرسالة
 * @returns {Promise<Object>} - الرسالة التي تم حفظها
 */
export async function sendMessage(roomId, userId, text) {
  try {
    const response = await fetch(`${API_BASE_URL}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomId,
        userId,
        text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "فشل في إرسال الرسالة");
    }

    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

/**
 * حذف رسالة (بشرط أن يكون المستخدم هو صاحب الرسالة)
 * @param {string} messageId - معرف الرسالة المراد حذفها
 * @param {string} userId - معرف المستخدم صاحب الطلب
 * @returns {Promise<Object>} - تأكيد النجاح
 */
export async function deleteMessage(messageId, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/delete-message`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messageId,
        userId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "فشل في حذف الرسالة");
    }

    return data;
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
}
