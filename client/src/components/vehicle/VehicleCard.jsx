import { Link } from "react-router-dom";

const VehicleCard = ({ vehicle }) => {
    const imageUrl = vehicle.primaryImage || vehicle.images?.[0]?.url;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:border-primary-soft transition">
            <div className="relative h-40 w-full overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={vehicle.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 bg-slate-800">
                        No image
                    </div>
                )}
                <span className="absolute top-2 left-2 text-xs bg-black/60 px-2 py-1 rounded-full">
                    {vehicle.type?.toUpperCase()}
                </span>
            </div>
            <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm">{vehicle.name}</h3>
                    {vehicle.pricePerHour && (
                        <span className="text-xs text-primary-soft">
                            ₹{vehicle.pricePerHour}/hr
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">
                    {vehicle.location?.city}, {vehicle.location?.state}
                </p>
                <div className="mt-auto flex justify-between items-center pt-2">
                    <span className="text-[11px] text-slate-500">
                        Rating: {vehicle.ratingAverage?.toFixed(1) || "N/A"}
                    </span>
                    <Link
                        to={`/vehicles/${vehicle._id}`}
                        className="text-[11px] px-3 py-1.5 rounded-full bg-primary-soft hover:bg-primary-dark"
                    >
                        View & Book
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VehicleCard;