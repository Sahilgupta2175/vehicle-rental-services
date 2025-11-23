import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePayment from "../components/payment/StripePayment";
import RazorpayPayment from "../components/payment/RazorpayPayment";

const stripePromise = loadStripe( import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "" );

const Payment = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [gateway, setGateway] = useState("razorpay"); // default for India

    const handlePaymentSuccess = () => {
        navigate(`/booking-details/${bookingId}`);
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-8 px-4">
            <div className="w-full max-w-2xl space-y-8">
                {/* Header Section */}
                <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-2">Complete Payment</h1>
                            <p className="text-slate-400 text-sm">Secure checkout for your vehicle booking</p>
                        </div>
                    </div>
                    
                    {/* Booking ID Display */}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Booking ID</span>
                            <div className="flex items-center gap-2">
                                <code className="text-sm font-mono text-cyan-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-cyan-500/30">
                                    {bookingId}
                                </code>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(bookingId)}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                    title="Copy Booking ID"
                                >
                                    <svg className="w-4 h-4 text-slate-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Method Selection */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Select Payment Method
                    </h2>

                    {/* Payment Gateway Tabs */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button
                            onClick={() => setGateway("razorpay")}
                            className={`group relative p-6 rounded-xl border-2 transition-all ${
                                gateway === "razorpay"
                                    ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                            }`}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                    gateway === "razorpay" 
                                        ? "bg-blue-500 shadow-lg shadow-blue-500/30" 
                                        : "bg-slate-700"
                                }`}>
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <span className={`font-semibold text-base ${
                                    gateway === "razorpay" ? "text-white" : "text-slate-400"
                                }`}>
                                    Razorpay
                                </span>
                                <span className="text-xs text-slate-500">UPI, Cards, Netbanking</span>
                            </div>
                            {gateway === "razorpay" && (
                                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </button>

                        <button
                            onClick={() => setGateway("stripe")}
                            className={`group relative p-6 rounded-xl border-2 transition-all ${
                                gateway === "stripe"
                                    ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                            }`}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                    gateway === "stripe" 
                                        ? "bg-purple-500 shadow-lg shadow-purple-500/30" 
                                        : "bg-slate-700"
                                }`}>
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <span className={`font-semibold text-base ${
                                    gateway === "stripe" ? "text-white" : "text-slate-400"
                                }`}>
                                    Stripe
                                </span>
                                <span className="text-xs text-slate-500">Credit/Debit Cards</span>
                            </div>
                            {gateway === "stripe" && (
                                <div className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Payment Component */}
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                        {gateway === "razorpay" ? (
                            <RazorpayPayment bookingId={bookingId} onSuccess={handlePaymentSuccess} />
                        ) : (
                            <Elements stripe={stripePromise}>
                                <StripePayment bookingId={bookingId} onSuccess={handlePaymentSuccess} />
                            </Elements>
                        )}
                    </div>

                    {/* Security Info */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Your payment information is encrypted and secure</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;