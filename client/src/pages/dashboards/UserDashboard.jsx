import { useEffect, useState } from "react";
import { bookingApi } from "../../api/bookings";
import BookingCard from "../../components/booking/BookingCard";
import useSocket from "../../hooks/useSocket";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const UserDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [filter, setFilter] = useState("all");
    const navigate = useNavigate();
    useSocket(); // enable realtime toasts

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const { data } = await bookingApi.myBookings();
            setBookings(data.bookings || data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) {
            return;
        }

        try {
            await bookingApi.cancel(bookingId);
            toast.success("Booking cancelled successfully");
            loadBookings(); // Reload bookings
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to cancel booking");
        }
    };

    const filteredBookings = bookings.filter(b => {
        if (filter === "all") return true;
        return b.status === filter;
    });

    const getStats = () => {
        return {
            total: bookings.length,
            paid: bookings.filter(b => b.status === "paid").length,
            completed: bookings.filter(b => b.status === "completed").length,
            cancelled: bookings.filter(b => b.status === "cancelled").length,
        };
    };

    const stats = getStats();

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header Section */}
                <div className="relative overflow-hidden bg-linear-to-br from-slate-800 via-slate-800 to-blue-900/30 border border-slate-600/50 rounded-3xl p-8 shadow-2xl">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(148 163 184) 1px, transparent 0)',
                            backgroundSize: '48px 48px'
                        }}></div>
                    </div>

                    <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div className="flex items-start gap-5">
                            <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 via-blue-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/40 shrink-0">
                                <svg className="w-11 h-11 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-linear-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent mb-2">
                                    My Bookings
                                </h1>
                                <p className="text-slate-400 text-base">Track and manage all your vehicle reservations in one place</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate("/vehicles")}
                            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Book New Vehicle
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                        {[
                            { label: "Total", value: stats.total, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "blue", gradient: "from-blue-500/20 to-blue-600/20", border: "border-blue-500/30", text: "text-blue-400" },
                            { label: "Paid", value: stats.paid, icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", color: "cyan", gradient: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/30", text: "text-cyan-400" },
                            { label: "Completed", value: stats.completed, icon: "M5 13l4 4L19 7", color: "green", gradient: "from-green-500/20 to-emerald-500/20", border: "border-green-500/30", text: "text-green-400" },
                            { label: "Cancelled", value: stats.cancelled, icon: "M6 18L18 6M6 6l12 12", color: "red", gradient: "from-red-500/20 to-rose-500/20", border: "border-red-500/30", text: "text-red-400" },
                        ].map((stat) => (
                            <div key={stat.label} className={`bg-linear-to-br ${stat.gradient} border ${stat.border} rounded-2xl p-5 hover:scale-105 transition-all duration-300 backdrop-blur-sm`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center`}>
                                        <svg className={`w-5 h-5 ${stat.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
                                </div>
                                <p className={`text-3xl font-bold ${stat.text}`}>{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-2 border border-slate-700 shadow-xl">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: "all", label: "All Bookings", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
                            { value: "paid", label: "Paid", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" },
                            { value: "completed", label: "Completed", icon: "M5 13l4 4L19 7" },
                            { value: "cancelled", label: "Cancelled", icon: "M6 18L18 6M6 6l12 12" },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setFilter(tab.value)}
                                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                                    filter === tab.value
                                        ? "bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                                </svg>
                                {tab.label}
                                {tab.value !== "all" && stats[tab.value] > 0 && (
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                        filter === tab.value 
                                            ? "bg-white/20 text-white" 
                                            : "bg-slate-700 text-slate-300"
                                    }`}>
                                        {stats[tab.value]}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bookings List */}
                <div>
                    {filteredBookings.length > 0 ? (
                        <div className="grid gap-6">
                            {filteredBookings.map((b) => (
                                <BookingCard 
                                    key={b._id} 
                                    booking={b}
                                    actions={
                                        <div className="flex gap-2">
                                            {b.payment?.status === 'paid' && (
                                                <button
                                                    onClick={() => navigate(`/booking-details/${b._id}`)}
                                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View Details
                                                </button>
                                            )}
                                            {['approved', 'paid'].includes(b.status) && (
                                                <button
                                                    onClick={() => handleCancelBooking(b._id)}
                                                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-red-500/30"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-slate-800/30 backdrop-blur-sm rounded-3xl border border-slate-700 shadow-xl">
                            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-linear-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-2xl">
                                <svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-300 mb-4">
                                {filter === "all" ? "No bookings yet" : `No ${filter} bookings`}
                            </h3>
                            <p className="text-slate-500 text-lg mb-10 max-w-md mx-auto">
                                {filter === "all" 
                                    ? "Start your journey by browsing our collection of vehicles and make your first booking."
                                    : `You don't have any ${filter} bookings at the moment.`
                                }
                            </p>
                            {filter === "all" && (
                                <button
                                    onClick={() => navigate("/vehicles")}
                                    className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-base shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Browse Vehicles
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;