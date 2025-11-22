import api from "./axios";

export const adminApi = {
    stats: () => api.get("/admin/stats"),
    users: () => api.get("/admin/users"),
    approveVendor: (id) => api.post(`/admin/approve-vendor/${id}`),
    downloadMonthlyReport: (year, month) => api.get("/reports/monthly", { 
            params: { year, month },
            responseType: "blob",
        }),
};