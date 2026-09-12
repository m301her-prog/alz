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
