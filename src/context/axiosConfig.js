// axiosConfig.js
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const db = localStorage.getItem("activeDb"); // ← set this after login

  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (db) config.headers["x-db-name"] = db;

  return config;
});

export default instance;
