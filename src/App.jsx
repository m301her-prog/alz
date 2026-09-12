import { useState, useEffect } from "react";
import Welcome from "./pages/Welcome.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import ChatRoom from "./pages/ChatRoom.jsx";
import { getCurrentUser, logout } from "./services/authService.js";

export default function App() {
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
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '2px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  switch (page) {
    case "welcome":
      return <Welcome onNavigate={handleNavigate} />;
    case "signup":
      return <Signup onNavigate={handleNavigate} onAuthSuccess={handleAuthSuccess} />;
    case "login":
      return <Login onNavigate={handleNavigate} onAuthSuccess={handleAuthSuccess} />;
    case "chat":
      if (!currentUser) {
        return <Welcome onNavigate={handleNavigate} />;
      }
      return <ChatRoom user={currentUser} onLogout={handleLogout} />;
    default:
      return <Welcome onNavigate={handleNavigate} />;
  }
}
