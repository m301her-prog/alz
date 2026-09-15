import pkg from 'pg';
const { Pool } = pkg;

// التأكد من إضافة sslmode=require أو verify-full للرابط لمنع التحذير، مع السماح بالاتصال السحابي
const connectionString = process.env.DATABASE_URL;
const separator = connectionString.includes('?') ? '&' : '?';
const secureConnectionString = connectionString.includes('sslmode=') 
  ? connectionString 
  : `${connectionString}${separator}sslmode=require`;

const pool = new Pool({
  connectionString: secureConnectionString,
  ssl: {
    rejectUnauthorized: false // مطلوب لتجاوز شهادات الأمان الذاتية في قواعد البيانات السحابية مثل Neon و Supabase
  }
});

export default pool;
