import api from "./api";

export const getLoginLogsForUser = (userId) => api.get(`/login-logs/user/${userId}`);
