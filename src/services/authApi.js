import api from "./api";

export const login = (payload) => api.post("/auth/login", payload);
