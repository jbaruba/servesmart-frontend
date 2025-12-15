import api from "./api";

export const getPaidOrders = () => api.get("/orders/paid");
export const getOpenOrdersByTable = () => api.get("/orders/open-by-table");
export const getOrder = (orderId) => api.get(`/orders/${orderId}`);
export const startOrderForTable = (payload) => api.post("/orders", payload);
export const addItemToOrder = (orderId, payload) => api.post(`/orders/${orderId}/items`, payload);
export const updateOrderItem = (orderId, itemId, payload) => api.put(`/orders/${orderId}/items/${itemId}`, payload);
export const removeOrderItem = (orderId, itemId) => api.delete(`/orders/${orderId}/items/${itemId}`);
