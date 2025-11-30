const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

// Validate required environment variables
if (!MONGO_URI) {
    console.error('❌ MONGO_URI is not set in environment variables');
    process.exit(1);
}

// Connect to database
connectDB(MONGO_URI);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, { 
    cors: { 
        origin: process.env.CLIENT_URL || '*',
        credentials: true
    } 
});

global.io = io;

io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);
    
    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`📍 Socket ${socket.id} joined room: ${room}`);
    });
    
    socket.on('disconnect', () => {
        console.log('❌ Socket disconnected:', socket.id);
    });
});

// Start cron jobs
require('./cron/jobs');
console.log('⏰ Cron jobs initialized');

// Start server
server.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════');
    console.log('🚀 Vehicle Rental Service Backend');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ Server running on port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`💾 Database: Connected`);
    console.log(`📧 SMTP Host: ${process.env.SMTP_HOST || 'Not configured'}`);
    console.log(`📱 Twilio: ${process.env.TWILIO_FROM_NUMBER || 'Not configured'}`);
    console.log(`💰 Razorpay: ${process.env.RAZORPAY_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`☁️  Cloudinary: ${process.env.CLD_NAME ? '✅ Configured' : '❌ Not configured'}`);
    console.log('═══════════════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n⚠️  SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});
