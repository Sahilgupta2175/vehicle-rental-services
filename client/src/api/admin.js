import api from "./axios";

export const adminApi = {
    stats: () => api.get("/admin/stats"),
    users: () => api.get("/admin/users"),
    approveVendor: (id) => api.post(`/admin/vendor/${id}/approve`),
    removeVendor: (id) => api.delete(`/admin/vendor/${id}/remove`),
    recentBookings: () => api.get("/admin/bookings/recent"),
    recentTransactions: () => api.get("/admin/transactions/recent"),
    downloadMonthlyReport: (year, month) => api.get(`/reports/monthly/${year}/${month}/download`, { 
            responseType: "blob",
        }),
};