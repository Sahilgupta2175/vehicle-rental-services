const mongoose = require('mongoose');
const dns = require('dns');

const parseDnsServers = () => {
    const configured = process.env.MONGO_DNS_SERVERS;
    if (!configured) {
        return ['8.8.8.8', '1.1.1.1'];
    }

    const servers = configured
        .split(',')
        .map((server) => server.trim())
        .filter(Boolean);

    return servers.length ? servers : ['8.8.8.8', '1.1.1.1'];
};

const connectDB = async (url) => {
    try {
        await mongoose.connect(url);
        console.log('✅ MongoDB connected successfully to:', mongoose.connection.name);
    } catch (err) {
        const isSrvDnsRefused = err?.code === 'ECONNREFUSED' && err?.syscall === 'querySrv';

        if (isSrvDnsRefused) {
            const fallbackServers = parseDnsServers();
            console.warn('⚠️  SRV DNS lookup failed. Retrying with DNS servers:', fallbackServers.join(', '));

            try {
                dns.setServers(fallbackServers);
                await mongoose.connect(url);
                console.log('✅ MongoDB connected successfully after DNS fallback to:', mongoose.connection.name);
                return;
            } catch (retryErr) {
                console.error('❌ MongoDB retry failed:', retryErr.message);
            }
        }

        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
});

module.exports = connectDB;
