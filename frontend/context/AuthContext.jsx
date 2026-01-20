import { createContext, useState, useEffect } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [team, setTeam] = useState(
    () => JSON.parse(localStorage.getItem("team")) || null
  );
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user")) || null
  );
  const [socket, setSocket] = useState(null);
  
  useEffect(() => {
    if (!user?.token) return;

    const s = io(`${BACKEND_URL}`, {
      auth: { token: user.token },
      transports: [ "polling", "websocket"], 
    });

    s.on("connect", () => console.log("✅ Socket connected:", s.id));
    s.on("connect_error", (err) => console.error("❌ Socket connect error:", err));
    s.on("newQuestion", (question) => {
      window.dispatchEvent(
        new CustomEvent("new-question", { detail: question })
      );
    });

    s.on("questionSolved", ({ questionId, points, teamScore }) => {
      setTeam((prev) => {
        if (!prev) return prev;
        if (prev.completedQuestions?.includes(questionId)) return prev;

        const updated = {
          ...prev,
          completedQuestions: [...(prev.completedQuestions || []), questionId],
          score: teamScore ?? (prev.score || 0) + points,
        };

        localStorage.setItem("team", JSON.stringify(updated));
        return updated;
      });
    });

    setSocket(s);

    return () => s.disconnect();
  }, [user?.token]);

  const loginTeam = (teamData) => {
    const obj = {
      _id: teamData._id,
      name: teamData.name,
      score: teamData.score || 0,
      completedQuestions: teamData.completedQuestions || [],
    };
    setTeam(obj);
    localStorage.setItem("team", JSON.stringify(obj));
  };

  const createUser = (userData, token) => {
    const obj = {
      _id: userData.id || userData._id,
      name: userData.name,
      teamId: userData.teamId,
      score: userData.score || 0,
      token,
    };
    setUser(obj);
    localStorage.setItem("user", JSON.stringify(obj));
  };

  const logout = () => {
    setTeam(null);
    setUser(null);
    localStorage.removeItem("team");
    localStorage.removeItem("user");
    if (socket) socket.disconnect();
    setSocket(null);
  };

  return (
    <AuthContext.Provider
      value={{
        team,
        user,
        socket,
        loginTeam,
        setTeam,
        createUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
