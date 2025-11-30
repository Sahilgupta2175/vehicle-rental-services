import { useEffect, useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import { paymentsApi } from "../../api/payments";

const StripePayment = ({ bookingId, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [clientSecret, setClientSecret] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const { data } = await paymentsApi.createStripeIntent(bookingId);
                setClientSecret(data.clientSecret);
            // eslint-disable-next-line no-unused-vars
            } catch (err) {
                toast.error("Failed to init Stripe payment");
            }
        };

        if (bookingId) {
            init();
        }

    }, [bookingId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements || !clientSecret) {
            return;
        }

        setLoading(true);
        const card = elements.getElement(CardElement);
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card, },
        });

        if (error) {
            toast.error(error.message || "Payment failed");
        } 
        else if (paymentIntent.status === "succeeded") {
            toast.success("Payment successful");
            if (onSuccess) {
                setTimeout(() => onSuccess(paymentIntent), 1000);
            }
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="bg-slate-800 border border-slate-600 rounded-xl p-3">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: "14px",
                                color: "#e5e7eb",
                                "::placeholder": { color: "#6b7280" },
                            },
                            invalid: { color: "#f97373" },
                        },
                    }}
                />
            </div>
            <button
                type="submit"
                disabled={!stripe || loading || !clientSecret}
                className="w-full py-2 rounded-xl bg-primary-soft hover:bg-primary-dark text-sm font-medium disabled:opacity-60"
            >
                {loading ? "Processing..." : "Pay with Stripe"}
            </button>
        </form>
    );
};

export default StripePayment;