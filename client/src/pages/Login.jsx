import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "../store/authStore";

const Login = () => {
    const { login, loading } = useAuthStore();
    const [form, setForm] = useState({ email: "", password: "" });
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/dashboard";

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(form);
        if (!res.success) {
        toast.error(res.message);
        } else {
        toast.success("Logged in successfully");
        navigate(from, { replace: true });
        }
    };

    return (
        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
            <h1 className="text-xl font-semibold mb-2">Welcome back</h1>
            <p className="text-xs text-slate-400 mb-4">
                Login to manage your bookings and vehicles.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1 text-xs">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-1 text-xs">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        required
                        value={form.password}
                        onChange={handleChange}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 rounded-xl bg-primary-soft hover:bg-primary-dark text-sm font-medium mt-2 disabled:opacity-60"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <div className="flex justify-between items-center mt-4 text-xs">
                <Link
                    to="/forgot-password"
                    className="text-primary-soft hover:text-primary-dark"
                >
                    Forgot password?
                </Link>
                <Link
                    to="/register"
                    className="text-slate-400 hover:text-slate-200"
                >
                    Don&apos;t have an account? Sign up
                </Link>
            </div>
        </div>
    );
};

export default Login;