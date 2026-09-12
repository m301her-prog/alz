import pool from './lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, password, avatar, color } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'الرجاء إدخال الاسم، البريد الإلكتروني، وكلمة المرور' });
  }

  try {
    // 1. التحقق مما إذا كان البريد الإلكتروني مستخدماً من قبل
    const existingUser = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' });
    }

    // 2. إدخال المستخدم الجديد في قاعدة البيانات
    // (ملاحظة: يفضل تشفير كلمة المرور بـ bcrypt في التطبيقات الحقيقية)
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password, avatar, color) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, avatar, color, created_at`,
      [
        name, 
        email, 
        password, 
        avatar || '', 
        color || '#3b82f6'
      ]
    );

    return res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح',
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error('Signup Error:', error);
    return res.status(500).json({ error: 'حدث خطأ داخلي في الخادم' });
  }
}
