const Vehicle = require('../models/Vehicle');
const { uploadBuffer } = require('../services/storage.service');

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
            vehicle.location = {
                ...vehicle.location,
                ...req.body.location
            };
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