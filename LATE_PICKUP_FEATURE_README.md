# 🚗 Late Pickup Handling System

## 📋 Overview

A comprehensive late pickup management system for vehicle rental applications that handles scenarios where users are late to pick up rented vehicles with dynamic waiting windows and automatic cancellation.

## ✨ Features

### Core Functionality
- ✅ **Default 30-minute waiting window** - Automatic grace period for all bookings
- ✅ **Dynamic extension requests** - Users can request extensions if late >45 minutes
- ✅ **Smart calculation logic** - System dynamically adjusts waiting windows
- ✅ **5-minute grace period** - Additional buffer after extended window
- ✅ **Automatic cancellation** - Cron job auto-cancels expired bookings
- ✅ **Vehicle auto-relisting** - Makes vehicles available immediately after cancellation
- ✅ **Refund processing** - Automatic refund initiation for cancelled bookings

### Security & Validation
- ✅ **Comprehensive validation** - All inputs validated with detailed error messages
- ✅ **Edge case handling** - Prevents abuse and handles all scenarios
- ✅ **One extension limit** - Prevents multiple extension requests
- ✅ **Authorization checks** - Role-based access control
- ✅ **Input sanitization** - XSS and injection protection

### Notifications
- ✅ **Email notifications** - Professional HTML emails for all events
- ✅ **SMS alerts** - Real-time SMS notifications
- ✅ **Socket events** - Real-time WebSocket updates
- ✅ **Multi-recipient** - Notifies both users and vendors

## 🎯 How It Works

### Step 1: Default Behavior
```
Booking Created (Status: Paid)
    ↓
Default Waiting Window: 30 minutes
    ↓
User picks up within 30 min? → ✅ Continue normally
User late? → Go to Step 2
```

### Step 2: Late Extension Request
```
User expects to be late >45 minutes
    ↓
User submits extension request with declared time (e.g., 50 min)
    ↓
System validates input
    ↓
Calculate: Final Window = Declared Time
Example: 50 minutes declared = 50 min final window
    ↓
Add 5-minute grace period
Total time before cancel = 55 minutes
    ↓
Schedule auto-cancellation
Send notifications
```

### Step 3: Pickup or Auto-Cancel
```
Did user pick up within window?
    ↓
YES → Mark as picked up, clear auto-cancel, continue booking
    ↓
NO → Wait for grace period (5 min)
    ↓
Cron job runs (every 2 minutes)
    ↓
Auto-cancel booking
Mark vehicle as available
Process refund
Send notifications
```

## 📦 Installation

### Prerequisites
- Node.js >= 14.x
- MongoDB >= 4.x
- npm or yarn

### Setup

1. **Files Added/Modified:**
   ```
   server/
   ├── models/
   │   └── Booking.js                    # Updated with pickup fields
   ├── controllers/
   │   └── booking.controller.js         # Added 3 new methods
   ├── middleware/
   │   └── latePickup.middleware.js      # New - Validation middleware
   ├── routes/
   │   └── booking.routes.js             # Added 3 new routes
   ├── cron/
   │   └── jobs.js                       # Added auto-cancel job
   └── test/
       └── latePickup.test.js            # New - Test suite
   
   Documentation:
   └── LATE_PICKUP_API_DOCUMENTATION.md  # Complete API docs
   ```

2. **No additional packages required** - Uses existing dependencies

3. **No environment variables needed** - Works with existing configuration

## 🚀 Usage

### API Endpoints

#### 1. Request Late Pickup Extension
```http
POST /api/bookings/late-pickup/request-extension
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "507f1f77bcf86cd799439011",
  "declaredLateTime": 50
}
```

**Response:**
```json
{
  "success": true,
  "message": "Late pickup extension approved",
  "data": {
    "finalWaitingWindow": 50,
    "autoCancelTime": "2026-02-13T15:55:00.000Z",
    "graceperiod": 5
  }
}
```

#### 2. Confirm Vehicle Pickup
```http
POST /api/bookings/late-pickup/confirm-pickup
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "507f1f77bcf86cd799439011"
}
```

#### 3. Get Late Pickup Status
```http
GET /api/bookings/late-pickup/status/:bookingId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingId": "507f1f77bcf86cd799439011",
    "vehicleName": "Honda Activa",
    "pickedUp": false,
    "extensionRequested": true,
    "declaredLateTime": 50,
    "finalWaitingWindow": 50,
    "timeRemainingMinutes": 30,
    "canRequestExtension": false,
    "isExpired": false
  }
}
```

### Frontend Example

```javascript
// Request Extension
const requestExtension = async (bookingId, lateMinutes) => {
  try {
    const response = await fetch('/api/bookings/late-pickup/request-extension', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookingId,
        declaredLateTime: parseInt(lateMinutes)
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(`Extension approved! Pick up by ${result.data.autoCancelTime}`);
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Extension request failed:', error);
  }
};

// Confirm Pickup
const confirmPickup = async (bookingId) => {
  const response = await fetch('/api/bookings/late-pickup/confirm-pickup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ bookingId })
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('Pickup confirmed!');
  }
};
```

## 🧪 Testing

### Run Test Suite

```bash
cd server
node test/latePickup.test.js
```

### Manual Testing with Postman

1. **Import API endpoints** from `LATE_PICKUP_API_DOCUMENTATION.md`
2. **Set up authentication** - Get JWT token from login
3. **Create a paid booking**
4. **Test scenarios:**
   - Valid extension request (>30 min)
   - Below minimum (≤30 min) - should fail
   - Above maximum (>240 min) - should fail
   - Duplicate extension - should fail
   - Invalid input - should fail
   - Confirm pickup
   - Check status

### Test with cURL

```bash
# Request Extension
curl -X POST http://localhost:5000/api/bookings/late-pickup/request-extension \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "BOOKING_ID", "declaredLateTime": 50}'

# Confirm Pickup
curl -X POST http://localhost:5000/api/bookings/late-pickup/confirm-pickup \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "BOOKING_ID"}'

# Get Status
curl -X GET http://localhost:5000/api/bookings/late-pickup/status/BOOKING_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Validation Rules

| Input | Validation | Error Code |
|-------|-----------|------------|
| declaredLateTime | Required | MISSING_LATE_TIME |
| declaredLateTime | Must be number | INVALID_NUMBER_FORMAT |
| declaredLateTime | Must be >30 min | BELOW_MINIMUM_THRESHOLD |
| declaredLateTime | Must be ≤240 min | EXCEEDS_MAXIMUM_THRESHOLD |
| declaredLateTime | Cannot be negative | NEGATIVE_TIME |
| Extension | Only 1 allowed | DUPLICATE_EXTENSION_REQUEST |
| Booking | Must be paid | INVALID_BOOKING_STATUS |
| Pickup | Can't be picked up already | ALREADY_PICKED_UP |
| Time | Must be within window | WINDOW_EXPIRED |

## 🔄 Auto-Cancellation Process

### Cron Job Schedule
- **Frequency:** Every 2 minutes
- **Function:** `handleLatePickupCancellation()`
- **Trigger:** When `autoCancel.scheduledAt` ≤ current time

### Auto-Cancel Actions
1. ✅ Update booking status → `cancelled`
2. ✅ Mark vehicle as `available`
3. ✅ Process refund to original payment method
4. ✅ Create refund transaction record
5. ✅ Send email to user (cancellation + refund details)
6. ✅ Send email to vendor (notification)
7. ✅ Send SMS to user
8. ✅ Emit socket events to both parties
9. ✅ Log all actions

### Monitoring Auto-Cancellation

**Server Logs:**
```
[cron] Auto-cancelling late pickup booking 507f1f77bcf86cd799439011
[cron] Vehicle Honda Activa is now available after late pickup cancellation
[cron] Refund processed for booking 507f1f77bcf86cd799439011
[cron] Processed 1 late pickup auto-cancellations
```

## 📧 Notifications

### Email Templates
- ✅ Extension Approved (User)
- ✅ Extension Notice (Vendor)
- ✅ Pickup Confirmed (User)
- ✅ Auto-Cancelled (User & Vendor)

### SMS Messages
- Extension approved with deadline
- Auto-cancellation notification
- Pickup confirmation

### Socket Events
- `pickup:extension-approved` (User)
- `pickup:extension-requested` (Vendor)
- `pickup:confirmed` (User)
- `booking:auto-cancelled` (User & Vendor)

## 🛡️ Security Features

- **Authentication:** JWT token required for all endpoints
- **Authorization:** Role-based access (user only)
- **Ownership Validation:** Users can only access their own bookings
- **Input Sanitization:** XSS and injection prevention
- **Rate Limiting:** Prevents abuse (inherited from existing middleware)
- **Audit Trail:** All actions logged with timestamps

## 🔧 Troubleshooting

### Extension Request Fails

**Issue:** "Window Expired" error
- **Cause:** Current time > booking start + window
- **Solution:** This is expected. Request extension earlier or contact support

**Issue:** "Duplicate Extension Request" error
- **Cause:** Already requested once
- **Solution:** Only one extension allowed per booking

**Issue:** "Below Minimum Threshold" error
- **Cause:** Declared time ≤ 30 minutes
- **Solution:** No extension needed - covered by default window

### Auto-Cancellation Not Working

**Check:**
1. Is cron job running? (Check server logs)
2. Is `autoCancel.scheduled` = true?
3. Is `autoCancel.scheduledAt` correct?
4. Are there any errors in logs?

**Debug:**
```bash
# Check booking data
db.bookings.findOne({ _id: ObjectId("BOOKING_ID") })

# Check cron job logs
grep "cron" server.log

# Manually trigger cron (for testing)
POST /api/bookings/complete-expired
```

### Refund Not Processing

**Check:**
1. Payment service configured correctly?
2. Original transaction exists?
3. Provider credentials valid?
4. Check transaction collection for errors

## 📈 Performance Optimization

- **Database Indexes:** Added on pickup fields for fast queries
- **Cron Efficiency:** 2-minute interval balances load vs responsiveness
- **Async Operations:** All notifications sent asynchronously
- **Batch Processing:** Multiple bookings processed in single cron run
- **Socket Events:** Real-time updates without polling

## 📘 Database Schema

### Booking Model - New Fields

```javascript
pickup: {
  defaultWaitingWindow: Number,      // Default 30 min
  userDeclaredLateTime: Number,      // User's declared time
  extensionRequested: Boolean,       // Has extension been requested
  extensionRequestedAt: Date,        // When requested
  finalWaitingWindow: Number,        // Calculated final window
  pickedUp: Boolean,                 // Is vehicle picked up
  pickedUpAt: Date,                  // When picked up
  autoCancel: {
    scheduled: Boolean,              // Is auto-cancel scheduled
    scheduledAt: Date               // When to auto-cancel
  }
}
```

## 📚 Documentation

- **API Documentation:** [`LATE_PICKUP_API_DOCUMENTATION.md`](./LATE_PICKUP_API_DOCUMENTATION.md)
- **Test Suite:** [`server/test/latePickup.test.js`](./server/test/latePickup.test.js)
- **Code Examples:** See documentation file for frontend integration

## 🎨 UI/UX Recommendations

### Extension Request UI
```
┌─────────────────────────────────────┐
│  Running Late?                      │
│                                     │
│  If you'll be late more than 45    │
│  minutes, request an extension.    │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Enter minutes: [____50____]   │ │
│  └───────────────────────────────┘ │
│                                     │
│  [Request Extension]                │
│                                     │
│  ℹ️ Default window: 30 minutes     │
│  ℹ️ Grace period: 5 minutes        │
└─────────────────────────────────────┘
```

### Status Display
```
┌─────────────────────────────────────┐
│  Pickup Status                      │
│                                     │
│  ⏳ Waiting for pickup              │
│                                     │
│  Time Remaining: 30 minutes         │
│                                     │
│  ✅ Extension granted: 50 minutes   │
│                                     │
│  Pick up by: 3:55 PM                │
│                                     │
│  [Confirm Pickup]                   │
└─────────────────────────────────────┘
```

## 🤝 Contributing

To add features or fix bugs:
1. Update model schema if needed
2. Add controller methods
3. Create/update routes
4. Add validation in middleware
5. Update documentation
6. Add test cases
7. Test thoroughly

## 📝 License

This feature is part of the Vehicle Rental Services application.

## 💬 Support

For issues or questions:
- Check `LATE_PICKUP_API_DOCUMENTATION.md`
- Review server logs
- Run test suite
- Contact development team

---

**Version:** 1.0.0  
**Last Updated:** February 13, 2026  
**Author:** Vehicle Rental Services Development Team

---

## Quick Start Checklist

- ✅ Install dependencies (already done)
- ✅ MongoDB running
- ✅ Server started
- ✅ Create paid booking
- ✅ Test extension request
- ✅ Monitor cron job
- ✅ Verify auto-cancellation

**Ready to use! 🚀**
