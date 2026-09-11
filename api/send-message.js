import pool from '../../src/lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomId, userId, text } = req.body;

  if (!roomId || !userId || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // التحقق من العضوية في الغرفة الخاصة قبل السماح بالإرسال
    const memberCheck = await pool.query(
      `SELECT 1 FROM room_members WHERE room_id = $1 AND user_id = $2`,
      [roomId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You must be a member of this private room to send messages' });
    }

    // إدخال الرسالة
    const newMessage = await pool.query(
      `INSERT INTO messages (room_id, user_id, text) 
       VALUES ($1, $2, $3) 
       RETURNING id, room_id, user_id, text, created_at`,
      [roomId, userId, text]
    );

    return res.status(201).json(newMessage.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
