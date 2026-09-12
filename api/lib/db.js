import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // ضروري للاتصال بقواعد البيانات السحابية مثل Supabase أو Neon
  }
});

export default pool;
