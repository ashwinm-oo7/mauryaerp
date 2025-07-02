import axios from "axios";
import { jwtDecode } from "jwt-decode"; // ✅ CORRECT

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");

  if (token) {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = res.data.token;
        localStorage.setItem("token", newToken);
        config.headers.Authorization = `Bearer ${newToken}`;
      } catch (err) {
        console.log("🔁 Refresh failed, logging out");
        localStorage.clear();
        window.location.href = "/login";
      }
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;
