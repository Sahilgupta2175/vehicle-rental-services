const Vehicle = require('../models/Vehicle');
const { uploadBuffer } = require('../services/storage.service');
const { validateCoordinates, sortByDistance } = require('../utils/location.util');

exports.createVehicle = async (req, res, next) => {
    try {
        const { name, type, description, pricePerHour, location, specifications } = req.body;
        const owner = req.user._id;
        const vehicle = new Vehicle({
            owner,
            name,
            type,
            description,
            pricePerHour: Number(pricePerHour),
            location: typeof location === 'string' ? JSON.parse(location) : location,
            specifications: typeof specifications === 'string' ? JSON.parse(specifications) : specifications
        });

        if (req.files && req.files.length) {
            const uploads = await Promise.all(req.files.map((f) => uploadBuffer(f.buffer, 'vehicles')));
            vehicle.images = uploads.map((u) => ({ url: u.secure_url, public_id: u.public_id }));
        }

        await vehicle.save();
        res.status(201).json(vehicle);
    } catch (err) {
        next(err);
    }
};

exports.updateVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ error: 'Not found' });
        }

        if (String(vehicle.owner) !== String(req.user._id) && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Update basic fields
        if (req.body.name) {
            vehicle.name = req.body.name;
        }

        if (req.body.type) {
            vehicle.type = req.body.type;
        }

        if (req.body.description !== undefined) {
            vehicle.description = req.body.description;
        }

        if (req.body.pricePerHour) {
            vehicle.pricePerHour = req.body.pricePerHour;
        }
        
        if (req.body.available !== undefined) {
            vehicle.available = req.body.available;
        }

        // Handle location as nested object
        if (req.body.location) {
            const currentLocation = vehicle.location || {};
            const newLocation = req.body.location;
            
            vehicle.location = {
                address: newLocation.address !== undefined ? newLocation.address : currentLocation.address,
                city: newLocation.city !== undefined ? newLocation.city : currentLocation.city,
                state: newLocation.state !== undefined ? newLocation.state : currentLocation.state,
                country: newLocation.country !== undefined ? newLocation.country : currentLocation.country,
                lat: newLocation.lat !== undefined ? newLocation.lat : currentLocation.lat,
                lng: newLocation.lng !== undefined ? newLocation.lng : currentLocation.lng
            };
            
            // Set coordinates with proper GeoJSON structure if lat/lng are provided
            if (vehicle.location.lat && vehicle.location.lng) {
                vehicle.location.coordinates = {
                    type: 'Point',
                    coordinates: [Number(vehicle.location.lng), Number(vehicle.location.lat)]
                };
            }
        }

        // Handle specifications as nested object
        if (req.body.specifications) {
            vehicle.specifications = {
                ...vehicle.specifications,
                ...req.body.specifications
            };
        }

        if (req.files && req.files.length) {
            const uploads = await Promise.all(req.files.map((f) => uploadBuffer(f.buffer, 'vehicles')));
            vehicle.images = vehicle.images.concat(uploads.map((u) => ({ url: u.secure_url, public_id: u.public_id })));
        }

        await vehicle.save();
        res.json(vehicle);
    } catch (err) {
        next(err);
    }
};

exports.deleteVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ error: 'Not found' });
        }

        if (String(vehicle.owner) !== String(req.user._id) && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        await vehicle.remove();
        res.json({ message: 'Deleted' });
    } catch (err) {
        next(err);
    }
};

exports.getVehicles = async (req, res, next) => {
    try {
        // First, check and complete any expired bookings
        const Booking = require('../models/Booking');
        const now = new Date();
        const endedBookings = await Booking.find({
            status: 'paid',
            end: { $lt: now }
        });

        for (const booking of endedBookings) {
            // Mark booking as completed
            booking.status = 'completed';
            await booking.save();

            // Check if there are any other active bookings for this vehicle
            const activeBookings = await Booking.countDocuments({
                vehicle: booking.vehicle,
                status: { $in: ['paid', 'approved', 'pending'] },
                start: { $lte: now },
                end: { $gte: now }
            });

            // If no active bookings, make vehicle available
            if (activeBookings === 0) {
                await Vehicle.findByIdAndUpdate(booking.vehicle, { available: true });
            }
        }

        const { q, city, type, minPrice, maxPrice, page = 1, limit = 20, mine } = req.query;
        const filter = {};

        // If 'mine' parameter is true and user is authenticated, filter by owner
        if (mine === 'true' && req.user) {
            filter.owner = req.user._id;
        } else {
            // For public listing, only show available vehicles
            filter.available = true;
        }

        if (q) {
            filter.$text = { $search: q };
        }

        if (city) {
            // Case-insensitive search by converting to lowercase
            filter['location.city'] = city.toLowerCase();
        }

        if (type) {
            // Case-insensitive search by converting to lowercase
            filter.type = type.toLowerCase();
        }

        if (minPrice) {
            filter.pricePerHour = Object.assign(filter.pricePerHour || {}, { $gte: Number(minPrice) });
        }

        if (maxPrice) {
            filter.pricePerHour = Object.assign(filter.pricePerHour || {}, { $lte: Number(maxPrice) });
        }

        const vehicles = await Vehicle.find(filter).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
        res.json(vehicles);
    } catch (err) {
        next(err);
    }
};

exports.getVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id).populate('owner', 'name email phone');
        
        if (!vehicle) {
            return res.status(404).json({ error: 'Not found' });
        }

        res.json(vehicle);
    } catch (err) {
        next(err);
    }
};

exports.getNearbyVehicles = async (req, res, next) => {
    try {
        const { lat, lng, radius = 50, type, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

        // Validate required parameters
        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const radiusKm = parseFloat(radius);

        // Validate coordinates
        if (!validateCoordinates(latitude, longitude)) {
            return res.status(400).json({ error: 'Invalid coordinates' });
        }

        // Build filter
        const filter = {
            available: true,
            'location.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude] // GeoJSON uses [lng, lat]
                    },
                    $maxDistance: radiusKm * 1000 // Convert km to meters
                }
            }
        };

        // Additional filters
        if (type) {
            filter.type = type.toLowerCase();
        }

        if (minPrice) {
            filter.pricePerHour = Object.assign(filter.pricePerHour || {}, { $gte: Number(minPrice) });
        }

        if (maxPrice) {
            filter.pricePerHour = Object.assign(filter.pricePerHour || {}, { $lte: Number(maxPrice) });
        }

        // Query vehicles with geospatial search
        const vehicles = await Vehicle.find(filter)
            .populate('owner', 'name email phone')
            .skip((page - 1) * limit)
            .limit(Number(limit));

        // Calculate distances and add to response
        const vehiclesWithDistance = sortByDistance(vehicles, latitude, longitude);

        res.json({
            count: vehiclesWithDistance.length,
            radius: radiusKm,
            userLocation: { lat: latitude, lng: longitude },
            vehicles: vehiclesWithDistance
        });
    } catch (err) {
        next(err);
    }
};
