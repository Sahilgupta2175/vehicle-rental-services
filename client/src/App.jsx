import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import PageContainer from "./components/common/PageContainer.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleRoute from "./components/common/RoleRoute";
import useAuthStore from "./store/authStore";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VehicleList from "./pages/VehicleList";
import VehicleDetail from "./pages/VehicleDetail";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import BookingDetails from "./pages/BookingDetails";
import Profile from "./pages/Profile";

import UserDashboard from "./pages/dashboards/UserDashboard";
import VendorDashboard from "./pages/dashboards/VendorDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminSignup from "./pages/admin/AdminSignup";

function App() {
    const { init, initialized } = useAuthStore();

    useEffect(() => {
        init();
    }, [init]);

    // Show loading screen only during initial auth check
    if (!initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-900 text-slate-50">
            <Navbar />
            <PageContainer>
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<Home />} />
                    <Route path="/vehicles" element={<VehicleList />} />
                    <Route path="/vehicles/:id" element={<VehicleDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    
                    {/* Admin Auth */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/signup" element={<AdminSignup />} />

                    {/* Protected: any logged-in user */}
                    <Route
                        path="/profile"
                        element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/booking/:vehicleId"
                        element={
                        <ProtectedRoute>
                            <Booking />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payment/:bookingId"
                        element={
                        <ProtectedRoute>
                            <Payment />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/booking-details/:bookingId"
                        element={
                        <ProtectedRoute>
                            <BookingDetails />
                        </ProtectedRoute>
                        }
                    />

                    {/* User Dashboard */}
                    <Route
                        path="/dashboard"
                        element={
                        <ProtectedRoute>
                            <UserDashboard />
                        </ProtectedRoute>
                        }
                    />

                    {/* Vendor Dashboard */}
                    <Route
                        path="/vendor"
                        element={
                        <RoleRoute allowedRoles={["vendor", "admin"]}>
                            <VendorDashboard />
                        </RoleRoute>
                        }
                    />

                    {/* Admin Dashboard */}
                    <Route
                        path="/admin"
                        element={
                        <RoleRoute allowedRoles={["admin"]}>
                            <AdminDashboard />
                        </RoleRoute>
                        }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </PageContainer>
        </div>
    );
}

export default App;