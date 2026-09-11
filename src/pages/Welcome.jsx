import { useState, useEffect } from "react";
import pendulumImage from "../assets/pendulum-img.png";

export default function Welcome() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString("en-US", { hour12: false });
  const dateString = time.toLocaleDateString("ar-EG", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div style={styles.container}>
      {/* الساعة الرقمية */}
      <div style={styles.clockCard}>
        <div style={styles.digitalTime}>{timeString}</div>
        <div style={styles.dateText}>{dateString}</div>
      </div>

      {/* الجملة الأنيقة */}
      <h2 style={styles.quoteText}>« أثمن ما خلق الله الزمن »</h2>

      {/* البندول المتحرك */}
      <div style={styles.pendulumContainer}>
        <div style={styles.pendulumPivot}></div>
        <div style={styles.pendulumArmContainer}>
          <div style={styles.pendulumRod}></div>
          <div style={styles.pendulumCircle}>
            <img src={pendulumImage} alt="بندول الساعة" style={styles.pendulumImg} />
          </div>
        </div>
      </div>

      {/* تنسيقات CSS الداخلية لحركة البندول والشاشة */}
      <style>{`
        @keyframes swing {
          0% { transform: rotate(20deg); }
          100% { transform: rotate(-20deg); }
        }
      `}</style>
    </div>
  );
}

// التنسيقات البرمجية (CSS Styles)
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    fontFamily: "'Cairo', sans-serif",
    color: "#ffffff",
    padding: "16px",
    boxSizing: "border-box",
  },
  clockCard: {
    background: "rgba(30, 41, 59, 0.7)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "20px 30px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
    marginBottom: "20px",
  },
  digitalTime: {
    fontSize: "2.8rem",
    fontWeight: "700",
    letterSpacing: "2px",
    color: "#38bdf8",
  },
  dateText: {
    fontSize: "0.95rem",
    color: "#94a3b8",
    marginTop: "5px",
  },
  quoteText: {
    fontSize: "1.1rem",
    fontWeight: "600",
    background: "linear-gradient(90deg, #93c5fd, #c084fc, #60a5fa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "30px",
    textAlign: "center",
  },
  pendulumContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "10px",
  },
  pendulumPivot: {
    width: "8px",
    height: "8px",
    backgroundColor: "#94a3b8",
    borderRadius: "50%",
    zIndex: "2",
  },
  pendulumArmContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    animation: "swing 3s ease-in-out infinite alternate",
    transformOrigin: "top center",
  },
  pendulumRod: {
    width: "2px",
    height: "50px",
    background: "linear-gradient(to bottom, #cbd5e1, #64748b)",
  },
  pendulumCircle: {
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "2px solid rgba(56, 189, 248, 0.5)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
    backgroundColor: "#0f172a",
  },
  pendulumImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
};
