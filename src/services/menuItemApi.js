import api from './api';

export const listMenuItems   = (categoryId) => api.get(`/menu/category/${categoryId}`);
export const getMenuItem     = (id) => api.get(`/menu/${id}`);
export const createMenuItem  = (payload) => api.post('/menu', payload);
export const updateMenuItem  = (id, payload) => api.put(`/menu/${id}`, payload);
export const deleteMenuItem  = (id) => api.delete(`/menu/${id}`);
export const listAllItems    = () => api.get('/menu');
