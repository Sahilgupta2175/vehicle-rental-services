import React from "react";

const statusColor = (status) => {
    switch (status) {
        case "pending":
            return "bg-amber-500/10 text-amber-400 border-amber-500/40";
        case "approved":
        case "paid":
            return "bg-emerald-500/10 text-emerald-400 border-emerald-500/40";
        case "rejected":
        case "cancelled":
            return "bg-rose-500/10 text-rose-400 border-rose-500/40";
        default:
            return "bg-slate-700/40 text-slate-200 border-slate-600/70";
    }
};

const BookingCard = ({ booking, actions }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs flex justify-between gap-3">
            <div className="space-y-1">
                <p className="font-medium">{booking.vehicle?.name}</p>
                <p className="text-slate-400">
                    {new Date(booking.start).toLocaleString()} –{" "}
                    {new Date(booking.end).toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500">
                    User: {booking.user?.name || "N/A"}
                </p>
            </div>
            <div className="text-right space-y-2">
                <span
                    className={
                        "inline-block text-[10px] px-2 py-1 rounded-full border " +
                        statusColor(booking.status)
                    }
                >
                    {booking.status?.toUpperCase()}
                </span>
                <p className="text-[11px]">
                    ₹{booking.totalAmount?.toFixed(0) || "N/A"}
                </p>
                {actions}
            </div>
        </div>
    );
};

export default BookingCard;