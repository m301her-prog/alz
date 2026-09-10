import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Code2,
  Palette,
  Music,
  Send,
  Paperclip,
  Smile,
  LogOut,
  Menu,
  X,
  Search,
  Loader2,
} from "lucide-react";
import { getRooms, getMessages, sendMessage } from "../services/chatService.js";

// خريطة الأيقونات لأسماء الأيقونات المخزنة في البيانات
const ICON_MAP = { MessageCircle, Code2, Palette, Music };

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
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // جلب الغرف عند التحميل
  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await getRooms();
        setRooms(data);
        if (data.length > 0) {
          setSelectedRoom(data[0]);
        }
      } finally {
        setLoadingRooms(false);
      }
    }
    loadRooms();
  }, []);

  // جلب رسائل الغرفة عند تغيير الغرفة المختارة
  useEffect(() => {
    if (!selectedRoom) return;
    async function loadMessages() {
      setLoadingMessages(true);
      try {
        const data = await getMessages(selectedRoom.id);
        setMessages(data);
      } finally {
        setLoadingMessages(false);
      }
    }
    loadMessages();
  }, [selectedRoom]);

  // التمرير لأسفل عند وصول رسائل جديدة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // إرسال رسالة
  async function handleSend() {
    if (!inputText.trim() || !selectedRoom) return;
    setSendingMessage(true);
    try {
      const newMessage = await sendMessage(selectedRoom.id, user, inputText);
      setMessages((prev) => [...prev, newMessage]);
      setInputText("");
      setShowEmoji(false);
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
    <div className="h-screen flex bg-slate-900 overflow-hidden">
      {/* القائمة الجانبية - الغرف */}
      <aside
        className={`${
          showSidebar ? "w-full md:w-80" : "w-0"
        } md:w-80 flex-shrink-0 bg-slate-800/80 backdrop-blur-xl border-l border-slate-700/50 flex flex-col transition-all duration-300 absolute md:relative inset-y-0 right-0 z-20`}
      >
        {/* رأس القائمة */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold">غرف الدردشة</h1>
                <p className="text-slate-400 text-xs">مرحباً، {user.name}</p>
              </div>
            </div>
            <button
              onClick={() => setShowSidebar(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* بحث */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="بحث عن غرفة..."
              className="w-full bg-slate-900/60 border border-slate-700 rounded-lg py-2 pr-9 pl-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* قائمة الغرف */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loadingRooms ? (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            rooms.map((room) => {
              const Icon = ICON_MAP[room.icon] || MessageCircle;
              const isActive = selectedRoom?.id === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => {
                    setSelectedRoom(room);
                    setShowSidebar(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-right ${
                    isActive
                      ? "bg-blue-500/20 border border-blue-500/40"
                      : "hover:bg-slate-700/40 border border-transparent"
                  }`}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: room.color + "33" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: room.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm truncate ${isActive ? "text-white" : "text-slate-300"}`}>
                      {room.name}
                    </h3>
                    <p className="text-slate-500 text-xs truncate">{room.description}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* زر الخروج */}
        <div className="p-3 border-t border-slate-700/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/40">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: user.color }}
            >
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user.name}</p>
              <p className="text-slate-500 text-xs truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogoutClick}
              className="text-slate-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-slate-700/40"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* المنطقة الرئيسية - الدردشة */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* شريط علوي */}
        <header className="bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 px-4 py-3 flex items-center gap-3">
          {!showSidebar && (
            <button
              onClick={() => setShowSidebar(true)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          {selectedRoom && (
            <>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: selectedRoom.color + "33" }}
              >
                {(() => {
                  const Icon = ICON_MAP[selectedRoom.icon] || MessageCircle;
                  return <Icon className="w-5 h-5" style={{ color: selectedRoom.color }} />;
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold truncate">{selectedRoom.name}</h2>
                <p className="text-slate-400 text-xs truncate">{selectedRoom.description}</p>
              </div>
            </>
          )}
        </header>

        {/* منطقة الرسائل */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
              <MessageCircle className="w-12 h-12 opacity-50" />
              <p>لا توجد رسائل بعد. كن أول من يبدأ المحادثة!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.userId === user.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${
                    isOwn ? "flex-row-reverse" : "flex-row"
                  } ${isOwn ? "animate-slide-in-left" : "animate-slide-in-right"}`}
                >
                  {/* الصورة الرمزية */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: msg.color }}
                  >
                    {msg.avatar}
                  </div>

                  {/* فقاعة الرسالة */}
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      isOwn
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : "bg-slate-700 text-slate-100 rounded-tl-sm"
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-xs font-semibold mb-0.5" style={{ color: msg.color }}>
                        {msg.userName}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${isOwn ? "text-blue-200" : "text-slate-400"}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* منطقة الإدخال */}
        <div className="border-t border-slate-700/50 bg-slate-800/60 backdrop-blur-xl p-4">
          {/* لوحة الإيموجي */}
          {showEmoji && (
            <div className="mb-3 bg-slate-900/80 rounded-xl border border-slate-700/50 p-3 grid grid-cols-8 gap-1 animate-fade-in">
              {EMOJIS.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-xl hover:bg-slate-700/50 rounded-lg p-1.5 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* زر إرفاق ملفات */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-400 hover:text-white p-2.5 rounded-xl hover:bg-slate-700/40 transition-colors flex-shrink-0"
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
              className={`p-2.5 rounded-xl transition-colors flex-shrink-0 ${
                showEmoji ? "text-blue-400 bg-blue-500/10" : "text-slate-400 hover:text-white hover:bg-slate-700/40"
              }`}
              title="إيموجي"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* حقل الإدخال */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك هنا..."
              className="flex-1 bg-slate-900/60 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />

            {/* زر الإرسال */}
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || sendingMessage}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
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
