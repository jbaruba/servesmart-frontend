import api from "./api";

// Reservering maken
export const createReservation = (payload) =>
  api.post("/reservations", payload);
// payload voorbeeld:
// {
//   restaurantTableId: 1,
//   fullName: "John Doe",
//   partySize: 4,
//   phoneNumber: "0612345678",
//   eventDateTime: "2025-11-25T19:30:00",
//   statusName: "PENDING" // optioneel
// }

export const getReservation = (id) =>
  api.get(`/reservations/${id}`);

export const getReservationsByStatus = (status) =>
  api.get(`/reservations/status/${encodeURIComponent(status)}`);

// start en end moeten ISO strings zijn (new Date().toISOString())
export const getReservationsByTableAndRange = (tableId, start, end) =>
  api.get(
    `/reservations/table/${tableId}?start=${encodeURIComponent(
      start
    )}&end=${encodeURIComponent(end)}`
  );

export const updateReservation = (id, payload) =>
  api.put(`/reservations/${id}`, payload);

export const deleteReservation = (id) =>
  api.delete(`/reservations/${id}`);
