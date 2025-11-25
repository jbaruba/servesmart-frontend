import api from "./api";

// Nieuwe order aanmaken
export const createOrder = (payload) =>
  api.post("/orders", payload);
// payload voorbeeld:
// {
//   userId: 1,
//   restaurantTableId: 2, // of null
//   statusName: "NEW",    // mag ook wegblijven
//   items: [
//     { menuItemId: 10, quantity: 2, notes: "No onions" },
//     { menuItemId: 11, quantity: 1 }
//   ]
// }

export const getOrder = (id) =>
  api.get(`/orders/${id}`);

export const getOrdersByTable = (tableId) =>
  api.get(`/orders/table/${tableId}`);

export const getOrdersByStatus = (status) =>
  api.get(`/orders/status/${encodeURIComponent(status)}`);

export const updateOrderStatus = (id, statusName) =>
  api.patch(`/orders/${id}/status`, { statusName });

export const deleteOrder = (id) =>
  api.delete(`/orders/${id}`);
