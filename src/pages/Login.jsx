import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, LogIn } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => onNavigate("welcome")}
          className="text-slate-400 hover:text-white flex items-center gap-2 mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للصفحة الرئيسية
        </button>

        <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">تسجيل الدخول</h1>
            <p className="text-slate-400 text-sm mt-2">أدخل بياناتك للدخول إلى الدردشة</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <label className="text-slate-300 text-sm mb-1.5 block">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الدخول...
                </>
              ) : (
                "دخول"
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            ليس لديك حساب؟{" "}
            <button
              onClick={() => onNavigate("signup")}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              إنشاء حساب جديد
            </button>
          </p>

          {/* بيانات تجريبية */}
          <div className="mt-6 bg-slate-900/40 rounded-xl p-3 border border-slate-700/30">
            <p className="text-slate-500 text-xs text-center">
              بيانات تجريبية: ahmed@example.com / 123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
