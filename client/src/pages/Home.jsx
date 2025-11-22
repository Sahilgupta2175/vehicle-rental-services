import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { vehicleApi } from "../api/vehicles";
import VehicleCard from "../components/vehicle/VehicleCard";
import Footer from "../components/common/Footer";

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
		<div className="space-y-16 pb-16 bg-animated">
			{/* Hero Section */}
			<section className="relative grid lg:grid-cols-2 gap-12 items-center pt-8 lg:pt-16 px-4">
				{/* Left Content */}
				<div className="space-y-6 lg:space-y-8 z-10">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 backdrop-blur-sm">
						<span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
						<p className="text-xs uppercase tracking-wider text-blue-400 font-semibold">
							Trusted by 10,000+ riders
						</p>
					</div>
					
					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
						Find the perfect
						<span className="block mt-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
							ride for your journey
						</span>
					</h1>
					
					<p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
						Discover premium vehicles from verified local vendors. Book instantly, 
						pay securely, and hit the road with confidence.
					</p>

					{/* Search Form */}
					<form
						onSubmit={handleSearch}
						className="mt-8 card p-6 space-y-4 backdrop-blur-sm"
					>
						<div className="grid sm:grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
									Search Vehicle
								</label>
								<input
									type="text"
									placeholder="Car, Bike, Brand..."
									value={q}
									onChange={(e) => setQ(e.target.value)}
									className="w-full"
								/>
							</div>
							<div className="space-y-2">
								<label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
									Location
								</label>
								<input
									type="text"
									placeholder="City name"
									value={city}
									onChange={(e) => setCity(e.target.value)}
									className="w-full"
								/>
							</div>
						</div>
						<button
							type="submit"
							className="w-full btn-primary flex items-center justify-center gap-2"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
							Search Vehicles
						</button>
					</form>

					{/* Features */}
					<div className="flex flex-wrap gap-6 pt-4">
						<div className="flex items-center gap-2 text-sm">
							<div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
								<svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
								</svg>
							</div>
							<span className="text-slate-300">Verified Vendors</span>
						</div>
						<div className="flex items-center gap-2 text-sm">
							<div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
								<svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
								</svg>
							</div>
							<span className="text-slate-300">Instant Booking</span>
						</div>
						<div className="flex items-center gap-2 text-sm">
							<div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
								<svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
								</svg>
							</div>
							<span className="text-slate-300">24/7 Support</span>
						</div>
					</div>
				</div>

				{/* Right Visual */}
				<div className="hidden lg:flex items-center justify-center relative">
					<div className="relative w-full max-w-md">
						{/* Floating Card 1 */}
						<div className="absolute -top-8 -left-8 card p-4 animate-float backdrop-blur-sm">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
									<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
										<path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
										<path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
									</svg>
								</div>
								<div>
									<p className="text-xs text-slate-400">Total Bookings</p>
									<p className="text-xl font-bold text-blue-400">25K+</p>
								</div>
							</div>
						</div>

						{/* Floating Card 2 */}
						<div className="absolute -bottom-8 -right-8 card p-4 backdrop-blur-sm" style={{animationDelay: '1s'}}>
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
									<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
									</svg>
								</div>
								<div>
									<p className="text-xs text-slate-400">Happy Customers</p>
									<p className="text-xl font-bold text-amber-400">98%</p>
								</div>
							</div>
						</div>

						{/* Main Card */}
						<div className="card p-8 text-center space-y-4">
							<div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-amber-500/20 flex items-center justify-center backdrop-blur-sm">
								<svg className="w-20 h-20 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
									<path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
									<path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
								</svg>
							</div>
							<div>
								<p className="text-sm text-slate-400">Available Now</p>
								<p className="text-3xl font-bold mt-1">500+ Vehicles</p>
								<p className="text-xs text-slate-500 mt-2">Cars • Bikes • Scooters</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Featured Vehicles */}
			<section className="space-y-8 px-4">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h2 className="text-3xl font-bold">Featured Vehicles</h2>
						<p className="text-slate-400 mt-2">Handpicked premium rides for your next adventure</p>
					</div>
					<Link
						to="/vehicles"
						className="btn-secondary flex items-center gap-2"
					>
						View All Vehicles
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
						</svg>
					</Link>
				</div>

				{loading ? (
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="card p-6 space-y-4 animate-pulse">
								<div className="h-48 bg-background-light rounded-xl"></div>
								<div className="h-4 bg-background-light rounded w-3/4"></div>
								<div className="h-3 bg-background-light rounded w-1/2"></div>
							</div>
						))}
					</div>
				) : (
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{featured.map((v) => (
							<VehicleCard key={v._id} vehicle={v} />
						))}
						{featured.length === 0 && (
							<div className="col-span-full text-center py-16">
								<p className="text-slate-400 text-lg">No vehicles available at the moment.</p>
								<p className="text-slate-500 text-sm mt-2">Check back soon for new additions!</p>
							</div>
						)}
					</div>
				)}
			</section>

			{/* Stats Section */}
			<section className="px-4">
				<div className="card p-8 sm:p-12">
					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
						<div className="text-center space-y-2">
							<div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
								500+
							</div>
							<p className="text-slate-400">Vehicles Available</p>
						</div>
						<div className="text-center space-y-2">
							<div className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
								25K+
							</div>
							<p className="text-slate-400">Happy Customers</p>
						</div>
						<div className="text-center space-y-2">
							<div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
								50+
							</div>
							<p className="text-slate-400">Cities Covered</p>
						</div>
						<div className="text-center space-y-2">
							<div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
								98%
							</div>
							<p className="text-slate-400">Satisfaction Rate</p>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<Footer />
		</div>
    );
};

export default Home;