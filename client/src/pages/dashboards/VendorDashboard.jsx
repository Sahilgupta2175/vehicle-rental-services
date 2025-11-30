import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { vehicleApi } from "../../api/vehicles";
import { bookingApi } from "../../api/bookings";
import VehicleForm from "../../components/vehicle/VehicleForm";
import BookingCard from "../../components/booking/BookingCard";
import { toast } from "react-toastify";
import useSocket from "../../hooks/useSocket";
import { io } from "socket.io-client";
import useAuthStore from "../../store/authStore";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const VendorDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [tab, setTab] = useState("vehicles");
    const [vehicles, setVehicles] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useSocket();

    const loadVehicles = async () => {
        try {
            const { data } = await vehicleApi.list({ mine: true });
            setVehicles(data.vehicles || data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadBookings = async () => {
        try {
            const { data } = await bookingApi.vendorBookings();
            setBookings(data.bookings || data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([loadVehicles(), loadBookings()]);
        };
        fetchData();

        // Setup socket listener for booking cancellations
        if (user) {
            const token = localStorage.getItem("vr_token");
            const socket = io(SOCKET_URL, { auth: { token } });

            socket.on("booking:cancelled", (booking) => {
                toast.info(`Booking cancelled for ${booking.vehicle?.name || 'vehicle'}`);
                // Refresh vehicles to show updated availability
                loadVehicles();
                loadBookings();
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [user]);

    const handleCreate = () => {
        setSelectedVehicle(null);
        setShowModal(true);
    };

    const handleEdit = (v) => {
        setSelectedVehicle(v);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this vehicle?")) {
            return;
        }
        
        try {
            await vehicleApi.remove(id);
            toast.success("Vehicle deleted successfully");
            loadVehicles();
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            toast.error("Failed to delete vehicle");
        }
    };

    // Booking respond function removed - bookings are auto-approved

    const handleFormSaved = () => {
        setShowModal(false);
        setSelectedVehicle(null);
        loadVehicles();
    };

    const handleToggleAvailability = async (vehicleId, currentAvailability) => {
        try {
            await vehicleApi.toggleAvailability(vehicleId, !currentAvailability);
            toast.success(`Vehicle marked as ${!currentAvailability ? 'available' : 'unavailable'}`);
            loadVehicles();
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            toast.error("Failed to update vehicle availability");
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedVehicle(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                        Vendor Dashboard
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Manage your vehicles and bookings
                    </p>
                </div>
                {tab === "vehicles" && (
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Vehicle
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-slate-800/50 rounded-xl p-1.5 border border-slate-700 w-fit">
                <button
                    onClick={() => setTab("vehicles")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                        tab === "vehicles"
                            ? "bg-linear-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                            : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    My Vehicles
                    {vehicles.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
                            {vehicles.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setTab("bookings")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                        tab === "bookings"
                            ? "bg-linear-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                            : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Bookings
                    {bookings.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">
                            {bookings.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Vehicles Tab */}
            {tab === "vehicles" && (
                <div className="space-y-4">
                    {vehicles.length === 0 ? (
                        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
                            <svg className="w-20 h-20 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <h3 className="text-xl font-semibold text-slate-300 mb-2">No vehicles yet</h3>
                            <p className="text-slate-500 mb-6">Start by adding your first vehicle to the platform</p>
                            <button
                                onClick={handleCreate}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Your First Vehicle
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {vehicles.map((v) => (
                                <div
                                    key={v._id}
                                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-blue-500/30 transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                                                    {v.name}
                                                </h3>
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                                    v.available 
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                }`}>
                                                    {v.available ? '✓ Available' : '✗ Unavailable'}
                                                </span>
                                                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 capitalize">
                                                    {v.type}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="font-semibold text-amber-400">₹{v.pricePerHour}/hr</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span>{v.location?.city}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleToggleAvailability(v._id, v.available)}
                                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                                    v.available
                                                        ? 'bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 hover:border-red-600'
                                                        : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 hover:border-emerald-600'
                                                }`}
                                                title={v.available ? 'Mark as unavailable' : 'Mark as available'}
                                            >
                                                {v.available ? '✗ Unavailable' : '✓ Available'}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(v)}
                                                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-blue-500/50 font-medium text-sm transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(v._id)}
                                                className="px-4 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 hover:border-rose-600 font-medium text-sm transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Bookings Tab */}
            {tab === "bookings" && (
                <div className="space-y-4">
                    {bookings.length === 0 ? (
                        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
                            <svg className="w-20 h-20 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <h3 className="text-xl font-semibold text-slate-300 mb-2">No bookings yet</h3>
                            <p className="text-slate-500">Bookings for your vehicles will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((b) => (
                                <BookingCard
                                    key={b._id}
                                    booking={b}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modal for Vehicle Form */}
            {showModal && (
                <div 
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <div 
                        className="bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-slate-800 border-b border-slate-600 px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-xl font-bold text-slate-100">
                                {selectedVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <VehicleForm
                                initialData={selectedVehicle}
                                mode={selectedVehicle ? "edit" : "create"}
                                onSaved={handleFormSaved}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorDashboard;