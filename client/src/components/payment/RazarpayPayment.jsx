import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { paymentsApi } from "../../api/payments";

const loadRazorpayScript = () => { 
    new Promise((resolve) => {
        if (document.getElementById("razorpay-sdk")) {
            return resolve(true);
        }
        
        const script = document.createElement("script");
        script.id = "razorpay-sdk";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

const RazorpayPayment = ({ bookingId, onSuccess }) => {
    const [order, setOrder] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(false);
    const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

    useEffect(() => {
        const init = async () => {
            try {
                const { data } = await paymentsApi.createRazorpayOrder(bookingId);
                setOrder(data);
            } catch (err) {
                console.error(err);
                toast.error("Failed to init Razorpay payment");
            }
        };

        if (bookingId) {
            init();
        }

    }, [bookingId]);

    const handlePay = async () => {
        if (!order) {
            return;
        }
        
        const loaded = await loadRazorpayScript();
        
        if (!loaded) {
            toast.error("Failed to load Razorpay SDK");
            return;
        }

        const options = {
            key: RAZORPAY_KEY,
            amount: order.amount,
            currency: order.currency,
            name: "VehicleRent",
            description: "Booking payment",
            order_id: order.orderId || order.id,
            handler: async (response) => {
                try {
                    await paymentsApi.verifyRazorpayPayment({
                        bookingId,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    });
                    toast.success("Payment successful");
                    onSuccess && onSuccess(response);
                } catch (err) {
                    console.error(err);
                    toast.error("Payment verification failed");
                }
            },
            theme: {
                color: "#4f46e5",
            },
        };

        const rz = new window.Razorpay(options);
        rz.open();
    };

    return (
        <div className="space-y-3 text-xs">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3">
                <p className="text-slate-300">Pay securely via UPI / Card / Netbanking</p>
                {order && (
                    <p className="text-[11px] text-slate-500 mt-1">
                        Amount: ₹{order.amount / 100} {order.currency}
                    </p>
                )}
            </div>
            <button
                type="button"
                disabled={!order || loading}
                onClick={handlePay}
                className="w-full py-2 rounded-xl bg-accent hover:bg-orange-500 text-sm font-medium disabled:opacity-60"
            >
                {loading ? "Processing..." : "Pay with Razorpay"}
            </button>
        </div>
    );
};

export default RazorpayPayment;