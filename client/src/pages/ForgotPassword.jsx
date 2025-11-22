import React, { useState } from "react";
import { toast } from "react-toastify";
import { authApi } from "../api/auth";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            await authApi.forgotPassword({ email });
            toast.success("If this email is registered, reset link was sent.");
        } catch (err) {
            const msg = err.response?.data?.error || "Failed to request reset";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
            <h1 className="text-xl font-semibold mb-2">Forgot password</h1>
            <p className="text-xs text-slate-400 mb-4">
                Enter your registered email and we&apos;ll send you a link to reset
                your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div className="space-y-1">
                    <label>Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 rounded-xl bg-primary-soft hover:bg-primary-dark text-sm font-medium disabled:opacity-60 mt-2"
                >
                    {loading ? "Sending..." : "Send reset link"}
                </button>
            </form>
        </div>
    );
};

export default ForgotPassword;