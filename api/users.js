import pool from './lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const allUsers = await pool.query(
      `SELECT id, name, email, avatar, color, created_at FROM users ORDER BY created_at DESC`
    );

    return res.status(200).json({
      users: allUsers.rows
    });

  } catch (error) {
    console.error('Fetch Users Error:', error);
    return res.status(500).json({ error: 'حدث خطأ داخلي في الخادم' });
  }
}
