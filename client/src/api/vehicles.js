import api from "./axios";

export const vehicleApi = {
    list: (params) => api.get("/vehicles", { params }),

    get: (id) => api.get(`/vehicles/${id}`),

    create: (formData) => api.post("/vehicles", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    update: (id, formData) => api.put(`/vehicles/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    remove: (id) => api.delete(`/vehicles/${id}`),
};