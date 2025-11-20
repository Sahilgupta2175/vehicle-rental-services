require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const morgan = require('morgan');
const xss = require('xss-clean');
const path = require('path');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth.routes');
// const vehicleRoutes = require('./routes/vehicle.routes');
// const bookingRoutes = require('./routes/booking.routes');
// const adminRoutes = require('./routes/admin.routes');
// const paymentRoutes = require('./routes/payment.routes');
// const reportRoutes = require('./routes/report.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// Stripe webhook route needs raw body; defined here before express.json()
app.post(
  '/api/payments/stripe/webhook',
  bodyParser.raw({ type: 'application/json' }),
  require('./controllers/payment.controller').stripeWebhook
);

// security middlewares
app.use(helmet());
app.use(xss());
app.use(cors({ origin: true, credentials: true }));

// logging + rate limiting
app.use(morgan('dev'));
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 120
  })
);

// body parsers for other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// static for local uploads (if used)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
// app.use('/api/vehicles', vehicleRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/reports', reportRoutes);

// health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() })
});

// centralized error handler
// app.use(errorHandler);

module.exports = app;
