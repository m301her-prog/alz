import pool from './lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messageId, userId } = req.body;

  if (!messageId || !userId) {
    return res.status(400).json({ error: 'Missing messageId or userId' });
  }

  try {
    // التأكد أن المستخدم هو صاحب الرسالة قبل الحذف
    const messageCheck = await pool.query(
      `SELECT user_id FROM messages WHERE id = $1`,
      [messageId]
    );

    if (messageCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (messageCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this message' });
    }

    // تنفيذ الحذف
    await pool.query(`DELETE FROM messages WHERE id = $1`, [messageId]);

    return res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
