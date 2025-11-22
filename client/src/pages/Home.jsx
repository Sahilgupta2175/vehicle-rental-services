import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { vehicleApi } from "../api/vehicles";
import VehicleCard from "../components/vehicle/VehicleCard";

const Home = () => {
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(false);
    const [city, setCity] = useState("");
    const [q, setQ] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
		const load = async () => {
			try {
				setLoading(true);
				const { data } = await vehicleApi.list({ limit: 6 });
				setFeatured(data.vehicles || data);
			} catch (err) {
				console.error("Failed to load vehicles", err);
			} finally {
				setLoading(false);
			}
		};

		load();
    }, []);

    const handleSearch = (e) => {
		e.preventDefault();
		const params = new URLSearchParams();

		if (q) {
			params.set("q", q);
		}
		
		if (city) {
			params.set("city", city);
		}
		
		navigate(`/vehicles?${params.toString()}`);
    };

    return (
		<div className="space-y-10">
			{/* Hero */}
			<section className="grid md:grid-cols-[2fr,1.4fr] gap-8 items-center pt-4">
				<div className="space-y-4">
					<p className="text-xs uppercase tracking-[0.2em] text-primary-soft">
						Vehicle Rental Anywhere
					</p>
					<h1 className="text-3xl md:text-4xl font-semibold leading-tight">
						Find bikes & cars from{" "}
						<span className="text-primary-soft">local rental shops</span> in
						any city.
					</h1>
					<p className="text-sm text-slate-400 max-w-xl">
						Connect with trusted local vendors, see transparent pricing, and
						book your ride in minutes. Perfect for trips, students, and daily
						commutes.
					</p>

					<form
						onSubmit={handleSearch}
						className="mt-4 flex flex-col sm:flex-row gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-3"
					>
						<input
							type="text"
							placeholder="Search by vehicle, brand or city..."
							value={q}
							onChange={(e) => setQ(e.target.value)}
							className="flex-1 text-sm"
						/>
						<input
							type="text"
							placeholder="City (e.g. Pune)"
							value={city}
							onChange={(e) => setCity(e.target.value)}
							className="flex-1 text-sm"
						/>
						<button
							type="submit"
							className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary-soft hover:bg-primary-dark text-sm font-medium"
						>
							Search
						</button>
					</form>

					<div className="flex gap-4 text-[11px] text-slate-400 pt-2">
						<span>✅ Verified vendors</span>
						<span>✅ Online payments (Stripe & Razorpay)</span>
						<span>✅ Instant booking</span>
					</div>
				</div>

				<div className="hidden md:block">
					<div className="relative w-full h-64 rounded-3xl bg-gradient-to-tr from-primary-dark via-slate-900 to-accent overflow-hidden border border-slate-800">
						<div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_top,_#ffffff22,_transparent)]" />
						<div className="absolute bottom-4 left-4 space-y-2">
							<p className="text-xs text-slate-300">Live availability</p>
							<h3 className="text-lg font-semibold">
								120+ vehicles ready to rent
							</h3>
							<p className="text-xs text-slate-300">
								Cars • Bikes • Scooters • SUVs
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Featured */}
			<section className="space-y-4">
				<div className="flex justify-between items-center">
					<h2 className="text-lg font-semibold">Featured vehicles</h2>
					<Link
						to="/vehicles"
						className="text-xs text-primary-soft hover:text-primary-dark"
					>
						View all
					</Link>
				</div>

				{loading ? (
					<p className="text-sm text-slate-400">Loading vehicles...</p>
				) : (
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{featured.map((v) => (
							<VehicleCard key={v._id} vehicle={v} />
						))}
						{featured.length === 0 && (
							<p className="text-sm text-slate-400">No vehicles found.</p>
						)}
					</div>
				)}
			</section>
		</div>
    );
};

export default Home;