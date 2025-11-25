import api from "./api";

export const getRestaurantTables = () =>
  api.get("/restaurant-tables");

export const getActiveRestaurantTables = () =>
  api.get("/restaurant-tables/active");

export const getRestaurantTablesByStatus = (status) =>
  api.get(`/restaurant-tables/status/${encodeURIComponent(status)}`);

export const getRestaurantTable = (id) =>
  api.get(`/restaurant-tables/${id}`);

export const createRestaurantTable = (payload) =>
  api.post("/restaurant-tables", payload);
// payload voorbeeld:
// {
//   label: "T1",
//   statusName: "AVAILABLE",
//   seats: 4,
//   active: true
// }

export const updateRestaurantTable = (id, payload) =>
  api.put(`/restaurant-tables/${id}`, payload);

export const deleteRestaurantTable = (id) =>
  api.delete(`/restaurant-tables/${id}`);
