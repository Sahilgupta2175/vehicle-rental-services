import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import React from 'react';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
        setMobileMenuOpen(false);
    };

    return (
        <header className="border-b border-slate-700/50 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-black/10">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-amber-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/40 group-hover:shadow-blue-500/60 transition-all group-hover:scale-105">
                            VR
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-blue-100 to-amber-100 bg-clip-text text-transparent hidden sm:block">
                            VehicleRent
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2 lg:gap-3">
                        <Link 
                            to="/vehicles" 
                            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                        >
                            Browse Vehicles
                        </Link>

                        {user?.role === "vendor" && (
                            <Link
                                to="/vendor"
                                className="px-5 py-2 rounded-lg text-sm font-medium bg-linear-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 transition-all"
                            >
                                Vendor Panel
                            </Link>
                        )}

                        {user?.role === "admin" && (
                            <Link
                                to="/admin"
                                className="px-5 py-2 rounded-lg text-sm font-medium bg-linear-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all"
                            >
                                Admin Panel
                            </Link>
                        )}

                        {isAuthenticated ? (
                            <>
                                {/* Only show Dashboard for regular users, not vendors/admins */}
                                {user?.role === "user" && (
                                    <Link
                                        to="/dashboard"
                                        className="px-5 py-2 rounded-lg text-sm font-medium bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all"
                                    >
                                        Dashboard
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 hover:border-amber-500 hover:text-amber-400 text-slate-300 transition-all"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white transition-all"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2 rounded-lg text-sm font-medium bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all"
                                >
                                    Sign up
                                </Link>
                                <Link
                                    to="/admin/login"
                                    className="px-4 py-2 rounded-lg text-sm font-medium border border-cyan-700 hover:border-cyan-500 text-cyan-400 hover:text-cyan-300 transition-all flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                    </svg>
                                    Admin
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg border border-slate-700 hover:border-blue-500 transition-all"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 space-y-2 border-t border-slate-700/50 pt-4 animate-in slide-in-from-top">
                        <Link 
                            to="/vehicles" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-background-light transition-all"
                        >
                            Browse Vehicles
                        </Link>

                        {user?.role === "vendor" && (
                            <Link
                                to="/vendor"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-4 py-3 rounded-lg text-sm font-medium bg-linear-to-r from-amber-500 to-amber-600 text-white text-center shadow-lg shadow-amber-500/30"
                            >
                                Vendor Panel
                            </Link>
                        )}

                        {user?.role === "admin" && (
                            <Link
                                to="/admin"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-4 py-3 rounded-lg text-sm font-medium bg-linear-to-r from-purple-500 to-purple-600 text-white text-center shadow-lg shadow-purple-500/30"
                            >
                                Admin Panel
                            </Link>
                        )}

                        {isAuthenticated ? (
                            <>
                                {/* Only show Dashboard for regular users, not vendors/admins */}
                                {user?.role === "user" && (
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-3 rounded-lg text-sm font-medium bg-linear-to-r from-primary to-primary-dark text-white text-center"
                                    >
                                        Dashboard
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-3 rounded-lg text-sm font-medium border border-purple-800/50 text-slate-300 transition-all"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 rounded-lg text-sm font-medium border border-purple-800/50 text-slate-300 text-center"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 rounded-lg text-sm font-medium bg-linear-to-r from-primary to-primary-dark text-white text-center"
                                >
                                    Sign up
                                </Link>
                                <Link
                                    to="/admin/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border border-cyan-700/50 text-cyan-400"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                    </svg>
                                    Admin Login
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Navbar;