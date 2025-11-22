import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { vehicleApi } from "../api/vehicles";
import { toast } from "react-toastify";
import useAuthStore from "../store/authStore";

const VehicleDetail = () => {
    const { id } = useParams();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const { data } = await vehicleApi.get(id);
                setVehicle(data.vehicle || data);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load vehicle");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    const handleBook = () => {
        if (!isAuthenticated) {
            toast.info("Please login to create a booking");
            navigate("/login", { state: { from: { pathname: `/vehicles/${id}` } } });
            return;
        }
        navigate(`/booking/${id}`);
    };

    if (loading || !vehicle) {
        return <p className="text-sm text-slate-400">Loading vehicle...</p>;
    }

    const images = vehicle.images || [];
    const primaryImage = vehicle.primaryImage || images[0]?.url;

    return (
        <div className="grid lg:grid-cols-[1.6fr,1fr] gap-6">
            <div className="space-y-4">
                <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                    {primaryImage ? (
                        <img
                            src={primaryImage}
                            alt={vehicle.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                            No image
                        </div>
                    )}
                </div>
                {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                        {images.map((img, idx) => (
                        <img
                            key={idx}
                            src={img.url}
                            alt="thumb"
                            className="w-20 h-16 rounded-lg object-cover border border-slate-700"
                        />
                        ))}
                    </div>
                )}
                <div className="space-y-2">
                    <h1 className="text-xl font-semibold">{vehicle.name}</h1>
                    <p className="text-xs text-slate-400">
                        {vehicle.location?.address},{" "}
                        {vehicle.location?.city}, {vehicle.location?.state}
                    </p>
                    <p className="text-xs text-slate-300 mt-2">
                        {vehicle.description || "No description provided."}
                    </p>
                </div>
            </div>

            <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 h-fit">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-slate-400">Price per hour</p>
                        <p className="text-lg font-semibold text-primary-soft">
                            ₹{vehicle.pricePerHour}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[11px] text-slate-400">Type</p>
                        <p className="text-xs uppercase">{vehicle.type}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                    <div>
                        <p className="text-slate-400 text-[11px]">Transmission</p>
                        <p>{vehicle.specs?.transmission || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[11px]">Fuel</p>
                        <p>{vehicle.specs?.fuel || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[11px]">Seats</p>
                        <p>{vehicle.specs?.seats || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[11px]">Vendor</p>
                        <p>{vehicle.vendor?.name || "Local vendor"}</p>
                    </div>
                </div>

                <button
                    onClick={handleBook}
                    className="w-full py-2 rounded-xl bg-primary-soft hover:bg-primary-dark text-sm font-medium mt-2"
                >
                    Book this vehicle
                </button>

                <p className="text-[11px] text-slate-500">
                    Payments are processed securely using Stripe / Razorpay.
                </p>

                <Link
                    to="/vehicles"
                    className="block text-[11px] text-slate-400 mt-2 underline underline-offset-2"
                >
                    Back to all vehicles
                </Link>
            </div>
        </div>
    );
};

export default VehicleDetail;