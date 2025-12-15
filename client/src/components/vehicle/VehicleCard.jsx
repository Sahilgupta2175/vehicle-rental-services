import { Link } from "react-router-dom";

const VehicleCard = ({ vehicle }) => {
    const imageUrl = vehicle.primaryImage || vehicle.images?.[0]?.url;

    return (
        <div className="card card-hover group overflow-hidden">
            <div className="relative h-56 w-full overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={vehicle.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-slate-500 bg-background-light">
                        <svg className="w-16 h-16 text-slate-700" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                        </svg>
                    </div>
                )}
                
                {/* Type Badge */}
                <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                        {vehicle.type === 'car' && (
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                            </svg>
                        )}
                        {vehicle.type === 'bike' && (
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                        )}
                        {vehicle.type?.toUpperCase() || 'VEHICLE'}
                    </span>
                </div>

                {/* Distance Badge - shown when distance is available */}
                {vehicle.distance !== undefined && vehicle.distanceFormatted && (
                    <div className="absolute bottom-3 left-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-blue-400/40 text-blue-300">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {vehicle.distanceFormatted} away
                        </span>
                    </div>
                )}

                {/* Availability Badge */}
                {vehicle.isAvailable !== undefined && (
                    <div className="absolute top-3 right-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md border ${
                            vehicle.isAvailable 
                                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300' 
                                : 'bg-red-500/20 border-red-400/40 text-red-300'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${vehicle.isAvailable ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                            {vehicle.isAvailable ? 'Available' : 'Booked'}
                        </span>
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="p-5 space-y-4">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                            {vehicle.name}
                        </h3>
                        {vehicle.pricePerHour && (
                            <div className="text-right flex-shrink-0">
                                <div className="text-xs text-slate-400">from</div>
                                <div className="text-xl font-bold text-blue-400">₹{vehicle.pricePerHour}</div>
                                <div className="text-xs text-slate-500">/hour</div>
                            </div>
                        )}
                    </div>
                    
                    {(vehicle.location?.city || vehicle.location?.state) && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="line-clamp-1">
                                {vehicle.location?.city}{vehicle.location?.state && `, ${vehicle.location.state}`}
                            </span>
                        </div>
                    )}
                </div>

                {/* Features/Stats */}
                {vehicle.ratingAverage && (
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-semibold text-white">{vehicle.ratingAverage.toFixed(1)}</span>
                            <span className="text-slate-500">/5</span>
                        </div>
                        {vehicle.totalBookings && (
                            <span className="text-slate-500">• {vehicle.totalBookings} trips</span>
                        )}
                    </div>
                )}

                {/* Action Button */}
                <Link
                    to={`/vehicles/${vehicle._id}`}
                    className="block w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-200"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default VehicleCard;