import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // ✅ CORRECT
import api from "../utils/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const getInitialAuth = () => {
    try {
      const token = localStorage.getItem("token");
      const companies = JSON.parse(localStorage.getItem("companies") || "[]");
      const activeDb =
        localStorage.getItem("activeDb") || companies[0]?.db || null;
      let decoded = {};
      if (token) decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        // token expired
        logout();
      }

      return { token, companies, activeDb, data: decoded };
    } catch (error) {
      console.error("❌ Error reading from localStorage:", error);
      return { token: null, companies: [], activeDb: null };
    }
  };

  const [auth, setAuth] = useState(getInitialAuth);
  console.log("isadmin", auth);

  const login = (token, companies, data) => {
    const activeDb = companies[0]?.db || null;

    localStorage.setItem("token", token);
    localStorage.setItem("companies", JSON.stringify(companies));
    localStorage.setItem("activeDb", activeDb);

    setAuth({ token, companies, activeDb, data });
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const setActiveDb = (db) => {
    localStorage.setItem("activeDb", db);
    setAuth((prev) => ({ ...prev, activeDb: db }));
  };

  const logout = () => {
    localStorage.clear();
    setAuth({ token: null, companies: [], activeDb: null });
    api.defaults.headers.common["Authorization"] = null;
  };

  // Optional: keep localStorage in sync if auth state is updated elsewhere
  useEffect(() => {
    const handleStorageChange = () => {
      setAuth(getInitialAuth());
    };

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
        userAccess: auth.data?.userAccess, // ✅ Add this line
        power: !!auth.data?.isAdmin, // ← add this
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
