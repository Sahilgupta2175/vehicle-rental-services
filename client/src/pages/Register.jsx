import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "../store/authStore";

const Register = () => {
    const { register, loading } = useAuthStore();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "user", // user or vendor
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await register(form);

        if (!res.success) {
            toast.error(res.message);
        } 
        else {
            toast.success("Account created successfully");
            navigate("/dashboard");
        }
    };

    return (
        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
            <h1 className="text-xl font-semibold mb-2">Create your account</h1>
            <p className="text-xs text-slate-400 mb-4">
                Choose user if you want to book vehicles. Choose vendor if you want to
                list your vehicles.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div className="space-y-1">
                    <label>Name</label>
                    <input
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-1">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-1">
                    <label>Password</label>
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
                    <label>Role</label>
                    <select name="role" value={form.role} onChange={handleChange}>
                        <option value="user">User (book vehicles)</option>
                        <option value="vendor">Vendor (list vehicles)</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 rounded-xl bg-primary-soft hover:bg-primary-dark text-sm font-medium disabled:opacity-60 mt-2"
                >
                    {loading ? "Creating account..." : "Sign up"}
                </button>
            </form>

            <p className="text-xs text-slate-400 mt-4 text-center">
                Already have an account?{" "}
                <Link
                    to="/login"
                    className="text-primary-soft hover:text-primary-dark"
                >
                    Login
                </Link>
            </p>
        </div>
    );
};

export default Register;