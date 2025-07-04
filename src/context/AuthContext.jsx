import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom"; // 👈 import this

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => initAuth());
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // 👈 get navigator instance

  function initAuth() {
    try {
      const storedToken = localStorage.getItem("token");
      const companies = JSON.parse(localStorage.getItem("companies") || "[]");
      const activeDb =
        localStorage.getItem("activeDb") || companies[0]?.db || null;

      let decoded = {};
      if (storedToken) {
        decoded = jwtDecode(storedToken);
        // if (decoded.exp * 1000 < Date.now()) logout();
      }

      return { token: storedToken, companies, activeDb, data: decoded };
    } catch (err) {
      console.error("❌ Auth init error:", err);
      return { token: null, companies: [], activeDb: null };
    }
  }

  const login = (newToken, companies, data) => {
    const activeDb = companies[0]?.db || null;
    localStorage.setItem("token", newToken);
    localStorage.setItem("companies", JSON.stringify(companies));
    localStorage.setItem("activeDb", activeDb);
    setUser({ ...data, companies });

    setAuth({ token: newToken, companies, activeDb, data });
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
  };

  const logout = async (redirect = true) => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("🛑 Logout failed or already expired:", err.message);
    } finally {
      localStorage.clear();
      setUser(null);
      setAuth({ token: null, companies: [], activeDb: null });
      delete api.defaults.headers.common["Authorization"];
      if (redirect) {
        try {
          navigate("/login");
        } catch {
          window.location.href = "/login"; // fallback
        }
      }
    }
  };

  const setActiveDb = (db) => {
    localStorage.setItem("activeDb", db);
    setAuth((prev) => ({ ...prev, activeDb: db }));
  };

  useEffect(() => {
    const checkToken = () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) return;

      try {
        const decoded = jwtDecode(storedToken);
        const isExpired = decoded.exp * 1000 < Date.now();

        if (isExpired) {
          console.warn("🔒 Token expired, logging out");
          logout();
        } else {
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;
        }
      } catch (err) {
        console.error("🛑 Invalid token, logging out", err);
        logout();
      }
    };

    checkToken();
  }, []); // ✅ safe, runs only once on mount

  // Refresh token on mount
  // useEffect(() => {
  //   if (!token) refreshToken();
  // }, []);

  useEffect(() => {
    const handleStorageChange = () => setAuth(initAuth());
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        setActiveDb,
        isAuthenticated: !!auth.token,
        isAdmin: !!auth.data?.isAdmin,
        power: !!auth.data?.isAdmin,
        userAccess: auth.data?.userAccess,
        userInfo: auth.data,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
