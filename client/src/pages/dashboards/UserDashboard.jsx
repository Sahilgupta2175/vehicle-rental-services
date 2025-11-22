import { useEffect, useState } from "react";
import { bookingApi } from "../../api/bookings";
import useSocket from "../../hooks/useSocket";

const UserDashboard = () => {
    const [bookings, setBookings] = useState([]);
    useSocket(); // enable realtime toasts

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await bookingApi.myBookings();
                setBookings(data.bookings || data);
            } catch (err) {
                console.error(err);
            }
        };

        load();
    }, []);

    return (
        <div className="space-y-4">
            <h1 className="text-lg font-semibold">My bookings</h1>
            <div className="grid gap-3">
                {bookings.map((b) => (
                    <div
                        key={b._id}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs flex justify-between"
                    >
                        <div>
                            <p className="font-medium">{b.vehicle?.name}</p>
                            <p className="text-slate-400">
                                {new Date(b.start).toLocaleString()} -{" "}
                                {new Date(b.end).toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] text-slate-400">Status</p>
                            <p className="text-[11px] uppercase text-primary-soft">
                                {b.status}
                            </p>
                            <p className="text-[11px] mt-1">
                                ₹{b.totalAmount?.toFixed(0) || "N/A"}
                            </p>
                        </div>
                    </div>
                ))}
                {bookings.length === 0 && (
                    <p className="text-xs text-slate-400">
                        No bookings yet. Browse vehicles to get started.
                    </p>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;