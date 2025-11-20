const mongoose = require('mongoose');

const connectDB = async (url) => {
    try {
        await mongoose.connect(url, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
        console.log('MongoDB connected Successfully.');
    } catch (err) {
        console.error('MongoDB connection error', err);
        process.exit(1);
    }
};

module.exports = connectDB;
