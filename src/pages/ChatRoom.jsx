import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Send,
  Paperclip,
  Smile,
  LogOut,
  Loader2,
  Users,
  Globe,
  Lock,
} from "lucide-react";
import { getMessages, sendMessage } from "../services/chatService.js";

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
  // نوع المحادثة النشطة: إما "public" (للغرفة العامة) أو "private" (للمحادثة الخاصة مع عضو)
  const [activeTab, setActiveTab] = useState("public"); // "public" أو "private"
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // المستخدم المحدد للمحادثة الخاصة
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // معرف الغرفة العامة الثابت
  const PUBLIC_ROOM_ID = "global-public-main-room";

  // جلب قائمة المستخدمين المسجلين للمحادثات الخاصة
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('https://alz-taupe.vercel.app/api/users');
        const data = await response.json();
        if (response.ok) {
          const otherUsers = (data.users || []).filter((u) => u.id !== user.id);
          setUsersList(otherUsers);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, [user.id]);

  // إنشاء معرف فريد للغرفة الخاصة بين مستخدمين اثنين
  const getPrivateRoomId = (userId1, userId2) => {
    return [userId1, userId2].sort().join("_private_");
  };

  // جلب الرسائل بناءً على القسم النشط (عامة أو خاصة)
  useEffect(() => {
    async function loadRoomMessages() {
      setLoadingMessages(true);
      try {
        let roomId = PUBLIC_ROOM_ID;
        if (activeTab === "private" && selectedUser) {
          roomId = getPrivateRoomId(user.id, selectedUser.id);
        }
        
        // إذا كان القسم خاص ولم يتم اختيار مستخدم بعد، لا تجلب شيئاً
        if (activeTab === "private" && !selectedUser) {
          setMessages([]);
          setLoadingMessages(false);
          return;
        }

        const data = await getMessages(roomId);
        setMessages(data);
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    }
    loadRoomMessages();
  }, [activeTab, selectedUser, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!inputText.trim()) return;
    if (activeTab === "private" && !selectedUser) return;

    setSendingMessage(true);
    try {
      let roomId = PUBLIC_ROOM_ID;
      if (activeTab === "private" && selectedUser) {
        roomId = getPrivateRoomId(user.id, selectedUser.id);
      }

      const newMessage = await sendMessage(roomId, user, inputText);
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

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden font-['Cairo',sans-serif]" dir="rtl">
      
      {/* القائمة الجانبية: الغرفة العامة + قائمة الأعضاء للمحادثات الخاصة */}
      <aside className="w-80 flex-shrink-0 bg-slate-900/40 backdrop-blur-2xl border-l border-white/10 flex flex-col shadow-2xl z-20">
        
        {/* رأس القائمة */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/20">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base tracking-wide">منصة المحادثات</h1>
              <p className="text-blue-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                متصل الآن
              </p>
            </div>
          </div>
        </div>

        {/* زر الانتقال للغرفة العامة */}
        <div className="p-4 pb-2">
          <button
            onClick={() => {
              setActiveTab("public");
              setSelectedUser(null);
            }}
            className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl transition-all border text-right shadow-md ${
              activeTab === "public"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/40 shadow-blue-900/20"
                : "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${activeTab === "public" ? "bg-white/20 border-white/30 text-white" : "bg-blue-500/20 border-blue-500/30 text-blue-400"}`}>
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate">الغرفة العامة</h3>
              <p className={`text-xs truncate mt-0.5 ${activeTab === "public" ? "text-blue-100/80" : "text-slate-400"}`}>
                محادثة جماعية للجميع
              </p>
            </div>
          </button>
        </div>

        {/* قسم المحادثات الخاصة */}
        <div className="px-4 pt-2 pb-1 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            الأعضاء (محادثات خاصة)
          </span>
        </div>

        {/* قائمة الأعضاء */}
        <div className="p-4 pt-1 flex-1 overflow-y-auto space-y-2">
          {loadingUsers ? (
            <div className="flex justify-center items-center h-28">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            </div>
          ) : usersList.length === 0 ? (
            <p className="text-slate-400 text-xs text-center mt-6">لا يوجد أعضاء آخرون</p>
          ) : (
            usersList.map((u) => {
              const isSelected = activeTab === "private" && selectedUser?.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    setActiveTab("private");
                    setSelectedUser(u);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border text-right ${
                    isSelected
                      ? "bg-blue-500/20 border-blue-500/40 shadow-lg shadow-blue-500/10"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md border border-white/20"
                    style={{ backgroundColor: u.color || "#6366f1" }}
                  >
                    {u.avatar || "👤"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-white truncate">{u.name}</h3>
                    <p className="text-slate-400 text-xs truncate mt-0.5">{u.email}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* بطاقة المستخدم الحالي وزر الخروج */}
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
              <p className="text-slate-400 text-xs truncate">أنت (متصل)</p>
            </div>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-red-400 transition-colors p-2.5 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* المنطقة الرئيسية لعرض المحادثة (العامة أو الخاصة) */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-slate-900/20 backdrop-blur-xl">
        
        {/* شريط علوي يوضح نوع المحادثة الحالية */}
        <header className="bg-slate-900/40 backdrop-blur-2xl border-b border-white/10 px-6 py-4 flex items-center gap-4 shadow-sm z-10">
          {activeTab === "public" ? (
            <>
              <div className="w-11 h-11 rounded-2xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30 shadow-md">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold text-base truncate">الغرفة العامة</h2>
                <p className="text-slate-400 text-xs truncate">محادثة جماعية مفتوحة للجميع</p>
              </div>
            </>
          ) : selectedUser ? (
            <>
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md border border-white/20"
                style={{ backgroundColor: selectedUser.color || "#6366f1" }}
              >
                {selectedUser.avatar || "👤"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-bold text-base truncate">{selectedUser.name}</h2>
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <p className="text-slate-400 text-xs truncate">محادثة خاصة ومباشرة</p>
              </div>
            </>
          ) : null}
        </header>

        {/* منطقة الرسائل */}
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
              <p className="text-sm font-medium">
                {activeTab === "public"
                  ? "لا توجد رسائل في الغرفة العامة بعد. كن أول المشاركين!"
                  : `لا توجد رسائل سابقة مع ${selectedUser?.name}. ابدأ الحديث الآن!`}
              </p>
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
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md border border-white/20"
                    style={{ backgroundColor: msg.color || (isOwn ? user.color : selectedUser?.color || "#6366f1") }}
                  >
                    {msg.avatar || "👤"}
                  </div>

                  <div
                    className={`max-w-[70%] rounded-2xl px-4.5 py-3 shadow-xl backdrop-blur-md border ${
                      isOwn
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm border-blue-400/30 shadow-blue-900/20"
                        : "bg-slate-800/70 text-slate-100 rounded-tl-sm border-white/10"
                    }`}
                  >
                    {/* عرض اسم المرسل في الغرفة العامة ليفرق المستخدمون بين بعضهم */}
                    {activeTab === "public" && !isOwn && (
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

        {/* شريط الإدخال */}
        <div className="border-t border-white/10 bg-slate-900/40 backdrop-blur-2xl p-4 relative">
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

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                activeTab === "public"
                  ? "اكتب رسالتك في الغرفة العامة..."
                  : `اكتب رسالة خاصة إلى ${selectedUser?.name}...`
              }
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3.5 px-5 text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/15 outline-none transition-all shadow-inner text-sm"
            />

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
