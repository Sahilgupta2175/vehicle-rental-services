const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI;

if (!MONGO) {
  console.error('MONGO_URI is not set in env');
  process.exit(1);
}

connectDB(MONGO);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

global.io = io;

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('joinRoom', (room) => socket.join(room));
  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});

// start cron jobs
// require('./cron/jobs');

server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
});
