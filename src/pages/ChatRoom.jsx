import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Send,
  Paperclip,
  Smile,
  LogOut,
  Loader2,
  Users,
  Lock,
  Search,
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
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // جلب كافة الحسابات المسجلة من الـ API بدقة لأي عدد من المستخدمين
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('https://alz-taupe.vercel.app/api/users');
        const data = await response.json();
        
        // التحقق من صيغة البيانات القادمة سواء كانت مصفوفة مباشرة أو داخل كائن
        const rawUsers = Array.isArray(data) ? data : data.users || [];
        
        // استثناء المستخدم الحالي من القائمة لكي لا يظهر لنفسه
        const otherUsers = rawUsers.filter((u) => u.id !== user.id);
        
        setUsersList(otherUsers);
        if (otherUsers.length > 0) {
          setSelectedUser(otherUsers[0]);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, [user.id]);

  // إنشاء معرف غرفة خاصة فريد وثابت بين أي مستخدمين اثنين
  const getPrivateRoomId = (userId1, userId2) => {
    return [userId1, userId2].sort().join("_private_chat_");
  };

  // جلب رسائل المحادثة الخاصة عند اختيار مستخدم
  useEffect(() => {
    if (!selectedUser) return;

    async function loadPrivateMessages() {
      setLoadingMessages(true);
      try {
        const roomId = getPrivateRoomId(user.id, selectedUser.id);
        const data = await getMessages(roomId);
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading private messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    }
    loadPrivateMessages();
  }, [selectedUser, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!inputText.trim() || !selectedUser) return;
    setSendingMessage(true);
    try {
      const roomId = getPrivateRoomId(user.id, selectedUser.id);
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

  // تصفية المستخدمين بناءً على البحث
  const filteredUsers = usersList.filter((u) => 
    (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen w-screen flex bg-[#0f172a] text-slate-100 font-['Cairo',sans-serif] overflow-hidden" dir="rtl">
      
      {/* القائمة الجانبية (Sidebar) لعرض الحسابات */}
      <aside className="w-80 lg:w-96 bg-[#1e293b]/80 backdrop-blur-xl border-l border-slate-700/50 flex flex-col shadow-2xl z-20 flex-shrink-0">
        
        {/* رأس القائمة */}
        <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-wide">الرسائل الخاصة</h1>
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                متاح للمراسلة الفورية
              </p>
            </div>
          </div>
        </div>

        {/* خانة البحث عن مستخدم */}
        <div className="p-4 pb-2">
          <div className="relative">
            <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مستخدم بالاسم أو البريد..."
              className="w-full bg-[#0f172a]/60 border border-slate-700/60 rounded-xl py-2.5 pr-10 pl-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* قائمة الأعضاء */}
        <div className="p-3 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
          {loadingUsers ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <p className="text-xs">جاري تحميل الحسابات...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              لا توجد حسابات مطابقة للبحث
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isSelected = selectedUser?.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full flex items-center gap-3.5 p-3 rounded-2xl transition-all border text-right group ${
                    isSelected
                      ? "bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                      : "bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/80 hover:border-slate-600"
                  }`}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md border border-white/10"
                    style={{ backgroundColor: u.color || "#4f46e5" }}
                  >
                    {u.avatar || u.name?.charAt(0) || "👤"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
                      {u.name || "مستخدم بدون اسم"}
                    </h3>
                    <p className="text-slate-400 text-xs truncate mt-0.5">
                      {u.email || "لا يوجد بريد إلكتروني"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* بطاقة المستخدم الحالي وزر الخروج */}
        <div className="p-4 border-t border-slate-700/50 bg-[#0f172a]/50">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 shadow-inner">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow border border-white/10"
              style={{ backgroundColor: user.color || "#4f46e5" }}
            >
              {user.avatar || user.name?.charAt(0) || "👤"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">{user.name}</p>
              <p className="text-slate-400 text-[10px] truncate">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-red-400 transition-colors p-2 rounded-xl hover:bg-red-500/10"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* نافذة الشات الرئيسية */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0b1329] relative">
        
        {selectedUser ? (
          <>
            {/* شريط علوي للمحادثة الخاصة */}
            <header className="bg-[#1e293b]/80 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4 flex items-center gap-4 shadow-sm z-10">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-md border border-white/10 flex-shrink-0"
                style={{ backgroundColor: selectedUser.color || "#4f46e5" }}
              >
                {selectedUser.avatar || selectedUser.name?.charAt(0) || "👤"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-bold text-sm sm:text-base truncate">{selectedUser.name}</h2>
                  <Lock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                </div>
                <p className="text-slate-400 text-xs truncate mt-0.5">{selectedUser.email}</p>
              </div>
            </header>

            {/* رسائل المحادثة */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                  <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
                  <p className="text-xs">جاري تحميل الرسائل...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                  <div className="w-16 h-16 rounded-3xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center shadow-inner">
                    <MessageCircle className="w-8 h-8 text-indigo-400 opacity-80" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium">ابدأ أول محادثة خاصة الآن مع {selectedUser.name}</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.userId === user.id;
                  return (
                    <div
                      key={msg.id || Math.random()}
                      className={`flex items-end gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow border border-white/10"
                        style={{ backgroundColor: msg.color || (isOwn ? user.color : selectedUser.color) || "#4f46e5" }}
                      >
                        {msg.avatar || "👤"}
                      </div>
                      <div
                        className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-3 shadow-xl backdrop-blur-md border text-xs sm:text-sm ${
                          isOwn
                            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-sm border-indigo-400/30 shadow-indigo-950/40"
                            : "bg-slate-800/80 text-slate-100 rounded-tl-sm border-slate-700/60"
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                        <p className={`text-[10px] mt-1.5 text-left ${isOwn ? "text-indigo-100/70" : "text-slate-400"}`}>
                          {formatTime(msg.createdAt || new Date())}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* شريط إدخال الرسائل */}
            <div className="border-t border-slate-700/50 bg-[#1e293b]/80 backdrop-blur-xl p-4 relative">
              {showEmoji && (
                <div className="absolute bottom-full mb-3 right-4 bg-[#0f172a]/95 backdrop-blur-2xl rounded-2xl border border-slate-700/80 p-3 grid grid-cols-8 gap-1.5 shadow-2xl z-30">
                  {EMOJIS.map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-lg hover:bg-slate-800 rounded-lg p-2 transition-all text-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 max-w-4xl mx-auto">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-slate-400 hover:text-white p-2.5 rounded-xl hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700 flex-shrink-0"
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
                  className={`p-2.5 rounded-xl transition-all flex-shrink-0 border ${
                    showEmoji
                      ? "text-indigo-400 bg-indigo-500/15 border-indigo-500/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800 border-transparent hover:border-slate-700"
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
                  placeholder={`اكتب رسالة خاصة إلى ${selectedUser.name}...`}
                  className="flex-1 bg-[#0f172a]/70 border border-slate-700/60 rounded-xl py-3 px-4 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                />

                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || sendingMessage}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white p-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 border border-indigo-400/30"
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
            <Users className="w-12 h-12 opacity-40" />
            <p className="text-sm font-medium">الرجاء اختيار مستخدم من القائمة الجانبية لبدء المحادثة الخاصة</p>
          </div>
        )}

      </main>
    </div>
  );
}
