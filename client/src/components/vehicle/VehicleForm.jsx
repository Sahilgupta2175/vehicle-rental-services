import React, { useState } from "react";
import { toast } from "react-toastify";
import { vehicleApi } from "../../api/vehicles";

const VehicleForm = ({ initialData, onSaved, mode = "create" }) => {
    const [form, setForm] = useState({
        name: initialData?.name || "",
        type: initialData?.type || "car",
        pricePerHour: initialData?.pricePerHour || "",
        city: initialData?.location?.city || "",
        state: initialData?.location?.state || "",
        address: initialData?.location?.address || "",
        description: initialData?.description || "",
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
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
            fd.set("location[address]", form.address);

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
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label>Name</label>
                    <input
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-1">
                    <label>Type</label>
                    <select name="type" value={form.type} onChange={handleChange}>
                        <option value="car">Car</option>
                        <option value="bike">Bike</option>
                        <option value="scooter">Scooter</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label>Price per hour (₹)</label>
                    <input
                        type="number"
                        name="pricePerHour"
                        min="0"
                        required
                        value={form.pricePerHour}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-1">
                    <label>City</label>
                    <input
                        name="city"
                        required
                        value={form.city}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-1">
                    <label>State</label>
                    <input
                        name="state"
                        required
                        value={form.state}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-1 sm:col-span-2">
                    <label>Address</label>
                    <input
                        name="address"
                        required
                        value={form.address}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label>Description</label>
                <textarea
                    name="description"
                    rows={3}
                    value={form.description}
                    onChange={handleChange}
                />
            </div>

            <div className="space-y-1">
                <label>Images (max 6, 10MB each)</label>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} />
                <p className="text-[11px] text-slate-500">
                    Existing images will remain if you don&apos;t upload new ones.
                </p>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-xl bg-primary-soft hover:bg-primary-dark text-sm font-medium disabled:opacity-60"
            >
                {loading
                ? mode === "edit"
                    ? "Updating..."
                    : "Creating..."
                : mode === "edit"
                ? "Update vehicle"
                : "Create vehicle"}
            </button>
        </form>
    );
};

export default VehicleForm;