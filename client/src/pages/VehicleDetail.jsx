import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { vehicleApi } from "../api/vehicles";
import { toast } from "react-toastify";
import useAuthStore from "../store/authStore";

const VehicleDetail = () => {
    const { id } = useParams();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();
        
        const load = async () => {
            try {
                setLoading(true);
                const { data } = await vehicleApi.get(id, { signal: controller.signal });
                setVehicle(data.vehicle || data);
            } catch (err) {
                if (err.name === 'CanceledError') return; // Ignore cancelled requests
                console.error(err);
                toast.error("Failed to load vehicle");
            } finally {
                setLoading(false);
            }
        };

        load();
        
        return () => controller.abort();
    }, [id]);

    const handleBook = () => {
        if (!isAuthenticated) {
            toast.info("Please login to create a booking");
            navigate("/login", { state: { from: { pathname: `/vehicles/${id}` } } });
            return;
        }
        navigate(`/booking/${id}`);
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-400">Loading vehicle details...</p>
                </div>
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto">
                    <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-300">Vehicle not found</h2>
                <Link to="/vehicles" className="inline-block text-blue-400 hover:text-blue-300">
                    ← Back to all vehicles
                </Link>
            </div>
        );
    }

    const images = vehicle.images || [];
    const primaryImage = images[selectedImage]?.url || images[0]?.url;
    const typeIcons = {
        car: "🚗",
        bike: "🏍️",
        scooter: "🛵",
        other: "🚙"
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Back Button */}
            <Link 
                to="/vehicles" 
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 rounded-xl text-sm text-slate-300 hover:text-white transition-all group shadow-lg"
            >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back to all vehicles</span>
            </Link>

            <div className="grid lg:grid-cols-[1.5fr,1fr] gap-8">
                {/* Left Column - Images & Details */}
                <div className="space-y-6">
                    {/* Main Image */}
                    <div className="relative group">
                        <div 
                            className="w-full h-[320px] md:h-[400px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl shadow-blue-500/10"
                        >
                            {primaryImage ? (
                                <img
                                    src={primaryImage}
                                    alt={vehicle.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                                    <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-sm">No image available</p>
                                </div>
                            )}
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                            <span className={`px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-lg ${
                                vehicle.available 
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}>
                                {vehicle.available ? "Available" : "Not Available"}
                            </span>
                        </div>
                    </div>

                    {/* Thumbnail Gallery */}
                    {images.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`relative shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                                        selectedImage === idx 
                                            ? "border-blue-500 shadow-lg shadow-blue-500/30 scale-105" 
                                            : "border-slate-700 hover:border-slate-600"
                                    }`}
                                >
                                    <img
                                        src={img.url}
                                        alt={`View ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Vehicle Information Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                        {/* Header */}
                        <div className="space-y-3">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-white mb-2">{vehicle.name}</h1>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-sm">
                                            {vehicle.location?.city}, {vehicle.location?.state}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-5xl">{typeIcons[vehicle.type] || typeIcons.other}</div>
                            </div>
                        </div>

                        {/* Description */}
                        {vehicle.description && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Description</h3>
                                <p className="text-slate-400 leading-relaxed text-sm">
                                    {vehicle.description}
                                </p>
                            </div>
                        )}

                        {/* Specifications Grid */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Specifications</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Transmission</p>
                                            <p className="text-sm font-semibold text-slate-200">{vehicle.specifications?.transmission || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Fuel Type</p>
                                            <p className="text-sm font-semibold text-slate-200">{vehicle.specifications?.fuelType || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Seating</p>
                                            <p className="text-sm font-semibold text-slate-200">{vehicle.specifications?.seating ? `${vehicle.specifications.seating} Seats` : "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Category</p>
                                            <p className="text-sm font-semibold text-slate-200 capitalize">{vehicle.type}</p>
                                        </div>
                                    </div>
                                </div>

                                {vehicle.specifications?.year && (
                                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Year</p>
                                                <p className="text-sm font-semibold text-slate-200">{vehicle.specifications.year}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {vehicle.specifications?.mileage && (
                                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Mileage</p>
                                                <p className="text-sm font-semibold text-slate-200">{vehicle.specifications.mileage}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {vehicle.specifications?.color && (
                                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Color</p>
                                                <p className="text-sm font-semibold text-slate-200">{vehicle.specifications.color}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {vehicle.specifications?.registrationNumber && (
                                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 col-span-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Registration Number</p>
                                                <p className="text-sm font-semibold text-slate-200 uppercase tracking-wider">{vehicle.specifications.registrationNumber}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location Details */}
                        <div className="space-y-3 pt-4 border-t border-slate-800">
                            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Location</h3>
                            <div className="flex items-start gap-3 text-slate-400">
                                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <div className="text-sm">
                                    <p className="font-medium text-slate-300">{vehicle.location?.address}</p>
                                    <p>{vehicle.location?.city}, {vehicle.location?.state}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Booking Card */}
                <div className="lg:sticky lg:top-24 h-fit">
                    <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 space-y-6 shadow-2xl">
                        {/* Price Display */}
                        <div className="text-center space-y-2 pb-6 border-b border-slate-700">
                            <p className="text-sm text-slate-400">Price per hour</p>
                            <div className="flex items-baseline justify-center gap-2">
                                <span className="text-5xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    ₹{vehicle.pricePerHour}
                                </span>
                                <span className="text-slate-500">/hour</span>
                            </div>
                            <p className="text-xs text-slate-500">Competitive pricing with no hidden charges</p>
                        </div>

                        {/* Vendor Info */}
                        <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                                {(vehicle.vendor?.name || "V")[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Provided by</p>
                                <p className="font-semibold text-slate-200">{vehicle.vendor?.name || "Local vendor"}</p>
                            </div>
                        </div>

                        {/* Features List */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-300">What's included</h4>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-3 text-sm text-slate-400">
                                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    24/7 Customer Support
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-400">
                                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Insurance Covered
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-400">
                                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Free Cancellation
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-400">
                                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Sanitized & Clean
                                </li>
                            </ul>
                        </div>

                        {/* Book Button */}
                        <button
                            onClick={handleBook}
                            disabled={!vehicle.available}
                            className={`w-full py-4 rounded-xl text-base font-semibold transition-all shadow-lg ${
                                vehicle.available
                                    ? "bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02]"
                                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                            }`}
                        >
                            {vehicle.available ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Book Now
                                </span>
                            ) : (
                                "Currently Unavailable"
                            )}
                        </button>

                        {/* Security Badge */}
                        <div className="flex items-center gap-2 justify-center text-xs text-slate-500 pt-4 border-t border-slate-800">
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Secure payment via Stripe / Razorpay
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleDetail;