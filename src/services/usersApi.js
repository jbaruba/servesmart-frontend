import api from "./api";

export const getUsers = () => api.get("/users");

export const getUser = (id) => api.get(`/users/${id}`);

export const registerUser = (payload) =>
  api.post("/users/register", {
    email: payload.email,
    password: payload.password,
    firstName: payload.firstName,
    lastName: payload.lastName,
    address: payload.address,
    phoneNumber: payload.phoneNumber,
    role: payload.role,
    active: payload.active,
  });

export const updateUser = (id, payload) =>
  api.put(`/users/${id}`, payload);

export const changePassword = (id, payload) =>
  api.patch(`/users/${id}/password`, payload);

export const emailExists = (email) =>
  api.get(`/users/email-exists?email=${encodeURIComponent(email)}`);

export const deleteUser = (id) =>
  api.delete(`/users/${id}`);