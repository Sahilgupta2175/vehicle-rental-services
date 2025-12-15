import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { vehicleApi } from "../../api/vehicles";
import useAuthStore from "../../store/authStore";
import useGeolocation from "../../hooks/useGeolocation";

const VehicleForm = ({ initialData, onSaved, mode = "create" }) => {
    const { user } = useAuthStore();
    const { location: geoLocation, loading: geoLoading, getLocation } = useGeolocation();
    
    const [form, setForm] = useState({
        name: initialData?.name || "",
        type: initialData?.type || "car",
        pricePerHour: initialData?.pricePerHour || "",
        city: initialData?.location?.city || user?.location?.city || "",
        state: initialData?.location?.state || user?.location?.state || "",
        country: initialData?.location?.country || user?.location?.country || "India",
        address: initialData?.location?.address || user?.location?.address || "",
        lat: initialData?.location?.lat || user?.location?.coordinates?.coordinates?.[1] || "",
        lng: initialData?.location?.lng || user?.location?.coordinates?.coordinates?.[0] || "",
        description: initialData?.description || "",
        transmission: initialData?.specifications?.transmission || "",
        fuelType: initialData?.specifications?.fuelType || "",
        seating: initialData?.specifications?.seating || "",
        mileage: initialData?.specifications?.mileage || "",
        year: initialData?.specifications?.year || "",
        color: initialData?.specifications?.color || "",
        registrationNumber: initialData?.specifications?.registrationNumber || "",
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    // Auto-fill coordinates from geolocation
    useEffect(() => {
        if (geoLocation) {
            setForm(prev => ({
                ...prev,
                lat: geoLocation.lat,
                lng: geoLocation.lng
            }));
            toast.success("Location detected!");
        }
    }, [geoLocation]);

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleUseVendorLocation = () => {
        if (!user?.location) {
            toast.error("Please set your business location in the dashboard first");
            return;
        }
        setForm(prev => ({
            ...prev,
            address: user.location.address || "",
            city: user.location.city || "",
            state: user.location.state || "",
            country: user.location.country || "India",
            lat: user.location.coordinates?.coordinates?.[1] || "",
            lng: user.location.coordinates?.coordinates?.[0] || ""
        }));
        toast.success("Vendor location applied!");
    };

    const handleUseCurrentLocation = () => {
        getLocation();
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);

        if (files.length > 6) {
            toast.error("You can upload max 6 images");
            return;
        }

        setImages(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            const fd = new FormData();
            fd.set("name", form.name);
            fd.set("type", form.type);
            fd.set("pricePerHour", form.pricePerHour);
            fd.set("description", form.description);
            fd.set("location[city]", form.city);
            fd.set("location[state]", form.state);
            fd.set("location[country]", form.country);
            fd.set("location[address]", form.address);
            if (form.lat) fd.set("location[lat]", form.lat);
            if (form.lng) fd.set("location[lng]", form.lng);
            
            // Add specifications
            if (form.transmission) fd.set("specifications[transmission]", form.transmission);
            if (form.fuelType) fd.set("specifications[fuelType]", form.fuelType);
            if (form.seating) fd.set("specifications[seating]", form.seating);
            if (form.mileage) fd.set("specifications[mileage]", form.mileage);
            if (form.year) fd.set("specifications[year]", form.year);
            if (form.color) fd.set("specifications[color]", form.color);
            if (form.registrationNumber) fd.set("specifications[registrationNumber]", form.registrationNumber);

            images.forEach((file) => fd.append("images", file));

            let res;

            if (mode === "edit" && initialData?._id) {
                res = await vehicleApi.update(initialData._id, fd);
            } else {
                res = await vehicleApi.create(fd);
            }

            toast.success(
                mode === "edit" ? "Vehicle updated successfully" : "Vehicle created"
            );
            onSaved && onSaved(res.data.vehicle || res.data);
        } catch (err) {
            const msg = err.response?.data?.error || "Failed to save vehicle";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-100">
                        {mode === "edit" ? "Edit Vehicle" : "New Vehicle"}
                    </h3>
                    <p className="text-sm text-slate-400">
                        {mode === "edit" ? "Update your vehicle information" : "Add a new vehicle to your fleet"}
                    </p>
                </div>
            </div>

            {/* Form Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
                {/* Vehicle Name */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                        Vehicle Name
                        <span className="text-red-400 ml-1">*</span>
                    </label>
                    <div className="relative">
                        <input
                            name="name"
                            required
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g., Honda City 2024"
                            className="w-full"
                        />
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Vehicle Type */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                        Type
                        <span className="text-red-400 ml-1">*</span>
                    </label>
                    <div className="relative">
                        <select 
                            name="type" 
                            value={form.type} 
                            onChange={handleChange}
                            className="w-full appearance-none"
                        >
                            <option value="car">🚗 Car</option>
                            <option value="bike">🏍️ Bike</option>
                            <option value="scooter">🛵 Scooter</option>
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                        Price per Hour
                        <span className="text-red-400 ml-1">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-semibold">₹</span>
                        <input
                            type="number"
                            name="pricePerHour"
                            min="0"
                            required
                            value={form.pricePerHour}
                            onChange={handleChange}
                            placeholder="100"
                            className="w-full pl-8"
                        />
                    </div>
                </div>

                {/* City */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                        City
                        <span className="text-red-400 ml-1">*</span>
                    </label>
                    <div className="relative">
                        <input
                            name="city"
                            required
                            value={form.city}
                            onChange={handleChange}
                            placeholder="e.g., Mumbai"
                            className="w-full"
                        />
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                </div>

                {/* State */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                        State
                        <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                        name="state"
                        required
                        value={form.state}
                        onChange={handleChange}
                        placeholder="e.g., Maharashtra"
                        className="w-full"
                    />
                </div>

                {/* Address - Full Width */}
                <div className="space-y-2 sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-300">
                        Address
                        <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                        name="address"
                        required
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Street address or landmark"
                        className="w-full"
                    />
                </div>

                {/* Country */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                        Country
                        <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                        name="country"
                        required
                        value={form.country}
                        onChange={handleChange}
                        placeholder="e.g., India"
                        className="w-full"
                    />
                </div>

                {/* Location Helper Buttons */}
                <div className="space-y-2 sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Coordinates (for nearby search)
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {user?.location?.coordinates && (
                            <button
                                type="button"
                                onClick={handleUseVendorLocation}
                                className="btn-secondary text-sm flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Use My Business Location
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleUseCurrentLocation}
                            disabled={geoLoading}
                            className="btn-secondary text-sm flex items-center gap-2"
                        >
                            {geoLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Detecting...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    Detect Current Location
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Latitude */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                        Latitude
                    </label>
                    <input
                        type="number"
                        step="any"
                        name="lat"
                        value={form.lat}
                        onChange={handleChange}
                        placeholder="e.g., 19.0760"
                        className="w-full"
                    />
                </div>

                {/* Longitude */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                        Longitude
                    </label>
                    <input
                        type="number"
                        step="any"
                        name="lng"
                        value={form.lng}
                        onChange={handleChange}
                        placeholder="e.g., 72.8777"
                        className="w-full"
                    />
                </div>
            </div>

            {/* Specifications Section */}
            <div className="pt-4">
                <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <h4 className="text-lg font-semibold text-slate-200">Specifications</h4>
                    <span className="text-xs text-slate-500">(Optional but recommended)</span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Transmission */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                            Transmission
                        </label>
                        <select 
                            name="transmission" 
                            value={form.transmission} 
                            onChange={handleChange}
                            className="w-full appearance-none"
                        >
                            <option value="">Select Transmission</option>
                            <option value="manual">Manual</option>
                            <option value="automatic">Automatic</option>
                            <option value="semi-automatic">Semi-Automatic</option>
                        </select>
                    </div>

                    {/* Fuel Type */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                            Fuel Type
                        </label>
                        <select 
                            name="fuelType" 
                            value={form.fuelType} 
                            onChange={handleChange}
                            className="w-full appearance-none"
                        >
                            <option value="">Select Fuel Type</option>
                            <option value="petrol">Petrol</option>
                            <option value="diesel">Diesel</option>
                            <option value="electric">Electric</option>
                            <option value="cng">CNG</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                    </div>

                    {/* Seating Capacity */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                            Seating Capacity
                        </label>
                        <input
                            type="number"
                            name="seating"
                            min="1"
                            max="20"
                            value={form.seating}
                            onChange={handleChange}
                            placeholder="e.g., 5"
                            className="w-full"
                        />
                    </div>

                    {/* Year */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                            Manufacturing Year
                        </label>
                        <input
                            type="number"
                            name="year"
                            min="1990"
                            max={new Date().getFullYear() + 1}
                            value={form.year}
                            onChange={handleChange}
                            placeholder="e.g., 2024"
                            className="w-full"
                        />
                    </div>

                    {/* Mileage */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                            Mileage
                        </label>
                        <input
                            name="mileage"
                            value={form.mileage}
                            onChange={handleChange}
                            placeholder="e.g., 20 km/l"
                            className="w-full"
                        />
                    </div>

                    {/* Color */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                            Color
                        </label>
                        <input
                            name="color"
                            value={form.color}
                            onChange={handleChange}
                            placeholder="e.g., Black"
                            className="w-full"
                        />
                    </div>

                    {/* Registration Number */}
                    <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-slate-300">
                            Registration Number
                        </label>
                        <input
                            name="registrationNumber"
                            value={form.registrationNumber}
                            onChange={handleChange}
                            placeholder="e.g., MH12AB1234"
                            className="w-full uppercase"
                            maxLength="15"
                        />
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                    Description
                </label>
                <textarea
                    name="description"
                    rows={4}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Tell customers about your vehicle's features, condition, and any special requirements..."
                    className="w-full resize-none"
                />
                <p className="text-xs text-slate-500 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Optional but recommended for better bookings
                </p>
            </div>

            {/* Images Upload */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">
                    Vehicle Images
                </label>
                <div className="relative">
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="hidden"
                        id="vehicle-images"
                    />
                    <label 
                        htmlFor="vehicle-images"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-slate-700/50 transition-all group"
                    >
                        <svg className="w-10 h-10 text-slate-500 group-hover:text-blue-500 transition-colors mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-slate-400 group-hover:text-blue-400 transition-colors">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            Max 6 images, 10MB each (PNG, JPG, JPEG)
                        </p>
                    </label>
                </div>
                
                {images.length > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <svg className="w-5 h-5 text-blue-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-blue-300">
                            {images.length} image{images.length > 1 ? 's' : ''} selected
                        </span>
                    </div>
                )}

                {mode === "edit" && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Existing images will remain if you don't upload new ones
                    </p>
                )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-base shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {mode === "edit" ? "Updating..." : "Creating..."}
                        </>
                    ) : (
                        <>
                            {mode === "edit" ? "Update Vehicle" : "Create Vehicle"}
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default VehicleForm;