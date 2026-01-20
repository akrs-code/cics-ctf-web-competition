import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { buttonClass, leaderboardClass, scoreClass } from "../src/style.js";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


export default function AdminDashboard() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState([]);
  const [view, setView] = useState("leaderboard");

  useEffect(() => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const numColumns = 50;
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

  useEffect(() => {
    if (!admin?.token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const resLeaderboard = await axios.get(
          `${BACKEND_URL}/api/submissions/leaderboard`,
          { headers: { Authorization: `Bearer ${admin.token}` } }
        );

        const fetchedTeams = Array.isArray(resLeaderboard.data?.teams)
          ? resLeaderboard.data.teams
          : [];
        const fetchedUsers = Array.isArray(resLeaderboard.data?.users)
          ? resLeaderboard.data.users
          : [];

        setTeams(fetchedTeams);
        setUsers(fetchedUsers);

        const resSubmissions = await axios.get(
          `${BACKEND_URL}/api/submissions/allsubmissions`,
          { headers: { Authorization: `Bearer ${admin.token}` } }
        );

        const fetchedSubmissions = Array.isArray(resSubmissions.data)
          ? resSubmissions.data
          : Array.isArray(resSubmissions.data?.submissions)
            ? resSubmissions.data.submissions
            : [];

        setSubmissions(fetchedSubmissions);
      } catch (err) {
        console.error("Error fetching admin dashboard data:", err);
        setTeams([]);
        setUsers([]);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const socket = io(`${BACKEND_URL}`, { auth: { token: admin.token } });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("leaderboardUpdate", ({ teams, users, latestSubmission }) => {
      setTeams(Array.isArray(teams) ? teams : []);
      setUsers(Array.isArray(users) ? users : []);
      if (latestSubmission) {
        setSubmissions(prev => (Array.isArray(prev) ? [latestSubmission, ...prev] : [latestSubmission]));
      }
    });

    return () => socket.disconnect();
  }, [admin?.token]);

  return (
    <div className="h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden flex justify-center items-start py-24 px-8">
      <div className="w-full max-w-6xl">
        <div className="absolute inset-0 -z-5 bg-[var(--bg-secondary)]">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 [background:radial-gradient(ellipse_100%_100%_at_0%_0%,rgba(31,194,16,0.15),transparent_70%),radial-gradient(ellipse_100%_100%_at_100%_0%,rgba(5,142,63,0.12),transparent_70%),radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(31,194,16,0.1),transparent_80%),radial-gradient(ellipse_100%_100%_at_0%_100%,rgba(143,163,160,0.06),transparent_70%),radial-gradient(ellipse_100%_100%_at_100%_100%,rgba(5,142,63,0.1),transparent_70%),linear-gradient(135deg,#041212_0%,#051111_30%,#041212_60%,#000000_100%)]"></div>
          <div className="absolute inset-0 [background:linear-gradient(to_right,rgba(31,194,16,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(31,194,16,0.06)_1px,transparent_1px)] [background-size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black_40%,transparent_100%)]"></div>
          <div className="absolute inset-0 [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(31,194,16,0.02)_2px,rgba(31,194,16,0.02)_4px),repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(5,142,63,0.02)_2px,rgba(5,142,63,0.02)_4px)] [background-size:20px_20px]"></div>
        </div>

        <div className="absolute inset-0 -z-5 overflow-hidden">
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="absolute top-0" style={{ left: col.left }}>
              {col.items.map((item, idx) => (
                <div
                  key={idx}
                  className="absolute text-[var(--accent-terminal)] text-sm font-mono whitespace-nowrap"
                  style={{
                    animation: `fall ${item.duration}s linear infinite`,
                    animationDelay: `${item.delay}s`,
                    left: 0,
                    top: '-200px',
                    opacity: item.opacity,
                    textShadow: '0 0 5px rgba(31,194,16,0.5), 0 0 10px rgba(31,194,16,0.3)',
                  }}
                >
                  {item.char}
                </div>
              ))}
            </div>
          ))}
          <style>{`
            @keyframes fall {
              0% { transform: translateY(-200px); opacity: 0; }
              5% { opacity: 1; }
              95% { opacity: 0.3; }
              100% { transform: translateY(calc(100vh + 200px)); opacity: 0; }
            }
          `}</style>
        </div>
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h1 className="text-2xl font-bold tracking-tight font-roboto">
            Leaderboards
          </h1>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-inter px-3 py-4 rounded-full border backdrop-blur
              ${connected
                  ? "text-green-400 border-green-400/40 bg-green-400/10 shadow-[0_0_15px_rgba(34,197,94,0.35)]"
                  : "text-red-400 border-red-400/40 bg-red-400/10"
                }`}>

              {connected ? "LIVE" : "OFFLINE"}
            </span>
            {view === "leaderboard" ? (
              <button
                onClick={() => setView("logs")}
                className={buttonClass}>
                Show Logs
              </button>
            ) : (
              <button
                onClick={() => setView("leaderboard")}
                className={buttonClass}>
                Back to Leaderboard
              </button>
            )}
          </div>
        </div>

        {view === "leaderboard" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">

            {/* TEAM LEADERBOARD */}
            <div className="bg-[var(--bg-secondary)]/70 p-4 rounded-2xl border border-[var(--accent-terminal)]/20 shadow-lg shadow-[var(--accent-terminal)]/10">
              <h2 className="text-xl font-bold font-roboto mb-4 text-center mb-5 text-[var(--text-primary)]">Team Ranking</h2>
              {loading ? (
                <p className="text-center my-10">Loading teams...</p>
              ) : (
                <table className="w-full border-collapse text-sm">
                  <thead className="border-b border-[var(--accent-terminal)]/30 text-[var(--text-muted)]">
                    <tr>
                      <th className="font-inter py-1 text-center">#</th>
                      <th className="font-inter text-center">Team</th>
                      <th className="font-inter text-center">Score</th>
                      <th className="font-inter text-center">Solved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, idx) => (
                      <tr key={team._id} className="hover:bg-[var(--accent-terminal)]/10transition-all">
                        <td className="font-inter py-1 text-center">{idx + 1}</td>
                        <td className="font-inter font-medium text-center">{team.name}</td>
                        <td className="text-[var(--success)] font-bold drop-shadow-[0_0_6px_rgba(31,194,16,0.5)] text-center">{team.score}</td>
                        <td className="font-inter text-center">{team.completedQuestions?.length || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* USER LEADERBOARD */}
            <div className="bg-[var(--bg-secondary)]/70 p-4 rounded-2xl border border-[var(--accent-terminal)]/20 shadow-lg shadow-[var(--accent-terminal)]/10">
              <h2 className="text-xl font-bold font-roboto mb-4 text-center mb-5 text-[var(--text-primary)]">Individual Standing</h2>
              {loading ? (
                <p className="text-center my-10">Loading users...</p>
              ) : (
                <table className="w-full border-collapse text-sm">
                  <thead className="border-b border-[var(--accent-terminal)]/30 text-[var(--text-muted)]">
                    <tr>
                      <th className="font-inter py-1 text-center">#</th>
                      <th className="font-inter text-center">Player</th>
                      <th className="font-inter text-center">Team</th>
                      <th className="font-inter text-center">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr key={user._id} className="hover:bg-[var(--accent-terminal)]/10 transition-all">
                        <td className="font-inter py-1 text-center">{idx + 1}</td>
                        <td className="font-inter font-medium text-center">{user.name}</td>
                        <td className="font-inter text-sm text-[var(--text-muted)] text-center">{user.teamId?.name || "-"}</td>
                        <td className="text-[var(--success)] font-bold drop-shadow-[0_0_6px_rgba(31,194,16,0.5)] text-center">{user.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          // Submission logs
          <div className="bg-[var(--bg-secondary)]/70 p-4 rounded-2xl border border-[var(--accent-terminal)]/20 shadow-lg shadow-[var(--accent-terminal)]/10 relative z-10">
     <h2 className="text-xl font-bold font-roboto mb-4 text-center mb-5 text-[var(--text-primary)]">Submission Logs</h2>
            {loading ? (
              <p>Loading submissions...</p>
            ) : (
              <table className="w-full border-collapse text-sm">
                <thead className="border-b border-[var(--accent-terminal)]/30 text-[var(--text-muted)]">
                  <tr>
                    <th className="font-inter py-1 text-center">#</th>
                    <th className="font-inter text-center">Player</th>
                    <th className="font-inter text-center">Team</th>
                    <th className="font-inter text-center">Question</th>
                    <th className="font-inter text-center">Points</th>
                    <th className="font-inter text-center">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions
                    .filter(sub => sub.correct)
                    .map((sub, idx) => (
                      <tr key={sub._id} className="font-interhover:bg-[var(--accent-terminal)]/20 transition-colors">
                        <td className="py-1 font-inter text-center">{idx + 1}</td>
                        <td className="font-inter text-center">{sub.userId?.name || "-"}</td>
                        <td className="font-inter text-center">{sub.teamId?.name || "-"}</td>
                        <td className="font-inter text-center">{sub.questionId?.title || "-"}</td>
                        <td className="text-[var(--success)] font-bold drop-shadow-[0_0_6px_rgba(31,194,16,0.5)] text-center">{sub.pointsEarned}</td>
                        <td className="font-inter text-center">{sub.updatedAt ? new Date(sub.updatedAt).toLocaleString() : "-"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
