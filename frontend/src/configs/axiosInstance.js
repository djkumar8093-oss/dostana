import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // replace with your Express app's base URL
  timeout: 1000000, // adjust the timeout as needed
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  // baseURL: "http://localhost:3000",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // ensure you store your token on the client side
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
