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
  ArrowRight,
  Trash2,
  CheckCheck,
  Check,
} from "lucide-react";
// تأكد من إضافة الدوال الخاصة بالحذف في ملف authService.js لديك
import { getRoomMessages, sendMessage, deleteRoomMessages, deleteMessage } from "../services/authService.js";

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

// ==========================================
// 1. مكون قائمة المستخدمين (الشاشة الأولى)
// ==========================================
export function UsersList({ user, onSelectUser, onLogout }) {
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('https://alz-taupe.vercel.app/api/users');
        const data = await response.json();
        const rawUsers = Array.isArray(data) ? data : data.users || [];
        const otherUsers = rawUsers.filter((u) => u.id !== user.id);
        setUsersList(otherUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, [user.id]);

  const filteredUsers = usersList.filter((u) => 
    (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserClick = (selectedUserObject) => {
    onSelectUser(selectedUserObject);
  };

  return (
    <div className="users-screen-container" dir="rtl">
      <div className="users-screen-card">
        <div className="sidebar-header">
          <div className="sidebar-icon-box">
            <Users size={22} />
          </div>
          <div>
            <h1 className="sidebar-title">اختر محادثة</h1>
            <span className="sidebar-status">
              <span className="status-dot"></span>
              مرحباً، {user.name}
            </span>
          </div>
        </div>

        <div className="search-box-wrapper">
          <div className="search-input-container">
            <Search className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مستخدم بالاسم أو البريد..."
              className="search-input"
            />
          </div>
        </div>

        <div className="users-list">
          {loadingUsers ? (
            <div className="center-loader">
              <Loader2 className="animate-spin" size={24} color="#6366f1" />
              <p>جاري تحميل الحسابات...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="center-loader">
              <p>لا توجد حسابات مطابقة</p>
            </div>
          ) : (
            filteredUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => handleUserClick(u)}
                className="user-card"
              >
                <div
                  className="user-avatar"
                  style={{ backgroundColor: u.color || "#6366f1" }}
                >
                  {u.avatar || u.name?.charAt(0) || "👤"}
                </div>
                <div className="user-info">
                  <h3 className="user-name">{u.name || "مستخدم بدون اسم"}</h3>
                  <p className="user-email">{u.email || "لا يوجد بريد"}</p>
                </div>
                <MessageCircle size={18} color="#6366f1" style={{ opacity: 0.6 }} />
              </button>
            ))
          )}
        </div>

        <div className="current-user-footer">
          <div className="current-user-box">
            <div
              className="user-avatar"
              style={{ width: "36px", height: "36px", backgroundColor: user.color || "#6366f1" }}
            >
              {user.avatar || user.name?.charAt(0) || "👤"}
            </div>
            <div className="user-info">
              <p className="user-name">{user.name}</p>
              <p className="user-email">{user.email}</p>
            </div>
            <button onClick={onLogout} className="logout-btn" title="تسجيل الخروج">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ==========================================
// 2. مكون شاشة الدردشة المستقل (المكون الثاني)
// ==========================================
export function ChatRoomPage({ user, selectedUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const getPrivateRoomId = (userId1, userId2) => {
    return [userId1, userId2].sort().join("_private_chat_");
  };

  const currentRoomId = getPrivateRoomId(user.id, selectedUser.id);

  useEffect(() => {
    async function loadPrivateMessages() {
      setLoadingMessages(true);
      try {
        const data = await getRoomMessages(currentRoomId, user.id);
        setMessages(Array.isArray(data) ? data : data.messages || []);
      } catch (err) {
        console.error("Error loading private messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    }
    loadPrivateMessages();
  }, [currentRoomId, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!inputText.trim()) return;
    setSendingMessage(true);
    try {
      const res = await sendMessage(currentRoomId, user.id, inputText);
      const newMsg = res.message || res;
      setMessages((prev) => [...prev, newMsg]);
      setInputText("");
      setShowEmoji(false);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSendingMessage(false);
    }
  }

  // دالة حذف محادثة كاملة (الغرفة بالكامل) مع تمرير الـ ID
  async function handleDeleteAllChat() {
    if (!window.confirm("هل أنت متأكد من حذف محادثة بالكامل؟")) return;
    try {
      if (typeof deleteRoomMessages === "function") {
        await deleteRoomMessages(currentRoomId, user.id);
      }
      setMessages([]);
    } catch (err) {
      console.error("Error deleting room messages:", err);
    }
  }

  // دالة حذف رسالة محددة عبر تمرير معرف الرسالة messageId
  async function handleDeleteSingleMessage(messageId) {
    try {
      if (typeof deleteMessage === "function") {
        await deleteMessage(messageId, user.id);
      }
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (err) {
      console.error("Error deleting message:", err);
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
    <div className="chat-main-standalone" dir="rtl">
      <header className="chat-header">
        <button onClick={onBack} className="toolbar-btn" title="الرجوع للقائمة">
          <ArrowRight size={20} />
        </button>
        <div
          className="user-avatar"
          style={{ backgroundColor: selectedUser.color || "#6366f1" }}
        >
          {selectedUser.avatar || selectedUser.name?.charAt(0) || "👤"}
        </div>
        <div className="user-info" style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 className="user-name" style={{ fontSize: "15px" }}>{selectedUser.name}</h2>
            <Lock size={14} color="#818cf8" />
          </div>
          <p className="user-email">معرف الغرفة: {currentRoomId.substring(0, 15)}...</p>
        </div>

        {/* زر حذف المحادثة بالكامل */}
        <button
          onClick={handleDeleteAllChat}
          className="toolbar-btn delete-chat-btn"
          title="حذف المحادثة بالكامل"
        >
          <Trash2 size={20} color="#ef4444" />
        </button>
      </header>

      <div className="messages-area">
        {loadingMessages ? (
          <div className="center-loader">
            <Loader2 className="animate-spin" size={28} color="#6366f1" />
            <p>جاري تحميل الرسائل...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <div style={{ padding: "16px", backgroundColor: "#1f2937", borderRadius: "16px" }}>
              <MessageCircle size={32} color="#818cf8" />
            </div>
            <p>ابدأ أول محادثة خاصة الآن مع {selectedUser.name}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.userId === user.id;
            return (
              <div key={msg.id || Math.random()} className={`message-row ${isOwn ? "own" : "other"}`}>
                <div
                  className="msg-avatar"
                  style={{ backgroundColor: msg.color || (isOwn ? user.color : selectedUser.color) || "#6366f1" }}
                >
                  {msg.avatar || "👤"}
                </div>
                <div className={`message-bubble ${isOwn ? "own" : "other"}`}>
                  <div className="message-content-wrapper">
                    <p style={{ margin: 0 }}>{msg.text}</p>
                    {/* زر حذف رسالة محددة (نص محدد) مع تمرير الـ id الخاص بالرسالة */}
                    <button 
                      onClick={() => handleDeleteSingleMessage(msg.id)} 
                      className="delete-msg-btn"
                      title="حذف هذه الرسالة"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="message-footer-info">
                    <span className="message-time">
                      {formatTime(msg.createdAt || new Date())}
                    </span>
                    {isOwn && (
                      <span className="message-status-icon">
                        <CheckCheck size={14} color="#6366f1" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-footer">
        {showEmoji && (
          <div className="emoji-picker-popup">
            {EMOJIS.map((emoji, i) => (
              <button
                key={i}
                onClick={() => handleEmojiClick(emoji)}
                className="emoji-btn"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <div className="input-toolbar">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="toolbar-btn"
            title="إرفاق ملف"
          >
            <Paperclip size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />

          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className={`toolbar-btn ${showEmoji ? "active" : ""}`}
            title="إيموجي"
          >
            <Smile size={20} />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`اكتب رسالة خاصة إلى ${selectedUser.name}...`}
            className="main-text-input"
          />

          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sendingMessage}
            className="send-btn"
            title="إرسال"
          >
            {sendingMessage ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


// ==========================================
// 3. المكون الرئيسي (المتحكم في التنقل بين الشاشتين)
// ==========================================
export default function AppChatManager({ user, onLogout }) {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="app-root-container">
      <style>{`
        .app-root-container {
          width: 100vw;
          height: 100vh;
          height: 100dvh; /* لدعم الشاشات الكاملة في أندرويد والمتصفحات الحديثة */
          background-color: #0b0f19;
          color: #f1f5f9;
          font-family: 'Cairo', sans-serif;
          overflow: hidden;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
        }
        .users-screen-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background-color: #070a12;
          padding: 10px;
          box-sizing: border-box;
        }
        .users-screen-card {
          width: 100%;
          max-width: 480px;
          height: 90vh;
          max-height: 100%;
          background-color: #111827;
          border: 1px solid #1f2937;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          overflow: hidden;
        }
        .sidebar-header {
          padding: 16px;
          border-bottom: 1px solid #1f2937;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sidebar-icon-box {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .sidebar-title {
          font-weight: 700;
          font-size: 16px;
          color: #ffffff;
          margin: 0;
        }
        .sidebar-status {
          font-size: 12px;
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 3px;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 8px #10b981;
        }
        .search-box-wrapper {
          padding: 12px 16px;
        }
        .search-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          right: 14px;
          color: #64748b;
          width: 16px;
          height: 16px;
        }
        .search-input {
          width: 100%;
          background-color: #1f2937;
          border: 1px solid #374151;
          border-radius: 12px;
          padding: 10px 40px 10px 14px;
          font-size: 13px;
          color: #fff;
          outline: none;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }
        .search-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        .users-list {
          padding: 0 16px 16px 16px;
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .user-card {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid #1f2937;
          background-color: #161e2e;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: right;
          box-sizing: border-box;
        }
        .user-card:hover {
          background-color: #1f2937;
          border-color: #6366f1;
          transform: translateY(-1px);
        }
        .user-avatar {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: bold;
          font-size: 14px;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .user-info {
          flex: 1;
          min-width: 0;
        }
        .user-name {
          font-weight: 600;
          font-size: 14px;
          color: #f8fafc;
          margin: 0 0 2px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-email {
          font-size: 12px;
          color: #94a3b8;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .current-user-footer {
          padding: 12px 16px;
          border-top: 1px solid #1f2937;
          background-color: #0d1322;
        }
        .current-user-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px;
          background-color: #1f2937;
          border-radius: 12px;
          border: 1px solid #374151;
        }
        .logout-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logout-btn:hover {
          color: #ef4444;
          background-color: rgba(239, 68, 68, 0.1);
        }
        .chat-main-standalone {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          background-color: #070a12;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }
        .chat-header {
          background-color: #111827;
          border-bottom: 1px solid #1f2937;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          flex-shrink: 0;
        }
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-sizing: border-box;
        }
        .message-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          width: 100%;
        }
        .message-row.own {
          justify-content: flex-start;
          flex-direction: row-reverse;
        }
        .message-row.other {
          justify-content: flex-start;
          flex-direction: row;
        }
        .msg-avatar {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 11px;
          font-weight: bold;
          flex-shrink: 0;
        }
        .message-bubble {
          max-width: 75%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 13px;
          line-height: 1.5;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          border: 1px solid transparent;
          word-break: break-word;
          position: relative;
          box-sizing: border-box;
        }
        .message-content-wrapper {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }
        .delete-msg-btn {
          background: none;
          border: none;
          color: inherit;
          opacity: 0.4;
          cursor: pointer;
          padding: 2px;
          transition: opacity 0.2s;
        }
        .delete-msg-btn:hover {
          opacity: 1;
        }
        .message-bubble.own {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          border-top-right-radius: 4px;
          border-color: rgba(99, 102, 241, 0.3);
        }
        .message-bubble.other {
          background-color: #1f2937;
          color: #f1f5f9;
          border-top-left-radius: 4px;
          border-color: #374151;
        }
        .message-footer-info {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
          margin-top: 4px;
        }
        .message-time {
          font-size: 10px;
          opacity: 0.7;
        }
        .message-status-icon {
          display: flex;
          align-items: center;
        }
        .chat-input-footer {
          border-top: 1px solid #1f2937;
          background-color: #111827;
          padding: 12px 16px;
          position: relative;
          flex-shrink: 0;
        }
        .emoji-picker-popup {
          position: absolute;
          bottom: calc(100% + 12px);
          right: 16px;
          background-color: #111827;
          border: 1px solid #374151;
          border-radius: 16px;
          padding: 10px;
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 6px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          z-index: 30;
        }
        .emoji-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .emoji-btn:hover {
          background-color: #1f2937;
        }
        .input-toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
          max-width: 900px;
          margin: 0 auto;
        }
        .toolbar-btn {
          background: none;
          border: 1px solid transparent;
          color: #94a3b8;
          cursor: pointer;
          padding: 8px;
          border-radius: 12px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .toolbar-btn:hover {
          color: #fff;
          background-color: #1f2937;
          border-color: #374151;
        }
        .toolbar-btn.active {
          color: #6366f1;
          background-color: rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.3);
        }
        .main-text-input {
          flex: 1;
          background-color: #1f2937;
          border: 1px solid #374151;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13px;
          color: #fff;
          outline: none;
          transition: all 0.3s;
          min-width: 0;
          box-sizing: border-box;
        }
        .main-text-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        .send-btn {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          border: 1px solid rgba(99, 102, 241, 0.4);
          color: #fff;
          cursor: pointer;
          padding: 10px 14px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          flex-shrink: 0;
        }
        .send-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .center-loader, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #64748b;
          gap: 12px;
          text-align: center;
          font-size: 13px;
        }
      `}</style>

      {!selectedUser ? (
        <UsersList 
          user={user} 
          onSelectUser={(u) => setSelectedUser(u)} 
          onLogout={onLogout} 
        />
      ) : (
        <ChatRoomPage 
          user={user} 
          selectedUser={selectedUser} 
          onBack={() => setSelectedUser(null)} 
        />
      )}
    </div>
  );
}
