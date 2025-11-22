import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
        const load = async () => {
            try {
                const { data } = await vehicleApi.get(vehicleId);
                setVehicle(data.vehicle || data);
            } catch (err) {
                toast.error("Failed to load vehicle");
            }
        };

        load();
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
        return <p className="text-sm text-slate-400">Loading vehicle...</p>;
    }

    return (
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-4">
            <h1 className="text-lg font-semibold mb-1">Book {vehicle.name}</h1>
            <p className="text-xs text-slate-400 mb-4">
                {vehicle.location?.city}, {vehicle.location?.state}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label>Start date & time</label>
                        <ReactDatePicker
                            selected={start}
                            onChange={setStart}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={60}
                            dateFormat="dd MMM yyyy HH:mm"
                            minDate={new Date()}
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-1">
                        <label>End date & time</label>
                        <ReactDatePicker
                            selected={end}
                            onChange={setEnd}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={60}
                            dateFormat="dd MMM yyyy HH:mm"
                            minDate={start || new Date()}
                            className="w-full"
                        />
                    </div>
                </div>

                {estimate && (
                    <div className="bg-slate-800 rounded-xl p-3 text-xs flex justify-between items-center">
                        <div>
                            <p className="text-slate-300">
                                Estimated duration: {estimate.hours} hours
                            </p>
                            <p className="text-slate-500">
                                Rate: ₹{vehicle.pricePerHour}/hr
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400">Estimated amount</p>
                            <p className="text-base font-semibold text-primary-soft">
                                ₹{estimate.amount}
                            </p>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 rounded-xl bg-primary-soft hover:bg-primary-dark text-sm font-medium disabled:opacity-60"
                >
                    {loading ? "Creating booking..." : "Confirm booking & pay"}
                </button>
            </form>
        </div>
    );
};

export default Booking;