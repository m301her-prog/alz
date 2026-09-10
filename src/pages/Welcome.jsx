import { useState, useEffect } from "react";
import { Clock, MessageCircle, ChevronLeft } from "lucide-react";

export default function Welcome({ onNavigate }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  const dateString = time.toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4">
      {/* خلفية زخرفية */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* المحتوى */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* البندول المتحرك - قابل للنقر */}
        <button
          onClick={() => onNavigate("signup")}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105"
          aria-label="اضغط للانتقال إلى إنشاء حساب"
        >
          {/* هيكل الساعة والبندول */}
          <div className="relative flex flex-col items-center">
            {/* نقطة التثبيت */}
            <div className="w-3 h-3 bg-slate-400 rounded-full shadow-lg z-10"></div>

            {/* العمود والثقل */}
            <div className="animate-pendulum flex flex-col items-center mt-1">
              {/* العمود */}
              <div className="w-1 h-16 bg-gradient-to-b from-slate-300 to-slate-500 rounded-full"></div>
              {/* الثقل الدائري */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg flex items-center justify-center ring-4 ring-blue-500/20 group-hover:ring-blue-400/40 transition-all">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* نص تلميحي */}
          <span className="text-slate-400 text-sm mt-2 group-hover:text-blue-400 transition-colors flex items-center gap-1">
            اضغط على البندول لإنشاء حساب
            <ChevronLeft className="w-4 h-4 animate-pulse" />
          </span>
        </button>

        {/* الساعة الرقمية الكبيرة */}
        <div className="animate-glow-pulse bg-slate-800/60 backdrop-blur-xl rounded-3xl px-12 py-8 border border-slate-700/50">
          <div className="text-6xl md:text-7xl font-bold text-white tracking-wider tabular-nums">
            <span className="text-blue-400">{hours}</span>
            <span className="text-slate-500 animate-pulse">:</span>
            <span className="text-white">{minutes}</span>
            <span className="text-slate-500 animate-pulse">:</span>
            <span className="text-slate-400 text-5xl md:text-6xl">{seconds}</span>
          </div>
        </div>

        {/* التاريخ */}
        <p className="text-slate-400 text-lg">{dateString}</p>

        {/* أيقونة التطبيق والعنوان */}
        <div className="flex flex-col items-center gap-3 mt-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">تطبيق الدردشة</h1>
          <p className="text-slate-400 text-center max-w-md">
            مرحباً بك في تطبيق الدردشة. أنشئ حسابك وابدأ المحادثة مع الأصدقاء في
            غرف متعددة
          </p>
        </div>

        {/* زر دخول سريع إذا كان لديك حساب */}
        <button
          onClick={() => onNavigate("login")}
          className="text-blue-400 hover:text-blue-300 text-sm underline underline-offset-4 transition-colors mt-2"
        >
          لديك حساب بالفعل؟ تسجيل الدخول
        </button>
      </div>
    </div>
  );
}
