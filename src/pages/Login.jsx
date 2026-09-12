import { useState } from "react";
import { login, validateEmail } from "../services/authService.js";

export default function Login({ onNavigate, onAuthSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("الرجاء إدخال بريد إلكتروني صحيح");
      return;
    }
    if (!password) {
      setError("الرجاء إدخال كلمة المرور");
      return;
    }

    setLoading(true);
    try {
      const user = await login({ email, password });
      onAuthSuccess(user);
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container} dir="rtl">
      <div style={styles.card}>
        
        {/* زر العودة */}
        <button 
          onClick={() => onNavigate("welcome")} 
          style={styles.backButton}
        >
          ← العودة للرئيسية
        </button>

        <div style={styles.header}>
          <h1 style={styles.title}>تسجيل الدخول</h1>
          <p style={styles.subtitle}>أدخل بياناتك لاستكمال الدردشة</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
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
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        {/* زر الانتقال لصفحة Signup.jsx */}
        <div style={styles.footer}>
          <p style={styles.footerText}>ليس لديك حساب؟</p>
          <button
            type="button"
            onClick={() => onNavigate("signup")}
            style={styles.signupLink}
          >
            إنشاء حساب جديد
          </button>
        </div>

        <div style={styles.demoBox}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>حساب تجريبي: </span>
          <code style={{ fontSize: '12px', color: '#38bdf8' }}>ahmed@example.com / 123456</code>
        </div>
      </div>
    </div>
  );
}

// تصميم منسق ومرتب بعيداً عن مشاكل التيلويند المفقود
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
    alignItem: 'center',
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
  demoBox: {
    marginTop: '20px',
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    textAlign: 'center',
  }
};
