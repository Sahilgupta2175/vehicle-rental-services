import api from "./axios";

export const paymentsApi = {
    // Stripe
    createStripeIntent: (bookingId) => api.post("/payments/stripe/create-intent", { bookingId }),

    // Razorpay
    createRazorpayOrder: (bookingId) => api.post("/payments/razorpay/create-order", { bookingId }),
    verifyRazorpayPayment: (payload) => api.post("/payments/razorpay/verify", payload),
};
