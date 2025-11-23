import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bookingApi } from "../api/bookings";
import Loader from "../components/common/Loader";
import { toast } from "react-toastify";

const BookingDetails = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const { data } = await bookingApi.getById(bookingId);
                
                // Only allow access if payment is completed
                if (data.payment?.status !== 'paid') {
                    toast.error("This page is only accessible after payment completion");
                    navigate("/dashboard");
                    return;
                }
                
                setBooking(data);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load booking details");
                navigate("/dashboard");
            } finally {
                setLoading(false);
            }
        };

        if (bookingId) {
            fetchBooking();
        }
    }, [bookingId, navigate]);

    if (loading) {
        return <Loader />;
    }

    if (!booking) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-400">Booking not found</p>
            </div>
        );
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const calculateDuration = () => {
        const start = new Date(booking.start);
        const end = new Date(booking.end);
        const hours = Math.ceil((end - start) / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        
        if (days > 0) {
            return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
        }
        return `${hours}h`;
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                bg: "bg-yellow-500/20",
                text: "text-yellow-400",
                border: "border-yellow-500/30",
                icon: "⏳",
                label: "Pending Approval"
            },
            approved: {
                bg: "bg-blue-500/20",
                text: "text-blue-400",
                border: "border-blue-500/30",
                icon: "✓",
                label: "Approved"
            },
            paid: {
                bg: "bg-emerald-500/20",
                text: "text-emerald-400",
                border: "border-emerald-500/30",
                icon: "✓",
                label: "Paid"
            },
            completed: {
                bg: "bg-purple-500/20",
                text: "text-purple-400",
                border: "border-purple-500/30",
                icon: "✓",
                label: "Completed"
            },
            rejected: {
                bg: "bg-red-500/20",
                text: "text-red-400",
                border: "border-red-500/30",
                icon: "✗",
                label: "Rejected"
            },
            cancelled: {
                bg: "bg-slate-500/20",
                text: "text-slate-400",
                border: "border-slate-500/30",
                icon: "✗",
                label: "Cancelled"
            }
        };
        return configs[status] || configs.pending;
    };

    const statusConfig = getStatusConfig(booking.status);

    return (
        <div className="min-h-[70vh] py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Success Banner */}
                {booking.payment?.status === 'paid' && (
                    <div className="bg-linear-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/50 rounded-2xl p-6 flex items-center gap-4 animate-fadeIn">
                        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-1">Payment Successful!</h2>
                            <p className="text-emerald-200">Your booking has been confirmed. We've sent the details to your email.</p>
                        </div>
                    </div>
                )}

                {/* Main Details Card */}
                <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-linear-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed</h1>
                                <div className="flex items-center gap-3">
                                    <code className="text-sm font-mono text-cyan-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-cyan-500/30">
                                        ID: {booking._id}
                                    </code>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(booking._id);
                                            toast.success("Booking ID copied!");
                                        }}
                                        className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                                        title="Copy Booking ID"
                                    >
                                        <svg className="w-4 h-4 text-slate-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                {statusConfig.icon} {statusConfig.label}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Vehicle Information */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Vehicle Details
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {booking.vehicle?.images?.[0] && (
                                    <div className="rounded-lg overflow-hidden border border-slate-700">
                                        <img 
                                            src={booking.vehicle.images[0].url} 
                                            alt={booking.vehicle.name}
                                            className="w-full h-48 object-cover"
                                        />
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="text-2xl font-bold text-white">{booking.vehicle?.name}</h4>
                                        <p className="text-slate-400 capitalize">{booking.vehicle?.type}</p>
                                    </div>
                                    {booking.vehicle?.description && (
                                        <p className="text-sm text-slate-400 line-clamp-3">{booking.vehicle.description}</p>
                                    )}
                                    {booking.vehicle?.location && (
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {booking.vehicle.location.address}, {booking.vehicle.location.city}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-400">Rate:</span>
                                        <span className="text-lg font-semibold text-amber-400">₹{booking.vehicle?.pricePerHour}/hr</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Booking Timeline */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Rental Period
                            </h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                                    <p className="text-xs text-slate-500 mb-1">Start Time</p>
                                    <p className="text-sm font-semibold text-white">{formatDate(booking.start)}</p>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                                    <p className="text-xs text-slate-500 mb-1">End Time</p>
                                    <p className="text-sm font-semibold text-white">{formatDate(booking.end)}</p>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                                    <p className="text-xs text-slate-500 mb-1">Duration</p>
                                    <p className="text-sm font-semibold text-white">{calculateDuration()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Payment Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b border-slate-700">
                                    <span className="text-slate-400">Payment Status</span>
                                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                                        booking.payment?.status === 'paid' 
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                    }`}>
                                        {booking.payment?.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                                    </span>
                                </div>
                                {booking.payment?.provider && (
                                    <div className="flex items-center justify-between py-2 border-b border-slate-700">
                                        <span className="text-slate-400">Payment Method</span>
                                        <span className="text-white font-medium capitalize">{booking.payment.provider}</span>
                                    </div>
                                )}
                                {booking.payment?.providerPaymentId && (
                                    <div className="flex items-center justify-between py-2 border-b border-slate-700">
                                        <span className="text-slate-400">Transaction ID</span>
                                        <code className="text-xs font-mono text-cyan-400 bg-slate-900 px-2 py-1 rounded border border-cyan-500/30">
                                            {booking.payment.providerPaymentId}
                                        </code>
                                    </div>
                                )}
                                <div className="flex items-center justify-between py-3 bg-linear-to-r from-emerald-600/20 to-emerald-500/20 px-4 rounded-lg border border-emerald-500/30 mt-4">
                                    <span className="text-white font-semibold text-lg">Total Amount</span>
                                    <span className="text-3xl font-bold text-emerald-400">₹{booking.totalAmount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Vendor Information */}
                        {booking.vendor && (
                            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Vendor Contact
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="font-medium">{booking.vendor.name}</span>
                                    </div>
                                    {booking.vendor.email && (
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            {booking.vendor.email}
                                        </div>
                                    )}
                                    {booking.vendor.phone && (
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {booking.vendor.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="bg-slate-800/50 border-t border-slate-700 p-6">
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all"
                            >
                                Back to Dashboard
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print Receipt
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetails;