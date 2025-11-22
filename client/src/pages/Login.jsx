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
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8 space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/40">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold">Welcome Back</h1>
                    <p className="text-slate-400">
                        Login to manage your bookings and vehicles
                    </p>
                </div>

                {/* Form Card */}
                <div className="card p-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full"
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-purple-800/50 bg-background-card" />
                                Remember me
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Logging in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-purple-900/30"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-background-card text-slate-500">Don't have an account?</span>
                        </div>
                    </div>

                    {/* Register Link */}
                    <Link
                        to="/register"
                        className="block w-full text-center btn-secondary"
                    >
                        Create Account
                    </Link>
                </div>

                {/* Additional Info */}
                <p className="text-center text-xs text-slate-500 mt-6">
                    By continuing, you agree to our{" "}
                    <a href="#" className="text-blue-400 hover:text-blue-300">Terms of Service</a>
                    {" "}and{" "}
                    <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
                </p>
            </div>
        </div>
    );
};

export default Login;