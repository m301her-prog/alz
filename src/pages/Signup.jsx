import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { signup, validateEmail } from "../services/authService.js";

export default function Signup({ onNavigate, onAuthSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // التحقق من الحقول
    if (!name.trim()) {
      setError("الرجاء إدخال الاسم");
      return;
    }
    if (!validateEmail(email)) {
      setError("الرجاء إدخال بريد إلكتروني صحيح");
      return;
    }
    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    setLoading(true);
    try {
      const user = await signup({ name, email, password });
      onAuthSuccess(user);
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* زر العودة */}
        <button
          onClick={() => onNavigate("welcome")}
          className="text-slate-400 hover:text-white flex items-center gap-2 mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للصفحة الرئيسية
        </button>

        {/* البطاقة */}
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">إنشاء حساب جديد</h1>
            <p className="text-slate-400 text-sm mt-2">
              املأ البيانات أدناه للانضمام إلى الدردشة
            </p>
          </div>

          {/* رسالة الخطأ */}
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* النموذج */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* الاسم */}
            <div>
              <label className="text-slate-300 text-sm mb-1.5 block">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسمك"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 pr-11 pl-4 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label className="text-slate-300 text-sm mb-1.5 block">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 pr-11 pl-4 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="text-slate-300 text-sm mb-1.5 block">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6 أحرف على الأقل"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 pr-11 pl-11 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* تأكيد كلمة المرور */}
            <div>
              <label className="text-slate-300 text-sm mb-1.5 block">تأكيد كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 pr-11 pl-11 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* زر الإرسال */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري إنشاء الحساب...
                </>
              ) : (
                "إنشاء الحساب"
              )}
            </button>
          </form>

          {/* رابط تسجيل الدخول */}
          <p className="text-center text-slate-400 text-sm mt-6">
            لديك حساب بالفعل؟{" "}
            <button
              onClick={() => onNavigate("login")}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              تسجيل الدخول
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
