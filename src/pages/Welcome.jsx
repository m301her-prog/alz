import { useState, useEffect } from "react";
// استيراد صورة البندول من مجلد assets (تأكد من مطابقة اسم الملف والصيغة)
import pendulumImage from "../assets/pendulum-img.png";

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* خلفية زخرفية */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        
        {/* 1. الساعة الرقمية الكبيرة */}
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl px-10 py-6 border border-slate-700/50 shadow-2xl">
          <div className="text-5xl md:text-7xl font-bold text-white tracking-wider tabular-nums">
            <span className="text-blue-400">{hours}</span>
            <span className="text-slate-500 animate-pulse">:</span>
            <span className="text-white">{minutes}</span>
            <span className="text-slate-500 animate-pulse">:</span>
            <span className="text-slate-400 text-4xl md:text-6xl">{seconds}</span>
          </div>
          <p className="text-slate-400 text-sm md:text-base mt-2">{dateString}</p>
        </div>

        {/* 2. الجملة الأنيقة */}
        <div className="my-2">
          <h2 className="text-xl md:text-2xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-blue-400 font-arabic drop-shadow-sm">
            « أثمن ما خلق الله الزمن »
          </h2>
        </div>

        {/* 3. البندول المتحرك (قابل للنقر ليفتح صفحة إنشاء حساب) */}
        <button
          onClick={() => onNavigate("signup")}
          className="group flex flex-col items-center cursor-pointer transition-transform hover:scale-105 mt-2 focus:outline-none"
          aria-label="اضغط للانتقال إلى إنشاء حساب"
        >
          <div className="relative flex flex-col items-center">
            {/* نقطة التثبيت العلوي للبندول */}
            <div className="w-3 h-3 bg-slate-400 rounded-full shadow-lg z-10"></div>

            {/* هيكل البندول المتحرك */}
            <div className="animate-pendulum flex flex-col items-center">
              {/* خيط أو عمود البندول */}
              <div className="w-0.5 h-12 bg-gradient-to-b from-slate-300 to-slate-500"></div>
              
              {/* صورة البندول المستوردة من assets */}
              <div className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center overflow-hidden border-2 border-blue-400/40 group-hover:border-blue-400 transition-all bg-slate-900">
                <img
                  src={pendulumImage}
                  alt="البندول"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* تلميح صغير اختياري */}
          <span className="text-xs text-slate-400 group-hover:text-blue-300 transition-colors mt-3">
            اضغط هنا لإنشاء حساب
          </span>
        </button>

        {/* 4. زر تسجيل الدخول لمن لديه حساب بالفعل */}
        <div className="mt-4">
          <button
            onClick={() => onNavigate("login")}
            className="text-slate-300 hover:text-blue-400 text-sm underline underline-offset-4 transition-colors"
          >
            لديك حساب بالفعل؟ تسجيل الدخول
          </button>
        </div>

      </div>
    </div>
  );
}
