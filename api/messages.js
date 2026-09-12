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
    // 1. التحقق أن الغرفة خاصة وأن المستخدم عضو فيها
    const membershipCheck = await pool.query(
      `SELECT r.is_private, rm.user_id 
       FROM rooms r 
       LEFT JOIN room_members rm ON r.id = rm.room_id AND rm.user_id = $2
       WHERE r.id = $1`,
      [roomId, userId]
    );

    if (membershipCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = membershipCheck.rows[0];

    // إذا كانت الغرفة خاصة وليست عامة، اشترط أن يكون المستخدم عضواً مسجلاً فيها
    if (room.is_private && !room.user_id) {
      return res.status(403).json({ error: 'Access denied: You are not a member of this private room' });
    }

    // 2. جلب الرسائل إذا تمت الموافقة
    const messages = await pool.query(
      `SELECT m.id, m.text, m.created_at, u.id as user_id, u.name as user_name, u.avatar, u.color
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.room_id = $1
       ORDER BY m.created_at ASC`,
      [roomId]
    );

    return res.status(200).json(messages.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
