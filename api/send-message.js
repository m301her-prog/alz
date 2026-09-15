import pool from './lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomId, userId, text } = req.body;

  // تسجيل البيانات الواردة لمعرفة أي حقل يتسبب في خطأ 400 إن وجد
  console.log("Received send-message request body:", { roomId, userId, text });

  if (!roomId || !userId || !text) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      details: {
        roomId: !roomId ? 'Missing roomId' : 'OK',
        userId: !userId ? 'Missing userId' : 'OK',
        text: !text ? 'Missing text' : 'OK'
      }
    });
  }

  try {
    // 1. التحقق الذكي من الصلاحية والخصوصية قبل السماح بإرسال الرسالة
    if (roomId.includes('_private_chat_')) {
      const parts = roomId.split('_private_chat_');
      
      // التأكد أن المستخدم الذي يحاول الإرسال هو أحد طرفي المحادثة الخاصة فقط
      if (!parts.includes(userId)) {
        return res.status(403).json({ error: 'Access denied: You are not part of this private chat' });
      }

      // التأكد من وجود الغرفة في جدول rooms حتى لا يحدث خطأ Foreign Key عند إدخال الرسالة
      const roomCheck = await pool.query(`SELECT id FROM rooms WHERE id = $1`, [roomId]);
      if (roomCheck.rows.length === 0) {
        // إنشاء الغرفة الخاصة تلقائياً إذا لم تكن مسجلة في جدول rooms
        await pool.query(
          `INSERT INTO rooms (id, name, is_private) VALUES ($1, $2, true) ON CONFLICT (id) DO NOTHING`,
          [roomId, 'Private Chat']
        );
      }
    } else {
      // إذا لم تكن غرفة خاصة ثنائية، نتحقق من جدول الأعضاء العادي
      const memberCheck = await pool.query(
        `SELECT 1 FROM room_members WHERE room_id = $1 AND user_id = $2`,
        [roomId, userId]
      );

      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ error: 'You must be a member of this room to send messages' });
      }
    }

    // 2. إدخال الرسالة بأمان تام بعد اجتياز التحقق
    const newMessage = await pool.query(
      `INSERT INTO messages (room_id, user_id, text) 
       VALUES ($1, $2, $3) 
       RETURNING id, room_id, user_id, text, created_at`,
      [roomId, userId, text]
    );

    return res.status(201).json(newMessage.rows[0]);
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
