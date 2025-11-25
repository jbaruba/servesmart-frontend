import api from './api';

export const getCategories      = () => api.get('/menu-categories');
export const getCategory        = (id) => api.get(`/menu-categories/${id}`);
export const createCategory     = (payload) => api.post('/menu-categories', payload);
export const updateCategory     = (id, payload) => api.put(`/menu-categories/${id}`, payload);
export const deleteCategory     = (id) => api.delete(`/menu-categories/${id}`);
export const getActiveCategories = () => api.get('/menu-categories/active');
