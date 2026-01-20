import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { loginUser } from "../https/api.js";
import { io } from "socket.io-client";
import axios from "axios";
import logo from "../src/assets/icons/logo.png";
import { inputClass, buttonClass, labelClass, cardClass } from "../src/style.js";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function TeamLogin() {
  const { loginTeam, team, createUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("team-login");
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [teamId, setTeamId] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const numColumns = 30;
    const newColumns = [];

    for (let i = 0; i < numColumns; i++) {
      const column = [];
      const columnLength = Math.floor(Math.random() * 30) + 20;
      const columnDelay = Math.random() * 5;
      for (let j = 0; j < columnLength; j++) {
        column.push({
          char: chars[Math.floor(Math.random() * chars.length)],
          delay: columnDelay + j * 0.1,
          duration: 2 + Math.random() * 3,
          opacity: j === 0 ? 1 : Math.max(0.3, 1 - j * 0.05),
        });
      }
      newColumns.push({ left: `${(100 / numColumns) * i}%`, items: column });
    }
    setColumns(newColumns);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        name: teamId,
        code,
      });

      loginTeam(res.data.team || res.data);
      setStep("create-user");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${BACKEND_URL}/api/users/create`, {
        name: username,
        teamId: team._id,
      });

      createUser(res.data.user, res.data.token);
      localStorage.setItem("token", res.data.token);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create user");
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await loginUser({ name: adminName, password: adminPassword });
      if (res.data.user.role !== "admin") {
        setError("Not an admin account!");
        return;
      }
      localStorage.setItem("admin", JSON.stringify(res.data));
      const socket = io(`${BACKEND_URL}`, { auth: { token: res.data.token } });
      socket.on("connect", () => console.log("Admin socket connected:", socket.id));
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  const toggleAdminLogin = () => {
    setIsAdminLogin(!isAdminLogin);
    setError("");
    setAdminName("");
    setAdminPassword("");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 -z- bg-[var(--bg-secondary)]">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 [background:radial-gradient(ellipse_100%_100%_at_0%_0%,rgba(31,194,16,0.15),transparent_70%),radial-gradient(ellipse_100%_100%_at_100%_0%,rgba(5,142,63,0.12),transparent_70%),radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(31,194,16,0.1),transparent_80%),radial-gradient(ellipse_100%_100%_at_0%_100%,rgba(143,163,160,0.06),transparent_70%),radial-gradient(ellipse_100%_100%_at_100%_100%,rgba(5,142,63,0.1),transparent_70%),linear-gradient(135deg,#041212_0%,#051111_30%,#041212_60%,#000000_100%)]"></div>
        <div className="absolute inset-0 [background:linear-gradient(to_right,rgba(31,194,16,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(31,194,16,0.06)_1px,transparent_1px)] [background-size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black_40%,transparent_100%)]"></div>
        <div className="absolute inset-0 [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(31,194,16,0.02)_2px,rgba(31,194,16,0.02)_4px),repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(5,142,63,0.02)_2px,rgba(5,142,63,0.02)_4px)] [background-size:20px_20px]"></div>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {columns.map((col, colIndex) => (
          <div key={colIndex} className="absolute top-0" style={{ left: col.left }}>
            {col.items.map((item, idx) => (
              <div
                key={idx}
                className="absolute text-[var(--accent-terminal)] text-xs font-mono"
                style={{
                  animation: `fall ${item.duration}s linear infinite`,
                  animationDelay: `${item.delay}s`,
                  top: "-200px",
                  opacity: item.opacity * 0.4,
                  textShadow: "0 0 6px rgba(31,194,16,0.35)",
                }}
              >
                {item.char}
              </div>
            ))}
          </div>
        ))}
      </div>


      <style>{`
        @keyframes fall {
          0% { transform: translateY(-200px); opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 0.3; }
          100% { transform: translateY(calc(100vh + 200px)); opacity: 0; }
        }
      `}</style>

      {/* Card Container */}
      <div className={cardClass}>

        <div className="flex flex-col items-center gap-3 pt-12 pb-8 px-10">
          <img
            src={logo}
            alt="Logo"
            className="drop-shadow-[0_0_10px_rgba(31,194,16,0.3)] cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={toggleAdminLogin}
            title="Click to toggle admin login"
          />
          <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {isAdminLogin ? "Admin Login" : step === "team-login" ? "CICS KASADYA 2026" : "Create Your Player Name"}
          </h2>
          {step === "team-login" && !isAdminLogin && (
            <p className="text-sm text-[var(--text-muted)] text-center max-w-sm leading-relaxed">
              Cyber Challenge & Logic Quest for the Brightest Minds
            </p>
          )}
        </div>

        <div className="px-10 pb-12 flex flex-col gap-5">
          {isAdminLogin ? (
            <form onSubmit={handleAdminLogin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2.5">
                <label className={labelClass}>Admin Name</label>
                <input
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Admin name"
                  required
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className={labelClass}>Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className={inputClass}
                />
              </div>
              <button className={buttonClass} >
                Admin Login
              </button>
            </form>
          ) : step === "team-login" ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2.5">
                <label className={labelClass}>Team Name / ID</label>
                <input
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  placeholder="Team Name / ID"
                  required
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className={labelClass}>Team Code</label>
                <input
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Team Code"
                  required
                  className={inputClass}
                />
              </div>
              <button className={buttonClass} >
                Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateUser} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2.5">
                <label className={labelClass}>Player Name</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your Name"
                  required
                  className={inputClass}
                />
              </div>
              <button className={buttonClass} >
                Submit
              </button>
            </form>
          )}

          {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
}
