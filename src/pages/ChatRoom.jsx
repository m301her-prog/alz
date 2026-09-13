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
  const [selectedUser, setSelectedUser] = useState(null); // المستخدم المحدد للمحادثة الخاصة
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // جلب جميع الحسابات المسجلة في التطبيق ديناميكياً لأي عدد من المستخدمين
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('https://alz-taupe.vercel.app/api/users');
        const data = await response.json();
        if (response.ok) {
          // استثناء المستخدم الحالي من القائمة لكي لا يظهر لنفسه، مع السماح لأي عدد جديد من الحسابات بالظهور
          const otherUsers = (data.users || []).filter((u) => u.id !== user.id);
          setUsersList(otherUsers);
          if (otherUsers.length > 0) {
            setSelectedUser(otherUsers[0]); // اختيار أول مستخدم افتراضياً
          }
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, [user.id]);

  // دالة لإنشاء معرف غرفة خاصة فريد وثابت بين أي مستخدمين اثنين بغض النظر عن العدد الكلي للحسابات
  const getPrivateRoomId = (userId1, userId2) => {
    return [userId1, userId2].sort().join("_private_chat_");
  };

  // جلب رسائل المحادثة الخاصة فور اختيار أي مستخدم من القائمة
  useEffect(() => {
    if (!selectedUser) return;

    async function loadPrivateMessages() {
      setLoadingMessages(true);
      try {
        const roomId = getPrivateRoomId(user.id, selectedUser.id);
        const data = await getMessages(roomId);
        setMessages(data);
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

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden font-['Cairo',sans-serif]" dir="rtl">
      
      {/* القائمة الجانبية: تعرض كافة الحسابات المسجلة في التطبيق للمحادثات الخاصة فقط */}
      <aside className="w-80 flex-shrink-0 bg-slate-900/40 backdrop-blur-2xl border-l border-white/10 flex flex-col shadow-2xl z-20">
        
        {/* رأس القائمة */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/20">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base tracking-wide">المحادثات الخاصة</h1>
              <p className="text-blue-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                اختر عضواً للمراسلة
              </p>
            </div>
          </div>
        </div>

        {/* قائمة جميع الأعضاء والحسابات */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          {loadingUsers ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : usersList.length === 0 ? (
            <p className="text-slate-400 text-xs text-center mt-10">لا توجد حسابات أخرى مسجلة حالياً</p>
          ) : (
            usersList.map((u) => {
              const isSelected = selectedUser?.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full flex items-center gap-3.5 p-3 rounded-2xl transition-all border text-right ${
                    isSelected
                      ? "bg-blue-500/20 border-blue-500/40 shadow-lg shadow-blue-500/10"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md border border-white/20"
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

      {/* نافذة المحادثة الخاصة النشطة */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-slate-900/20 backdrop-blur-xl">
        
        {selectedUser ? (
          <>
            {/* شريط علوي يوضح العضو المختار مع قفل يؤكد خصوصية المحادثة */}
            <header className="bg-slate-900/40 backdrop-blur-2xl border-b border-white/10 px-6 py-4 flex items-center gap-4 shadow-sm z-10">
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
                <p className="text-slate-400 text-xs truncate">محادثة خاصة ومباشرة بينكما فقط</p>
              </div>
            </header>

            {/* منطقة الرسائل الخاصة */}
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
                  <p className="text-sm font-medium">لا توجد رسائل سابقة مع {selectedUser.name}. ابدأ المحادثة الآن!</p>
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
                        style={{ backgroundColor: msg.color || (isOwn ? user.color : selectedUser.color) }}
                      >
                        {msg.avatar || (isOwn ? user.avatar : selectedUser.avatar)}
                      </div>

                      <div
                        className={`max-w-[70%] rounded-2xl px-4.5 py-3 shadow-xl backdrop-blur-md border ${
                          isOwn
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm border-blue-400/30 shadow-blue-900/20"
                            : "bg-slate-800/70 text-slate-100 rounded-tl-sm border-white/10"
                        }`}
                      >
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

            {/* شريط إدخال الرسائل */}
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
                  placeholder={`اكتب رسالة خاصة إلى ${selectedUser.name}...`}
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
            <Users className="w-12 h-12 opacity-50" />
            <p className="text-sm font-medium">الرجاء اختيار مستخدم من القائمة الجانبية لبدء المحادثة الخاصة</p>
          </div>
        )}

      </main>
    </div>
  );
}
