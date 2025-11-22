import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { vehicleApi } from "../api/vehicles";
import VehicleCard from "../components/vehicle/VehicleCard";

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);

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
        setShowFilters(false);
    };

    const clearFilters = () => {
        setFilters({
            q: "",
            city: "",
            type: "",
            minPrice: "",
            maxPrice: "",
        });
        setSearchParams({});
        loadVehicles();
    };

    const activeFiltersCount = Object.values(filters).filter(v => v).length;

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                        Browse Vehicles
                    </h1>
                    <p className="text-slate-400 mt-2">
                        {loading ? 'Loading...' : `${vehicles.length} vehicles available`}
                    </p>
                </div>
                
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn-secondary flex items-center gap-2 relative"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters
                    {activeFiltersCount > 0 && (
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="card p-6 animate-in slide-in-from-top">
                    <form onSubmit={applyFilters} className="space-y-6">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Search
                                </label>
                                <input
                                    name="q"
                                    value={filters.q}
                                    onChange={handleFilterChange}
                                    placeholder="Name, brand, model..."
                                    className="w-full"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    City
                                </label>
                                <input
                                    name="city"
                                    value={filters.city}
                                    onChange={handleFilterChange}
                                    placeholder="e.g. Mumbai, Delhi"
                                    className="w-full"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                    </svg>
                                    Type
                                </label>
                                <select
                                    name="type"
                                    value={filters.type}
                                    onChange={handleFilterChange}
                                    className="w-full"
                                >
                                    <option value="">All Types</option>
                                    <option value="car">Car</option>
                                    <option value="bike">Bike</option>
                                    <option value="scooter">Scooter</option>
                                    <option value="suv">SUV</option>
                                </select>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Price Range (₹/hr)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        name="minPrice"
                                        type="number"
                                        min="0"
                                        value={filters.minPrice}
                                        onChange={handleFilterChange}
                                        placeholder="Min"
                                        className="w-full"
                                    />
                                    <input
                                        name="maxPrice"
                                        type="number"
                                        min="0"
                                        value={filters.maxPrice}
                                        onChange={handleFilterChange}
                                        placeholder="Max"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                type="submit"
                                className="flex-1 btn-primary flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Apply Filters
                            </button>
                            {activeFiltersCount > 0 && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="sm:w-auto btn-secondary"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && !showFilters && (
                <div className="flex flex-wrap gap-2">
                    {Object.entries(filters).map(([key, value]) => {
                        if (!value) return null;
                        const labels = { q: 'Search', city: 'City', type: 'Type', minPrice: 'Min Price', maxPrice: 'Max Price' };
                        return (
                            <span key={key} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-sm">
                                <span className="text-slate-400">{labels[key]}:</span>
                                <span className="text-white font-medium">{value}</span>
                                <button
                                    onClick={() => {
                                        setFilters(f => ({ ...f, [key]: '' }));
                                        const newParams = { ...filters, [key]: '' };
                                        Object.keys(newParams).forEach(k => !newParams[k] && delete newParams[k]);
                                        setSearchParams(newParams);
                                        loadVehicles();
                                    }}
                                    className="text-slate-400 hover:text-white"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}

            {/* Vehicle Grid */}
            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="card p-6 space-y-4 animate-pulse">
                            <div className="h-56 bg-background-light rounded-xl"></div>
                            <div className="h-4 bg-background-light rounded w-3/4"></div>
                            <div className="h-3 bg-background-light rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : vehicles.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles.map((v) => (
                        <VehicleCard key={v._id} vehicle={v} />
                    ))}
                </div>
            ) : (
                <div className="card p-12 text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-slate-800 flex items-center justify-center">
                        <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white">No vehicles found</h3>
                        <p className="text-slate-400 mt-2">
                            Try adjusting your filters or search criteria
                        </p>
                    </div>
                    {activeFiltersCount > 0 && (
                        <button onClick={clearFilters} className="btn-secondary mx-auto">
                            Clear Filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default VehicleList;