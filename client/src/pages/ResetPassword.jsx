import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authApi } from "../api/auth";

const ResetPassword = () => {
    const { token } = useParams();
    const [form, setForm] = useState({ password: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            await authApi.resetPassword({
                token,
                password: form.password,
            });
            toast.success("Password reset successfully");
            navigate("/login");
        } catch (err) {
            const msg = err.response?.data?.error || "Failed to reset password";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
            <h1 className="text-xl font-semibold mb-2">Reset password</h1>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div className="space-y-1">
                    <label>New password</label>
                    <input
                        type="password"
                        name="password"
                        required
                        minLength={6}
                        value={form.password}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-1">
                    <label>Confirm new password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        required
                        minLength={6}
                        value={form.confirmPassword}
                        onChange={handleChange}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 rounded-xl bg-primary-soft hover:bg-primary-dark text-sm font-medium disabled:opacity-60 mt-2"
                >
                    {loading ? "Resetting..." : "Reset password"}
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;