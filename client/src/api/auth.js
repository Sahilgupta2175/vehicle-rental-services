import api from "./axios";

export const authApi = {
    register: (data) => api.post("/auth/register", data),
    login: (data) => api.post("/auth/login", data),
    adminLogin: (data) => api.post("/auth/admin/login", data),
    me: () => api.get("/auth/me"),
    
    verifyEmail: (token) => api.post("/auth/verify-email", { token }),
    resendVerification: () => api.post("/auth/resend-verification"),
    
    forgotPassword: (data) => api.post("/auth/forgot-password", data),
    resetPassword: (data) => api.post("/auth/reset-password", data),
    changePassword: (data) => api.post("/auth/change-password", data),
    
    updateProfile: (data) => api.put("/auth/profile", data),
    uploadProfilePicture: (formData) => api.post("/auth/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }),
};
