import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import PageContainer from "./components/common/PageContainer";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleRoute from "./components/common/RoleRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
// import Register from "./pages/Register";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";
// import VehicleList from "./pages/VehicleList";
// import VehicleDetail from "./pages/VehicleDetail";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";

// import UserDashboard from "./pages/dashboards/UserDashboard";
// import VendorDashboard from "./pages/dashboards/VendorDashboard";
// import AdminDashboard from "./pages/dashboards/AdminDashboard";

function App() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
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

                    {/* Protected: any logged-in user */}
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