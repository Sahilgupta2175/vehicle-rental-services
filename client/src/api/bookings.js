import api from "./axios";

export const bookingApi = {
    create: (data) => api.post("/bookings", data),
    myBookings: () => api.get("/bookings/me"),
    vendorBookings: () => api.get("/bookings/vendor"),
    respond: (id, data) => api.post(`/bookings/${id}/respond`, data),
    getById: (id) => api.get(`/bookings/${id}`),
};
