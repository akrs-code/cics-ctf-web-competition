// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext.jsx";
import TeamLogin from "../pages/TeamLogin.jsx";
import { useAuth } from "../hooks/useAuth.js";
import AdminLeaderboard from "../pages/AdminLeaderboard.jsx"
import Home from "../pages/Home.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<TeamLogin />} />
          <Route path="/index.html" element={<Navigate to="/home" replace />} />
          <Route path="/admin" element={<AdminLeaderboard />} />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function PrivateRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default App;
