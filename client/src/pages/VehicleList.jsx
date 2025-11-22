import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { vehicleApi } from "../api/vehicles";
import VehicleCard from "../components/vehicle/VehicleCard";

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [filters, setFilters] = useState({
        q: searchParams.get("q") || "",
        city: searchParams.get("city") || "",
        type: searchParams.get("type") || "",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
    });

    const loadVehicles = async () => {
        try {
            setLoading(true);
            const params = {};

            if (filters.q) {
                params.q = filters.q;
            }

            if (filters.city) {
                params.city = filters.city;
            }

            if (filters.type) {
                params.type = filters.type;
            }

            if (filters.minPrice) {
                params.minPrice = filters.minPrice;
            }

            if (filters.maxPrice) {
                params.maxPrice = filters.maxPrice;
            }

            const { data } = await vehicleApi.list(params);
            setVehicles(data.vehicles || data);
        } catch (err) {
            console.error("Failed to load vehicles", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVehicles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilterChange = (e) => {
        setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const applyFilters = (e) => {
        e.preventDefault();
        const params = {};

        Object.entries(filters).forEach(([key, val]) => {
            if (val) {
                params[key] = val;
            }
        });
        
        setSearchParams(params);
        loadVehicles();
    };

    return (
        <div className="space-y-4">
            <h1 className="text-lg font-semibold">Browse vehicles</h1>

            <form
                onSubmit={applyFilters}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid md:grid-cols-4 gap-3 text-xs"
            >
                <div className="space-y-1">
                    <label>Search</label>
                    <input
                        name="q"
                        value={filters.q}
                        onChange={handleFilterChange}
                        placeholder="Name, brand, etc."
                    />
                </div>
                <div className="space-y-1">
                    <label>City</label>
                    <input
                        name="city"
                        value={filters.city}
                        onChange={handleFilterChange}
                        placeholder="City"
                    />
                </div>
                <div className="space-y-1">
                    <label>Type</label>
                    <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                    >
                        <option value="">Any</option>
                        <option value="car">Car</option>
                        <option value="bike">Bike</option>
                        <option value="scooter">Scooter</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label>Price range (per hour)</label>
                    <div className="flex gap-2">
                        <input
                            name="minPrice"
                            type="number"
                            min="0"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                            placeholder="Min"
                        />
                        <input
                            name="maxPrice"
                            type="number"
                            min="0"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                            placeholder="Max"
                        />
                    </div>
                </div>
                <div className="md:col-span-4 flex justify-end">
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-primary-soft hover:bg-primary-dark text-xs font-medium"
                    >
                        Apply filters
                    </button>
                </div>
            </form>

            {loading ? (
                <p className="text-sm text-slate-400">Loading vehicles...</p>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicles.map((v) => (
                        <VehicleCard key={v._id} vehicle={v} />
                    ))}
                    {vehicles.length === 0 && (
                        <p className="text-xs text-slate-400">
                        No vehicles found with selected filters.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default VehicleList;