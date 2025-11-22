import React, { useEffect, useState } from "react";
import { vehicleApi } from "../../api/vehicles";
import { bookingApi } from "../../api/bookings";
import VehicleForm from "../../components/vehicle/VehicleForm";
import BookingCard from "../../components/booking/BookingCard";
import { toast } from "react-toastify";
import useSocket from "../../hooks/useSocket";

const VendorDashboard = () => {
    const [tab, setTab] = useState("vehicles");
    const [vehicles, setVehicles] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useSocket();

    const loadVehicles = async () => {
        try {
            const { data } = await vehicleApi.list({ mine: true }); // you can support ?mine=true in backend
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
    }, []);

    const handleCreate = () => {
        setSelectedVehicle(null);
        setShowForm(true);
    };

    const handleEdit = (v) => {
        setSelectedVehicle(v);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this vehicle?")) {
            return;
        }
        
        try {
            await vehicleApi.remove(id);
            toast.success("Vehicle deleted");
            loadVehicles();
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            toast.error("Failed to delete vehicle");
        }
    };

    const handleBookingRespond = async (id, status) => {
        try {
            await bookingApi.respond(id, { status });
            toast.success(`Booking ${status}`);
            loadBookings();
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            toast.error("Failed to update booking");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold">Vendor dashboard</h1>
                {tab === "vehicles" && (
                    <button
                        onClick={handleCreate}
                        className="text-xs px-3 py-1.5 rounded-xl bg-primary-soft hover:bg-primary-dark"
                    >
                        + Add vehicle
                    </button>
                )}
            </div>

            <div className="flex text-xs bg-slate-900 rounded-xl p-1 border border-slate-800 w-fit">
                <button
                    onClick={() => setTab("vehicles")}
                    className={`px-3 py-1.5 rounded-lg ${ tab === "vehicles" ? "bg-slate-800" : "text-slate-400" }`}
                >
                    My vehicles
                </button>
                <button
                    onClick={() => setTab("bookings")}
                    className={`px-3 py-1.5 rounded-lg ${ tab === "bookings" ? "bg-slate-800" : "text-slate-400" }`}
                >
                    Bookings
                </button>
            </div>

            {tab === "vehicles" && (
                <div className="grid lg:grid-cols-[1.2fr,1fr] gap-4">
                    <div className="space-y-3">
                        {vehicles.map((v) => (
                            <div
                                key={v._id}
                                className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs flex justify-between gap-3"
                            >
                                <div>
                                    <p className="font-medium">{v.name}</p>
                                    <p className="text-slate-400">
                                        ₹{v.pricePerHour}/hr • {v.location?.city}
                                    </p>
                                </div>
                                <div className="space-x-2 whitespace-nowrap">
                                    <button
                                        onClick={() => handleEdit(v)}
                                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(v._id)}
                                        className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                        {vehicles.length === 0 && (
                            <p className="text-xs text-slate-400">
                                No vehicles yet. Click &quot;Add vehicle&quot; to create one.
                            </p>
                        )}
                    </div>

                    {showForm && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                            <h2 className="text-sm font-semibold mb-2">
                                {selectedVehicle ? "Edit vehicle" : "New vehicle"}
                            </h2>
                            <VehicleForm
                                initialData={selectedVehicle}
                                mode={selectedVehicle ? "edit" : "create"}
                                onSaved={() => {
                                    setShowForm(false);
                                    setSelectedVehicle(null);
                                    loadVehicles();
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {tab === "bookings" && (
                <div className="space-y-3">
                    {bookings.map((b) => (
                        <BookingCard
                            key={b._id}
                            booking={b}
                            actions={
                                b.status === "pending" && (
                                    <div className="space-x-1 mt-1">
                                        <button
                                            onClick={() => handleBookingRespond(b._id, "approved")}
                                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[11px]"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleBookingRespond(b._id, "rejected")}
                                            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-[11px]"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )
                            }
                        />
                    ))}
                    {bookings.length === 0 && (
                        <p className="text-xs text-slate-400">
                            No bookings yet for your vehicles.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default VendorDashboard;