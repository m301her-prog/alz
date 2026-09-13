import { useState } from "react";
import { signup, validateEmail } from "../services/authService.js";

export default function Signup({ onNavigate, onAuthSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("الرجاء إدخال الاسم كاملأً");
      return;
    }
    if (!validateEmail(email)) {
      setError("الرجاء إدخال بريد إلكتروني صحيح");
      return;
    }
    if (!password || password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      // إرسال البيانات لقاعدة البيانات عبر دالة signup
      const user = await signup({ name, email, password });
      
      // حفظ المستخدم في الذاكرة المحلية (إذا لم تقم خدمة الsignup بحفظه تلقائياً)
      localStorage.setItem("user", JSON.stringify(user));

      // تمرير المستخدم الناجح لفتح غرفة الدردشة فوراً
      if (onAuthSuccess) {
        onAuthSuccess(user);
      }
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container} dir="rtl">
      <div style={styles.card}>
        
        {/* زر العودة لتسجيل الدخول أو للرئيسية */}
        <button 
          type="button"
          onClick={() => onNavigate("login")} 
          style={styles.backButton}
        >
          ← العودة لتسجيل الدخول
        </button>

        <div style={styles.header}>
          <h1 style={styles.title}>إنشاء حساب جديد</h1>
          <p style={styles.subtitle}>سجل بياناتك للبدء معنا</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>الاسم الكامل</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="محمد أحمد"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...styles.input, paddingLeft: '45px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
          </button>
        </form>

        {/* الانتقال لصفحة تسجيل الدخول إذا كان لديه حساب بالفعل */}
        <div style={styles.footer}>
          <p style={styles.footerText}>لديك حساب بالفعل؟</p>
          <button
            type="button"
            onClick={() => onNavigate("login")}
            style={styles.signupLink}
          >
            تسجيل الدخول
          </button>
        </div>

      </div>
    </div>
  );
}

// التنسيقات كما هي تماماً
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Cairo, Tahoma, sans-serif',
  },
  card: {
    backgroundColor: '#1e293b',
    padding: '30px',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '25px',
  },
  title: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    color: '#cbd5e1',
    fontSize: '13px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
  },
  submitBtn: {
    backgroundColor: '#6366f1',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: 'bold',
    marginTop: '10px',
    transition: 'background 0.2s',
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
  },
  footerText: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0,
  },
  signupLink: {
    background: 'none',
    border: 'none',
    color: '#38bdf8',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
};
