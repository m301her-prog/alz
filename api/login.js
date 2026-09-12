import pool from './lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' });
  }

  try {
    // 1. البحث عن المستخدم بواسطة البريد الإلكتروني
    const userResult = await pool.query(
      `SELECT id, name, email, password, avatar, color FROM users WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    const user = userResult.rows[0];

    // 2. التحقق من تطابق كلمة المرور
    // (إذا كنت تستخدم التشفير، استبدل المقارنة المباشرة بـ bcrypt.compare)
    if (user.password !== password) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    // إرجاع بيانات المستخدم (بدون كلمة المرور لأسباب أمنية)
    const { password: _, ...userData } = user;

    return res.status(200).json({
      message: 'تم تسجيل الدخول بنجاح',
      user: userData
    });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'حدث خطأ داخلي في الخادم' });
  }
}
