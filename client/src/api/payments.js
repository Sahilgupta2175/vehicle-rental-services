import api from "./axios";

export const paymentsApi = {
    // Razorpay
    createRazorpayOrder: (bookingId) => api.post("/payments/razorpay/create-order", { bookingId }),
    verifyRazorpayPayment: (payload) => api.post("/payments/razorpay/verify", payload),
};
