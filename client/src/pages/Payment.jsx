import { useParams } from "react-router-dom";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePayment from "../components/payment/StripePayment";
import RazorpayPayment from "../components/payment/RazorpayPayment";

const stripePromise = loadStripe( import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "" );

const Payment = () => {
    const { bookingId } = useParams();
    const [gateway, setGateway] = useState("razorpay"); // default for India

    return (
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-4 space-y-4">
            <h1 className="text-lg font-semibold mb-1">Complete your payment</h1>
            <p className="text-xs text-slate-400 mb-4">
                Booking ID: <span className="text-slate-200">{bookingId}</span>
            </p>

            <div className="flex text-xs bg-slate-800 rounded-xl p-1">
                <button
                    onClick={() => setGateway("razorpay")}
                    className={`flex-1 py-2 rounded-lg ${
                        gateway === "razorpay"
                        ? "bg-slate-950 text-slate-50"
                        : "text-slate-400"
                    }`}
                >
                    Razorpay
                </button>
                <button
                    onClick={() => setGateway("stripe")}
                    className={`flex-1 py-2 rounded-lg ${
                        gateway === "stripe"
                        ? "bg-slate-950 text-slate-50"
                        : "text-slate-400"
                    }`}
                >
                    Stripe
                </button>
            </div>

            {gateway === "razorpay" ? (
                <RazorpayPayment bookingId={bookingId} />
            ) : (
                <Elements stripe={stripePromise}>
                <StripePayment bookingId={bookingId} />
                </Elements>
            )}
        </div>
    );
};

export default Payment;