import pool from './lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomId, userId } = req.query;

  if (!roomId || !userId) {
    return res.status(400).json({ error: 'Missing roomId or userId' });
  }

  try {
    // 1. التحقق الذكي: هل الـ roomId مصمم كدردشة خاصة (يحتوي على معرفين مفصولين بـ _private_chat_)؟
    if (roomId.includes('_private_chat_')) {
      const parts = roomId.split('_private_chat_');
      
      // التأكد أن المعرفين الموجودين في اسم الغرفة هما اللذان يطلبان المحادثة
      if (!parts.includes(userId)) {
        return res.status(403).json({ error: 'Access denied: You are not part of this private chat' });
      }
    } else {
      // إذا لم تكن غرفة خاصة بالطريقة الثنائية، نتحقق من جدول الـ rooms العادي مع استخدام Type Cast لتجنب تعارض الأنواع
      const membershipCheck = await pool.query(
        `SELECT rm.user_id FROM room_members rm WHERE rm.room_id::text = $1::text AND rm.user_id::text = $2::text`,
        [roomId, userId]
      );
      if (membershipCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // 2. إذا اجتاز التحقق بنجاح، يتم جلب الرسائل مع استخدام ::text للمقارنة والربط لمنع أخطاء الـ uuid
    const messages = await pool.query(
      `SELECT m.id, m.text, m.created_at, u.id as user_id, u.name as user_name, u.avatar, u.color
       FROM messages m
       JOIN users u ON m.user_id::text = u.id::text
       WHERE m.room_id::text = $1::text
       ORDER BY m.created_at ASC`,
      [roomId]
    );

    return res.status(200).json(messages.rows);
  } catch (error) {
    console.error("Error fetching private messages:", error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
