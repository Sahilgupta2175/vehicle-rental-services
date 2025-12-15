import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { vehicleApi } from "../api/vehicles";
import VehicleCard from "../components/vehicle/VehicleCard";
import useGeolocation from "../hooks/useGeolocation";
import { toast } from "react-toastify";

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);
    const [isNearbySearch, setIsNearbySearch] = useState(false);
    const [nearbyInfo, setNearbyInfo] = useState(null);
    const { location, error: locationError, loading: locationLoading, getLocation, clearError } = useGeolocation();

    const [filters, setFilters] = useState({
        q: searchParams.get("q") || "",
        city: searchParams.get("city") || "",
        type: searchParams.get("type") || "",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        radius: searchParams.get("radius") || "",
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
        const controller = new AbortController();
        
        const load = async () => {
            try {
                setLoading(true);
                const params = {};

                if (filters.q) params.q = filters.q;
                if (filters.city) params.city = filters.city;
                if (filters.type) params.type = filters.type;
                if (filters.minPrice) params.minPrice = filters.minPrice;
                if (filters.maxPrice) params.maxPrice = filters.maxPrice;

                const { data } = await vehicleApi.list(params, { signal: controller.signal });
                setVehicles(data.vehicles || data);
            } catch (err) {
                if (err.name === 'CanceledError') return; // Ignore cancelled requests
                console.error("Failed to load vehicles", err);
            } finally {
                setLoading(false);
            }
        };
        
        load();
        
        return () => controller.abort();
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

    const clearFilters = async () => {
        const emptyFilters = {
            q: "",
            city: "",
            type: "",
            minPrice: "",
            maxPrice: "",
            radius: "50",
        };
        setFilters(emptyFilters);
        setSearchParams({});
        setIsNearbySearch(false);
        setNearbyInfo(null);
        
        // Fetch all vehicles with no filters
        try {
            setLoading(true);
            const { data } = await vehicleApi.list({});
            setVehicles(data.vehicles || data);
        } catch (err) {
            console.error("Failed to load vehicles", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFindNearby = () => {
        clearError();
        getLocation();
    };

    // Handle location change for nearby search
    useEffect(() => {
        if (location && !locationError) {
            loadNearbyVehicles();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    // Handle location errors
    useEffect(() => {
        if (locationError) {
            toast.error(locationError.message);
        }
    }, [locationError]);

    const loadNearbyVehicles = async () => {
        if (!location) return;

        try {
            setLoading(true);
            setIsNearbySearch(true);

            const params = {
                lat: location.lat,
                lng: location.lng,
                radius: filters.radius || 50,
            };

            if (filters.type) params.type = filters.type;
            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;

            const { data } = await vehicleApi.nearby(params);
            
            setVehicles(data.vehicles || []);
            setNearbyInfo({
                count: data.count,
                radius: data.radius,
                userLocation: data.userLocation
            });

            if (data.count === 0) {
                toast.info(`No vehicles found within ${data.radius}km. Try increasing the search radius.`);
            } else {
                toast.success(`Found ${data.count} vehicles near you!`);
            }
        } catch (err) {
            console.error("Failed to load nearby vehicles", err);
            toast.error("Failed to load nearby vehicles");
        } finally {
            setLoading(false);
        }
    };

    // Count active filters, excluding radius unless in nearby search mode
    const activeFiltersCount = Object.entries(filters)
        .filter(([key, value]) => {
            if (key === 'radius' && !isNearbySearch) return false;
            return value;
        })
        .length;

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        {isNearbySearch ? 'Nearby Vehicles' : 'Browse Vehicles'}
                    </h1>
                    <p className="text-slate-400 mt-2">
                        {loading ? 'Loading...' : `${vehicles.length} vehicles available`}
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <button
                        onClick={handleFindNearby}
                        disabled={locationLoading}
                        className="btn-primary flex items-center gap-2"
                    >
                        {locationLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Getting Location...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Find Nearby
                            </>
                        )}
                    </button>
                    
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="btn-secondary flex items-center gap-2 relative"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                        {activeFiltersCount > 0 && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Nearby Search Info Banner */}
            {isNearbySearch && nearbyInfo && (
                <div className="card p-4 bg-blue-500/10 border-blue-500/20">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-blue-400">Showing vehicles within {nearbyInfo.radius}km</h3>
                            <p className="text-sm text-slate-400 mt-1">
                                Based on your current location. Found {nearbyInfo.count} vehicles nearby.
                            </p>
                        </div>
                        <button
                            onClick={clearFilters}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Filters Panel */}
            {showFilters && (
                <div className="card p-6 animate-in slide-in-from-top">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Filter Vehicles</h3>
                        <button
                            type="button"
                            onClick={() => setShowFilters(false)}
                            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
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
                            
                            {isNearbySearch && (
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                        Search Radius (km)
                                    </label>
                                    <select
                                        name="radius"
                                        value={filters.radius}
                                        onChange={(e) => {
                                            handleFilterChange(e);
                                            if (location) {
                                                setTimeout(() => loadNearbyVehicles(), 100);
                                            }
                                        }}
                                        className="w-full"
                                    >
                                        <option value="5">5 km</option>
                                        <option value="10">10 km</option>
                                        <option value="25">25 km</option>
                                        <option value="50">50 km</option>
                                        <option value="100">100 km</option>
                                    </select>
                                </div>
                            )}
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
                            <span key={key} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/40 text-sm">
                                <span className="text-slate-400">{labels[key]}:</span>
                                <span className="text-white font-medium">{value}</span>
                                <button
                                    onClick={async () => {
                                        const newFilters = { ...filters, [key]: '' };
                                        setFilters(newFilters);
                                        
                                        const newParams = {};
                                        Object.entries(newFilters).forEach(([k, v]) => {
                                            if (v) newParams[k] = v;
                                        });
                                        setSearchParams(newParams);
                                        
                                        // Fetch with updated filters
                                        try {
                                            setLoading(true);
                                            const { data } = await vehicleApi.list(newParams);
                                            setVehicles(data.vehicles || data);
                                        } catch (err) {
                                            console.error("Failed to load vehicles", err);
                                        } finally {
                                            setLoading(false);
                                        }
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