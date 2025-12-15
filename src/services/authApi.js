import api from "./api";

export const login = (payload) => api.post("/auth/login", payload);
export const logout = (userId) => api.post("/auth/logout", { userId });
