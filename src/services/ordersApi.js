import api from "./api";

// "paid" bestaat niet -> gebruik status endpoint
export const getPaidOrders = () => api.get("/orders/status/PAID");

// (optioneel) open orders -> ook via status
export const getOpenOrdersByTable = (tableId) => api.get(`/orders/table/${tableId}`);

// bestaat al
export const getOrder = (orderId) => api.get(`/orders/${orderId}`);

// start order bestaat (POST /orders) maar jouw payload moet matchen met OrderCreateDto
export const startOrderForTable = (payload) => api.post("/orders/start", payload);


export const getOpenOrders = () => api.get("/orders/status/NEW");

export const addItemToOrder = (orderId, payload) => api.post(`/orders/${orderId}/items`, payload);
export const updateOrderItem = (orderId, itemId, payload) => api.put(`/orders/${orderId}/items/${itemId}`, payload);
export const removeOrderItem = (orderId, itemId) => api.delete(`/orders/${orderId}/items/${itemId}`);

export const payOrder = (orderId, payload) => api.post(`/orders/${orderId}/pay`, payload);