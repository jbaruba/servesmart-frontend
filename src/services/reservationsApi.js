import api from "./api";

// ❌ bestond niet in backend -> vervangen door status call
export const getReservations = (status = "PENDING") =>
  api.get(`/reservations/status/${encodeURIComponent(status)}`);

export const createReservation = (payload) => api.post("/reservations", payload);
export const getReservation = (id) => api.get(`/reservations/${id}`);
export const getReservationsByStatus = (status) =>
  api.get(`/reservations/status/${encodeURIComponent(status)}`);

export const getReservationsByTableAndRange = (tableId, start, end) =>
  api.get(
    `/reservations/table/${tableId}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
  );

export const updateReservation = (id, payload) => api.put(`/reservations/${id}`, payload);
export const deleteReservation = (id) => api.delete(`/reservations/${id}`);
