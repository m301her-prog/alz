import { useState, useEffect } from "react";
import Welcome from "./pages/Welcome.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import ChatRoom from "./pages/ChatRoom.jsx";
import { getCurrentUser, logout } from "./services/authService.js";

function App() {
  const [page, setPage] = useState("welcome");
  const [currentUser, setCurrentUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setPage("chat");
    }
    setReady(true);
  }, []);

  function handleNavigate(target) {
    setPage(target);
  }

  function handleAuthSuccess(user) {
    setCurrentUser(user);
    setPage("chat");
  }

  async function handleLogout() {
    await logout();
    setCurrentUser(null);
    setPage("welcome");
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // منع تحديث الـ State مباشرة داخل الـ Render لتجنب تحذيرات React، واستبدالها بالتحقق الشرطي المباشر
  let activePage = page;
  if (currentUser && activePage !== "chat" && activePage !== "welcome" && activePage !== "signup" && activePage !== "login") {
    // ترك التنقل بحرية حسب رغبة المستخدم
  }

  switch (activePage) {
    case "welcome":
      return <Welcome onNavigate={handleNavigate} />;
    case "signup":
      return (
        <Signup onNavigate={handleNavigate} onAuthSuccess={handleAuthSuccess} />
      );
    case "login":
      return (
        <Login onNavigate={handleNavigate} onAuthSuccess={handleAuthSuccess} />
      );
    case "chat":
      if (!currentUser) {
        return <Welcome onNavigate={handleNavigate} />;
      }
      return <ChatRoom user={currentUser} onLogout={handleLogout} />;
    default:
      return <Welcome onNavigate={handleNavigate} />;
  }
}

export default App;
