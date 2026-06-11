import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && token.trim().length > 0) {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  }

  return config;
});

export default API;
