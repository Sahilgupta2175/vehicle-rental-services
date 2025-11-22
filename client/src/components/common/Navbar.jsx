import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import React from 'react';

const Navbar = () => {
    const { user, isAuthenticated, logout, init } = useAuthStore();
    const navigate = useNavigate();

    // Ensure auth state is initialized
    React.useEffect(() => {
        init();
    }, [init]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
            <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-soft to-accent flex items-center justify-center text-xs font-bold">
                        VR
                    </div>
                    <span className="font-semibold text-lg tracking-tight">
                        VehicleRent
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    <Link to="/vehicles" className="hover:text-primary-soft text-sm">
                        Browse
                    </Link>

                    {user?.role === "vendor" && (
                        <Link
                        to="/vendor"
                        className="text-sm px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700"
                        >
                        Vendor Panel
                        </Link>
                    )}

                    {user?.role === "admin" && (
                        <Link
                        to="/admin"
                        className="text-sm px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700"
                        >
                        Admin
                        </Link>
                    )}

                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/dashboard"
                                className="text-sm px-3 py-1.5 rounded-full bg-primary-soft hover:bg-primary-dark"
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-xs border border-slate-700 px-3 py-1.5 rounded-full hover:bg-slate-800"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-sm px-3 py-1.5 rounded-full border border-slate-700 hover:bg-slate-800"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="text-sm px-3 py-1.5 rounded-full bg-primary-soft hover:bg-primary-dark"
                            >
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;