import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Send,
  Paperclip,
  Smile,
  LogOut,
  Loader2,
  Lock,
} from "lucide-react";
import { getMessages, sendMessage } from "../services/chatService.js";

// قائمة الإيموجي
const EMOJIS = [
  "😀", "😂", "😍", "🥰", "😎", "🤔", "😴", "🥳",
  "👍", "👎", "👏", "🙌", "🙏", "💪", "❤️", "🔥",
  "🎉", "✨", "🌟", "⚡", "💯", "✅", "❌", "💬",
  "👋", "🤝", "🙏", "😍", "🤗", "😅", "😭", "🥺",
];

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatRoom({ user, onLogout }) {
  // تعريف غرفة خاصة واحدة ثابتة
  const PRIVATE_ROOM = {
    id: "private-main-room",
    name: "الغرفة الخاصة الآمنة",
    description: "محادثات خاصة ومشفرة للأعضاء فقط",
    icon: Lock,
    color: "#3b82f6",
  };

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // جلب رسائل الغرفة الخاصة عند التحميل
  useEffect(() => {
    async function loadMessages() {
      setLoadingMessages(true);
      try {
        const data = await getMessages(PRIVATE_ROOM.id);
        setMessages(data);
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    }
    loadMessages();
  }, []);

  // التمرير لأسفل عند وصول رسائل جديدة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // إرسال رسالة
  async function handleSend() {
    if (!inputText.trim()) return;
    setSendingMessage(true);
    try {
      const newMessage = await sendMessage(PRIVATE_ROOM.id, user, inputText);
      setMessages((prev) => [...prev, newMessage]);
      setInputText("");
      setShowEmoji(false);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSendingMessage(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleEmojiClick(emoji) {
    setInputText((prev) => prev + emoji);
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      setInputText((prev) => prev + ` [مرفق: ${file.name}] `);
    }
  }

  async function handleLogoutClick() {
    await onLogout();
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden font-['Cairo',sans-serif]" dir="rtl">
      
      {/* القائمة الجانبية المصغرة لملف المستخدم والخروج (بتصميم زجاجي فاخر) */}
      <aside className="w-80 flex-shrink-0 bg-slate-900/40 backdrop-blur-2xl border-l border-white/10 flex flex-col shadow-2xl z-20">
        
        {/* رأس القائمة */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/20">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base tracking-wide">الدردشة الخاصة</h1>
              <p className="text-blue-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                اتصال آمن ومميز
              </p>
            </div>
          </div>
        </div>

        {/* معلومات الغرفة الخاصة الوحيدة */}
        <div className="p-4 flex-1">
          <div className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 shadow-inner">
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
              <Lock className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-white truncate">{PRIVATE_ROOM.name}</h3>
              <p className="text-slate-400 text-xs truncate mt-0.5">{PRIVATE_ROOM.description}</p>
            </div>
          </div>
        </div>

        {/* بطاقة المستخدم وزر الخروج */}
        <div className="p-4 border-t border-white/10 bg-slate-950/30">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md border border-white/20"
              style={{ backgroundColor: user.color }}
            >
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{user.name}</p>
              <p className="text-slate-400 text-xs truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogoutClick}
              className="text-slate-400 hover:text-red-400 transition-colors p-2.5 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* المنطقة الرئيسية - محتوى الدردشة الخاصة */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-slate-900/20 backdrop-blur-xl">
        
        {/* شريط علوي زجاجي */}
        <header className="bg-slate-900/40 backdrop-blur-2xl border-b border-white/10 px-6 py-4 flex items-center gap-4 shadow-sm z-10">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30 shadow-md">
            <Lock className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-base truncate">{PRIVATE_ROOM.name}</h2>
            <p className="text-slate-400 text-xs truncate">{PRIVATE_ROOM.description}</p>
          </div>
        </header>

        {/* منطقة الرسائل الزجاجية */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scroll-smooth">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                <MessageCircle className="w-8 h-8 text-blue-400 opacity-80" />
              </div>
              <p className="text-sm font-medium">لا توجد رسائل في الغرفة الخاصة بعد. كن أول من يبدأ الحديث!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.userId === user.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-3 ${
                    isOwn ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* الصورة الرمزية */}
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md border border-white/20"
                    style={{ backgroundColor: msg.color || "#6366f1" }}
                  >
                    {msg.avatar || "👤"}
                  </div>

                  {/* فقاعة الرسالة (زجاجية متطورة) */}
                  <div
                    className={`max-w-[70%] rounded-2xl px-4.5 py-3 shadow-xl backdrop-blur-md border ${
                      isOwn
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm border-blue-400/30 shadow-blue-900/20"
                        : "bg-slate-800/70 text-slate-100 rounded-tl-sm border-white/10"
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-xs font-bold mb-1 tracking-wide" style={{ color: msg.color || "#60a5fa" }}>
                        {msg.userName}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                    <p className={`text-[10px] mt-1.5 text-left ${isOwn ? "text-blue-100/80" : "text-slate-400"}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* منطقة إدخال الرسائل (زجاجية ومريحة للعين) */}
        <div className="border-t border-white/10 bg-slate-900/40 backdrop-blur-2xl p-4 relative">
          
          {/* لوحة الإيموجي الزجاجية المنبثقة */}
          {showEmoji && (
            <div className="absolute bottom-full mb-3 right-4 bg-slate-950/90 backdrop-blur-2xl rounded-2xl border border-white/15 p-3.5 grid grid-cols-8 gap-1.5 shadow-2xl z-30">
              {EMOJIS.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-xl hover:bg-white/10 rounded-xl p-2 transition-all text-center"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2.5 max-w-5xl mx-auto">
            
            {/* زر إرفاق ملفات */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-400 hover:text-white p-3 rounded-2xl hover:bg-white/10 transition-all flex-shrink-0 border border-transparent hover:border-white/10"
              title="إرفاق ملف"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* زر الإيموجي */}
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className={`p-3 rounded-2xl transition-all flex-shrink-0 border ${
                showEmoji
                  ? "text-blue-400 bg-blue-500/15 border-blue-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/10 border-transparent hover:border-white/10"
              }`}
              title="إيموجي"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* حقل الإدخال الزجاجي */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك الخاصة هنا..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3.5 px-5 text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/15 outline-none transition-all shadow-inner text-sm"
            />

            {/* زر الإرسال المتطور */}
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || sendingMessage}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-3.5 rounded-2xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 border border-blue-400/30"
              title="إرسال"
            >
              {sendingMessage ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
