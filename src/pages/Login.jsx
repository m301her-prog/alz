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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* خلفية زجاجية مع تدرجات لونية متوهجة أكثر جاذبية ونعومة */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <button
          onClick={() => onNavigate("welcome")}
          className="text-slate-400 hover:text-white flex items-center gap-2 mb-6 transition-colors group"
        >
          <ArrowRight className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          العودة للصفحة الرئيسية
        </button>

        <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] shadow-indigo-950/50">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto mb-4 border border-white/20">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">تسجيل الدخول</h1>
            <p className="text-slate-400 text-sm mt-2">أدخل بياناتك للدخول إلى الدردشة</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-2xl p-3.5 flex items-center gap-2 text-red-400 text-sm animate-fade-in shadow-lg shadow-red-950/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-300 text-sm mb-1.5 block font-medium">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3.5 pr-12 pl-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm mb-1.5 block font-medium">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3.5 pr-12 pl-12 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-white/20 mt-2"
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
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors underline underline-offset-4"
            >
              إنشاء حساب جديد
            </button>
          </p>

          {/* بيانات تجريبية */}
          <div className="mt-6 bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 shadow-inner">
            <p className="text-slate-400 text-xs text-center font-medium">
              بيانات تجريبية: <span className="text-cyan-300 selection:bg-indigo-500">ahmed@example.com</span> / <span className="text-cyan-300">123456</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
