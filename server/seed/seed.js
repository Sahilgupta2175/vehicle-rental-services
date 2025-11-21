require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

const MONGO = process.env.MONGO_URI;

(async () => {
    await connectDB(MONGO);
    await User.deleteMany({});
    await Vehicle.deleteMany({});

    const admin = new User({ name: 'Admin', email: 'admin@vr.com', role: 'admin' });
    const vendor = new User({ name: 'Vendor One', email: 'vendor@vr.com', role: 'vendor', isVendorApproved: true });
    const user = new User({ name: 'Jane Doe', email: 'jane@doe.com', role: 'user' });

    await admin.save();
    await vendor.save();
    await user.save();

    const vehicles = [
        { owner: vendor._id, name: 'City Scooter', type: 'bike', pricePerHour: 5, location: { city: 'Goa', address: 'Beach Road' }, available: true },
        { owner: vendor._id, name: 'Compact Car', type: 'car', pricePerHour: 12, location: { city: 'Goa', address: 'Main St' }, available: true },
        { owner: vendor._id, name: 'Family Van', type: 'car', pricePerHour: 20, location: { city: 'Pune', address: 'MG Road' }, available: true }
    ];

    await Vehicle.insertMany(vehicles);

    console.log('Seed complete');
    process.exit(0);
})();
