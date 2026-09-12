import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // مطلوب غالباً لخدمات السحاب مثل Supabase أو Neon على Vercel
  }
});

export default pool;
