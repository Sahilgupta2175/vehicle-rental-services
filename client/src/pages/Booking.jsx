import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Booking.css";
import { toast } from "react-toastify";
import { vehicleApi } from "../api/vehicles";
import { bookingApi } from "../api/bookings";

const Booking = () => {
    const { vehicleId } = useParams();
    const [vehicle, setVehicle] = useState(null);
    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(null);
    const [estimate, setEstimate] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();
        
        const load = async () => {
            try {
                const { data } = await vehicleApi.get(vehicleId, { signal: controller.signal });
                setVehicle(data.vehicle || data);
            } catch (err) {
                if (err.name === 'CanceledError') return; // Ignore cancelled requests
                toast.error("Failed to load vehicle");
            }
        };

        load();
        
        return () => controller.abort();
    }, [vehicleId]);

    const calculateEstimate = () => {
        if (!start || !end || !vehicle?.pricePerHour) {
            return;
        }
        
        const diffMs = end.getTime() - start.getTime();
        
        if (diffMs <= 0) {
            setEstimate(null);
            return;
        }

        const hours = Math.ceil(diffMs / (1000 * 60 * 60));

        setEstimate({
            hours,
            amount: hours * vehicle.pricePerHour,
        });
    };

    useEffect(() => {
        calculateEstimate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [start, end, vehicle]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!start || !end) {
            toast.error("Select start and end date/time");
            return;
        }
        
        if (end <= start) {
            toast.error("End must be after start");
            return;
        }
        
        try {
            setLoading(true);
            const payload = {
                vehicleId,
                start: start.toISOString(),
                end: end.toISOString(),
            };
            const { data } = await bookingApi.create(payload);
            toast.success("Booking created. Proceed to payment.");
            navigate(`/payment/${data.booking._id}`);
        } catch (err) {
            const msg = err.response?.data?.error || "Failed to create booking";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!vehicle) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-400">Loading vehicle details...</p>
                </div>
            </div>
        );
    }

    const primaryImage = vehicle.images?.[0]?.url;

    return (
        <div className="max-w-6xl mx-auto py-8 space-y-8">
            {/* Header Section */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Book Your Vehicle</h1>
                        <p className="text-slate-400">Select dates and confirm your reservation</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr,1.2fr] gap-8">
                {/* Left Column - Vehicle Info */}
                <div className="space-y-6">
                    {/* Vehicle Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        {/* Vehicle Image */}
                        {primaryImage && (
                            <div className="h-48 overflow-hidden bg-slate-800">
                                <img
                                    src={primaryImage}
                                    alt={vehicle.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        
                        {/* Vehicle Details */}
                        <div className="p-6 space-y-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">{vehicle.name}</h2>
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{vehicle.location?.city}, {vehicle.location?.state}</span>
                                </div>
                            </div>

                            {/* Price Display */}
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <p className="text-xs text-slate-500 mb-1">Rental Rate</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                        ₹{vehicle.pricePerHour}
                                    </span>
                                    <span className="text-slate-400">/hour</span>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-slate-300">Included</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-sm text-slate-400">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Insurance Coverage
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-slate-400">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        24/7 Support
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-slate-400">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Free Cancellation
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Booking Form */}
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Date Selection */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Select Rental Period
                                </h3>
                                
                                <div className="grid gap-4">
                                    {/* Start Date */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-300">
                                            Start date & time
                                        </label>
                                        <div className="relative">
                                            <ReactDatePicker
                                                selected={start}
                                                onChange={setStart}
                                                showTimeSelect
                                                timeFormat="HH:mm"
                                                timeIntervals={60}
                                                dateFormat="dd MMM yyyy, HH:mm"
                                                minDate={new Date()}
                                                placeholderText="Select start date and time"
                                                className="w-full px-5 py-4 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-base placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 focus:outline-none transition-all hover:bg-slate-800 cursor-pointer"
                                                calendarClassName="booking-calendar"
                                            />
                                            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* End Date */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-300">
                                            End date & time
                                        </label>
                                        <div className="relative">
                                            <ReactDatePicker
                                                selected={end}
                                                onChange={setEnd}
                                                showTimeSelect
                                                timeFormat="HH:mm"
                                                timeIntervals={60}
                                                dateFormat="dd MMM yyyy, HH:mm"
                                                minDate={start || new Date()}
                                                placeholderText="Select end date and time"
                                                className="w-full px-5 py-4 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-base placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 focus:outline-none transition-all hover:bg-slate-800 cursor-pointer"
                                                calendarClassName="booking-calendar"
                                            />
                                            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Estimate Display */}
                            {estimate && (
                                <div className="bg-linear-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-5 space-y-3">
                                    <h4 className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        Booking Summary
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-300">Duration</span>
                                            <span className="font-semibold text-white">{estimate.hours} hours</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-300">Rate per hour</span>
                                            <span className="font-semibold text-white">₹{vehicle.pricePerHour}</span>
                                        </div>
                                        <div className="border-t border-blue-500/30 pt-3 mt-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-base font-semibold text-slate-200">Total Amount</span>
                                                <span className="text-3xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                                    ₹{estimate.amount}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2">*Final amount including taxes will be shown at payment</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !start || !end}
                                className="w-full py-4 rounded-xl text-base font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02]"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        Confirm booking & pay
                                    </span>
                                )}
                            </button>

                            {/* Security Note */}
                            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Secure payment via Stripe / Razorpay
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Booking;