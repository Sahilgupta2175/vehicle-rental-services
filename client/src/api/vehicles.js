import api from "./axios";

export const vehicleApi = {
    list: (params, config) => api.get("/vehicles", { params, ...config }),

    get: (id, config) => api.get(`/vehicles/${id}`, config),

    create: (formData) => api.post("/vehicles", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    update: (id, formData) => api.put(`/vehicles/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    remove: (id) => api.delete(`/vehicles/${id}`),
};