import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, LogIn, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-[#070913] flex items-center justify-center px-4 relative overflow-hidden py-10 font-sans" dir="rtl">
      
      {/* خلفية تفاعلية بلمسات إضاءة ناعمة وحديثة */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/25 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        
        {/* زر العودة */}
        <button
          onClick={() => onNavigate("welcome")}
          className="group text-slate-400 hover:text-white flex items-center gap-2 mb-6 transition-all duration-300 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 w-fit shadow-sm"
        >
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          <span className="text-sm font-medium">الرئيسية</span>
        </button>

        {/* صندوق تسجيل الدخول الرئيسي (Glassmorphism فائق الجمال) */}
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] shadow-violet-950/20">
          
          {/* رأس النموذج */}
          <div className="text-center mb-8">
            <div className="relative w-16 h-16 bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/30 mx-auto mb-4 border border-white/20 group">
              <LogIn className="w-7 h-7 text-white transition-transform group-hover:scale-110 duration-300" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">أهلاً بك مجدداً!</h1>
            <p className="text-slate-400 text-sm mt-1.5 font-medium">سجل دخولك لاستكمال الدردشة والتواصل</p>
          </div>

          {/* رسالة الخطأ */}
          {error && (
            <div className="mb-6 bg-rose-500/10 backdrop-blur-md border border-rose-500/30 rounded-2xl p-4 flex items-center gap-3 text-rose-400 text-sm shadow-lg shadow-rose-950/20 animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* الفورم */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* البريد الإلكتروني */}
            <div>
              <label className="text-slate-300 text-xs font-semibold mb-2 block tracking-wide">البريد الإلكتروني</label>
              <div className="relative group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950/60 border border-white/10 rounded-2xl py-3.5 pr-12 pl-4 text-white text-sm placeholder-slate-500 focus:border-violet-500 focus:bg-slate-950 focus:ring-4 focus:ring-violet-500/20 outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* كلمة المرور */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-300 text-xs font-semibold tracking-wide">كلمة المرور</label>
              </div>
              <div className="relative group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-400 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-white/10 rounded-2xl py-3.5 pr-12 pl-12 text-white text-sm placeholder-slate-500 focus:border-violet-500 focus:bg-slate-950 focus:ring-4 focus:ring-violet-500/20 outline-none transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* زر الدخول */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-white/20 text-sm tracking-wide"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <span>تسجيل الدخول</span>
              )}
            </button>
          </form>

          {/* الانتقال لصفحة إنشاء حساب */}
          <div className="text-center mt-8 pt-6 border-t border-white/5">
            <p className="text-slate-400 text-sm">
              ليس لديك حساب مسبق؟{" "}
              <button
                type="button"
                onClick={() => onNavigate("signup")}
                className="text-pink-400 hover:text-pink-300 font-bold transition-colors inline-flex items-center gap-1 hover:underline underline-offset-4"
              >
                إنشاء حساب جديد
              </button>
            </p>
          </div>

          {/* بيانات تجريبية محسنة الشكل */}
          <div className="mt-6 bg-white/[0.03] backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-slate-400 text-xs font-semibold">حساب تجريبي:</span>
            </div>
            <div className="text-left text-xs font-mono text-violet-300">
              <span className="bg-white/10 px-2 py-1 rounded">ahmed@example.com</span> / <span className="bg-white/10 px-2 py-1 rounded">123456</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
