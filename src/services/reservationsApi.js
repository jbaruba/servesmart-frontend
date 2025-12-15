import api from "./api";

export const getReservations = () => api.get("/reservations");
export const createReservation = (payload) => api.post("/reservations", payload);
export const getReservation = (id) => api.get(`/reservations/${id}`);
export const getReservationsByStatus = (status) => api.get(`/reservations/status/${encodeURIComponent(status)}`);
export const getReservationsByTableAndRange = (tableId, start, end) => api.get(`/reservations/table/${tableId}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
export const updateReservation = (id, payload) => api.put(`/reservations/${id}`, payload);
export const deleteReservation = (id) => api.delete(`/reservations/${id}`);
