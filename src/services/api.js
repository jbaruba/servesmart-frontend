import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});


api.interceptors.request.use(
  (config) => {
    const url = config.url || "";
    const isAuthLogin =
      url.startsWith("/auth/login") || url.includes("/auth/login");

    if (!isAuthLogin) {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 ) {
      localStorage.removeItem("authUser");
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
