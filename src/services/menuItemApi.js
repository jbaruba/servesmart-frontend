import api from './api';

// Read
export const listMenuItems = (params = {}) =>
  api.get('/menu-items', { params }); // { categoryId, q? }

// Create
export const createMenuItem = (payload) =>
  api.post('/menu-items', payload); // { name, price, description?, active?, categoryId }

// Update
export const updateMenuItem = (id, payload) =>
  api.put(`/menu-items/${id}`, payload); // fields you want to change

// Delete
export const deleteMenuItem = (id) =>
  api.delete(`/menu-items/${id}`);
