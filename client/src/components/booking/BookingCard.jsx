import React from "react";

const statusConfig = (status) => {
    switch (status) {
        case "pending":
            return {
                bg: "bg-gradient-to-r from-amber-500/20 to-orange-500/20",
                text: "text-amber-400",
                border: "border-amber-500/30",
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                label: "PENDING"
            };
        case "approved":
            return {
                bg: "bg-gradient-to-r from-emerald-500/20 to-green-500/20",
                text: "text-emerald-400",
                border: "border-emerald-500/30",
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                label: "APPROVED"
            };
        case "paid":
            return {
                bg: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20",
                text: "text-blue-400",
                border: "border-blue-500/30",
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                label: "PAID"
            };
        case "rejected":
            return {
                bg: "bg-gradient-to-r from-rose-500/20 to-red-500/20",
                text: "text-rose-400",
                border: "border-rose-500/30",
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                label: "REJECTED"
            };
        case "cancelled":
            return {
                bg: "bg-gradient-to-r from-gray-500/20 to-slate-500/20",
                text: "text-gray-400",
                border: "border-gray-500/30",
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ),
                label: "CANCELLED"
            };
        default:
            return {
                bg: "bg-slate-700/40",
                text: "text-slate-400",
                border: "border-slate-600/50",
                icon: null,
                label: status?.toUpperCase() || "UNKNOWN"
            };
    }
};

const formatDateTime = (date) => {
    const d = new Date(date);
    return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
};

const BookingCard = ({ booking, actions }) => {
    const status = statusConfig(booking.status);
    const startDateTime = formatDateTime(booking.start);
    const endDateTime = formatDateTime(booking.end);
    
    const calculateDuration = () => {
        const start = new Date(booking.start);
        const end = new Date(booking.end);
        const diffMs = end - start;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} ${hours % 24}h`;
        }
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    };

    return (
        <div className="group relative bg-linear-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(148 163 184) 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                }}></div>
            </div>

            {/* Status Bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${status.bg}`}></div>

            <div className="relative p-5">
                {/* Header Section */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <svg className="w-5 h-5 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <h3 className="text-base font-bold text-white truncate">{booking.vehicle?.name || "Vehicle"}</h3>
                        </div>
                        {booking.user?.name && (
                            <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>{booking.user.name}</span>
                            </p>
                        )}
                    </div>

                    {/* Status Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${status.border} ${status.bg} ${status.text} text-xs font-semibold`}>
                        {status.icon}
                        <span>{status.label}</span>
                    </div>
                </div>

                {/* Date & Time Section */}
                <div className="bg-slate-700/50 rounded-xl p-4 mb-4 border border-slate-600/30">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Start Date */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
                                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">Start</span>
                            </div>
                            <p className="text-sm font-semibold text-white">{startDateTime.date}</p>
                            <p className="text-xs text-emerald-400">{startDateTime.time}</p>
                        </div>

                        {/* End Date */}
                        <div className="space-y-1 border-l border-slate-700/50 pl-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
                                <svg className="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">End</span>
                            </div>
                            <p className="text-sm font-semibold text-white">{endDateTime.date}</p>
                            <p className="text-xs text-rose-400">{endDateTime.time}</p>
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="mt-3 pt-3 border-t border-slate-700/30 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-xs text-slate-300">
                            Duration: <span className="font-semibold text-blue-400">{calculateDuration()}</span>
                        </span>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="flex items-center justify-between gap-4">
                    {/* Amount */}
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Total Amount</p>
                            <p className="text-lg font-bold text-white">₹{booking.totalAmount?.toLocaleString() || 0}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    {actions && (
                        <div className="shrink-0">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingCard;