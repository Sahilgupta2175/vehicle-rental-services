# Late Pickup Handling System - API Documentation

## Overview
The Late Pickup Handling System manages scenarios where users are late to pick up rented vehicles with a dynamic waiting window mechanism.

## Key Features
- ✅ Default 30-minute waiting window
- ✅ User-requested late extensions (only if >45 minutes late expected)
- ✅ Dynamic waiting window calculation
- ✅ 5-minute grace period after extended window
- ✅ Automatic booking cancellation
- ✅ Vehicle auto-relisting
- ✅ Duplicate extension prevention
- ✅ Comprehensive validation and edge case handling

---

## System Flow

### 1. **Default Behavior**
When a booking is created with status `paid`:
- Default waiting window: **30 minutes** from booking start time
- User should pick up vehicle within this time
- No action needed if picked up on time

### 2. **Late Extension Request Flow**
If user expects to be late **more than 45 minutes**:

1. User submits late time via message box
2. System validates input
3. Calculates final waiting window
4. Adds 5-minute grace period
5. Schedules auto-cancellation
6. Sends notifications

**Formula:**
```
Additional Time = User Declared Time - Default Window (30 min)
Final Waiting Window = User Declared Time
Total Time Before Cancel = Final Waiting Window + 5 min (grace period)
```

**Example:**
```
Default Window = 30 minutes
User Declared Late Time = 50 minutes
Additional Time = 50 - 30 = 20 minutes
Final Waiting Window = 50 minutes
Auto-cancel at = Booking Start + 55 minutes (50 + 5 grace)
```

### 3. **Auto-Cancellation Flow**
If user doesn't pick up within the window:
- Cron job checks every 2 minutes
- Auto-cancels booking
- Changes vehicle status to "Available"
- Processes refund (if applicable)
- Sends notifications to user and vendor
- Relists vehicle

---

## API Endpoints

### 1. Request Late Pickup Extension

**Endpoint:** `POST /api/bookings/late-pickup/request-extension`

**Authentication:** Required (JWT Token)

**Authorization:** User role only

**Request Body:**
```json
{
  "bookingId": "507f1f77bcf86cd799439011",
  "declaredLateTime": 50
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| bookingId | String | Yes | MongoDB ObjectId of the booking |
| declaredLateTime | Number | Yes | Expected total late time in minutes (must be > 30) |

**Success Response (200):**
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

**Error Responses:**

**400 - Invalid Input:**
```json
{
  "success": false,
  "message": "Declared late time must be a valid number (in minutes)",
  "errorCode": "INVALID_NUMBER_FORMAT",
  "example": "Please enter a number like 45, 50, 60, etc."
}
```

**400 - Below Minimum:**
```json
{
  "success": false,
  "message": "Extension is not needed for delays under 30 minutes. The default waiting window covers you.",
  "errorCode": "BELOW_MINIMUM_THRESHOLD",
  "info": {
    "declaredTime": 25,
    "defaultWindow": 30,
    "suggestion": "No extension required - you are covered by the default 30-minute waiting window"
  }
}
```

**400 - Duplicate Extension:**
```json
{
  "success": false,
  "message": "You have already requested an extension for this booking. Only one extension is allowed.",
  "errorCode": "DUPLICATE_EXTENSION_REQUEST",
  "info": {
    "extensionRequestedAt": "2026-02-13T14:30:00.000Z",
    "declaredLateTime": 60,
    "finalWaitingWindow": 60
  }
}
```

**400 - Already Picked Up:**
```json
{
  "success": false,
  "message": "Vehicle has already been picked up",
  "errorCode": "ALREADY_PICKED_UP",
  "info": {
    "pickedUpAt": "2026-02-13T14:45:00.000Z"
  }
}
```

**400 - Window Expired:**
```json
{
  "success": false,
  "message": "The waiting window has already expired. This booking may have been auto-cancelled.",
  "errorCode": "WINDOW_EXPIRED",
  "info": {
    "bookingStartTime": "2026-02-13T14:00:00.000Z",
    "deadline": "2026-02-13T14:35:00.000Z",
    "currentTime": "2026-02-13T14:40:00.000Z",
    "minutesOverdue": 5
  }
}
```

---

### 2. Confirm Vehicle Pickup

**Endpoint:** `POST /api/bookings/late-pickup/confirm-pickup`

**Authentication:** Required (JWT Token)

**Authorization:** User role only

**Request Body:**
```json
{
  "bookingId": "507f1f77bcf86cd799439011"
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| bookingId | String | Yes | MongoDB ObjectId of the booking |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Vehicle pickup confirmed successfully",
  "data": {
    "pickedUpAt": "2026-02-13T14:25:00.000Z",
    "rentalEndTime": "2026-02-13T18:00:00.000Z"
  }
}
```

**Error Responses:**

**400 - Already Picked Up:**
```json
{
  "success": false,
  "message": "Vehicle has already been picked up",
  "errorCode": "ALREADY_PICKED_UP",
  "info": {
    "pickedUpAt": "2026-02-13T14:25:00.000Z"
  }
}
```

**400 - Invalid Status:**
```json
{
  "success": false,
  "message": "This operation can only be performed on paid bookings. Current status: approved",
  "errorCode": "INVALID_BOOKING_STATUS",
  "currentStatus": "approved"
}
```

---

### 3. Get Late Pickup Status

**Endpoint:** `GET /api/bookings/late-pickup/status/:bookingId`

**Authentication:** Required (JWT Token)

**Authorization:** User role only

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| bookingId | String | Yes | MongoDB ObjectId of the booking |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "bookingId": "507f1f77bcf86cd799439011",
    "vehicleName": "Honda Activa",
    "bookingStartTime": "2026-02-13T14:00:00.000Z",
    "pickedUp": false,
    "pickedUpAt": null,
    "extensionRequested": true,
    "extensionRequestedAt": "2026-02-13T14:10:00.000Z",
    "declaredLateTime": 50,
    "defaultWaitingWindow": 30,
    "finalWaitingWindow": 50,
    "graceperiod": 5,
    "pickupDeadline": "2026-02-13T14:55:00.000Z",
    "timeRemainingMinutes": 30,
    "canRequestExtension": false,
    "isExpired": false
  }
}
```

**Field Descriptions:**
| Field | Description |
|-------|-------------|
| pickedUp | Whether vehicle has been picked up |
| extensionRequested | Whether user has requested extension |
| declaredLateTime | User's declared late time in minutes |
| defaultWaitingWindow | Default 30-minute window |
| finalWaitingWindow | Calculated final window (includes extension) |
| graceperiod | 5-minute grace period after final window |
| pickupDeadline | Absolute time by which pickup must occur |
| timeRemainingMinutes | Minutes remaining until auto-cancel |
| canRequestExtension | Whether user can still request extension |
| isExpired | Whether booking has expired |

---

## Database Schema Changes

### Booking Model Updates

New `pickup` object added to Booking schema:

```javascript
pickup: {
  defaultWaitingWindow: { 
    type: Number, 
    default: 30 
  },
  userDeclaredLateTime: { 
    type: Number, 
    default: null 
  },
  extensionRequested: { 
    type: Boolean, 
    default: false 
  },
  extensionRequestedAt: { 
    type: Date, 
    default: null 
  },
  finalWaitingWindow: { 
    type: Number, 
    default: null 
  },
  pickedUp: { 
    type: Boolean, 
    default: false 
  },
  pickedUpAt: { 
    type: Date, 
    default: null 
  },
  autoCancel: {
    scheduled: { 
      type: Boolean, 
      default: false 
    },
    scheduledAt: { 
      type: Date, 
      default: null 
    }
  }
}
```

---

## Validation Rules

### Late Time Extension Request

| Validation | Rule | Error Code |
|------------|------|------------|
| Required | declaredLateTime must be provided | MISSING_LATE_TIME |
| Type | Must be a valid number | INVALID_NUMBER_FORMAT |
| Range | Must be > 30 minutes | BELOW_MINIMUM_THRESHOLD |
| Range | Must be ≤ 240 minutes (4 hours) | EXCEEDS_MAXIMUM_THRESHOLD |
| Status | Booking must be paid | INVALID_BOOKING_STATUS |
| Ownership | User must own the booking | UNAUTHORIZED_ACCESS |
| Pickup | Vehicle must not be picked up | ALREADY_PICKED_UP |
| Extension | Only one extension allowed | DUPLICATE_EXTENSION_REQUEST |
| Time | Must be within valid time window | WINDOW_EXPIRED |

---

## Cron Job Configuration

### Late Pickup Auto-Cancellation Job

**Schedule:** Every 2 minutes (`*/2 * * * *`)

**Function:** `handleLatePickupCancellation()`

**Actions:**
1. Find paid bookings with scheduled auto-cancel that has passed
2. Update booking status to 'cancelled'
3. Make vehicle available
4. Process refund (if applicable)
5. Send email notifications (user & vendor)
6. Send SMS notification (user)
7. Emit socket events

**Database Query:**
```javascript
{
  status: 'paid',
  'pickup.pickedUp': false,
  'pickup.autoCancel.scheduled': true,
  'pickup.autoCancel.scheduledAt': { $lte: now }
}
```

---

## Edge Cases Handled

### 1. Invalid Input
- ✅ Non-numeric input (strings, special characters)
- ✅ Negative numbers
- ✅ Decimal numbers (converted to integers)
- ✅ Empty/null values

### 2. Time-Related
- ✅ Declared time ≤ 30 minutes (not needed)
- ✅ Declared time > 240 minutes (too long)
- ✅ Request after window expired
- ✅ Request too close to deadline (<5 min remaining)

### 3. Status-Related
- ✅ Booking not paid
- ✅ Booking cancelled/completed
- ✅ Vehicle already picked up

### 4. Authorization
- ✅ User doesn't own booking
- ✅ Unauthenticated requests
- ✅ Wrong role access

### 5. Business Logic
- ✅ Multiple extension attempts (only 1 allowed)
- ✅ Extension after pickup confirmed
- ✅ Pickup after auto-cancel

---

## Notification System

### Email Notifications

**1. Extension Approved (to User)**
- Confirmation of extension
- New deadline information
- Grace period details
- Consequences of missing deadline

**2. Extension Notice (to Vendor)**
- Customer late extension request
- New pickup deadline
- Auto-cancel information

**3. Auto-Cancel (to User)**
- Cancellation confirmation
- Refund information
- Rebooking options

**4. Auto-Cancel (to Vendor)**
- Booking cancelled notification
- Vehicle availability status
- Refund processing status

**5. Pickup Confirmed (to User)**
- Pickup confirmation
- Rental end time reminder
- Safety instructions

### SMS Notifications

**1. Extension Approved:**
```
Late pickup extension approved! Please pick up {vehicle} within {time} minutes from booking start time (by {deadline}). Auto-cancel after that.
```

**2. Auto-Cancelled:**
```
Your booking for {vehicle} has been auto-cancelled due to late pickup. Refund will be processed within 3-5 working days. Booking ID: {id}
```

**3. Pickup Confirmed:**
```
Vehicle pickup confirmed for {vehicle}! Return by {time}. Enjoy your ride!
```

### Socket Events

**1. Extension Approved:**
- Event: `pickup:extension-approved`
- Target: User
- Data: bookingId, finalWaitingWindow, autoCancelTime

**2. Extension Requested:**
- Event: `pickup:extension-requested`
- Target: Vendor
- Data: bookingId, customerName, lateTimeMinutes, autoCancelTime

**3. Pickup Confirmed:**
- Event: `pickup:confirmed`
- Target: User
- Data: bookingId, pickedUpAt

**4. Auto-Cancelled:**
- Event: `booking:auto-cancelled`
- Target: User & Vendor
- Data: bookingId, reason, message

---

## Testing Scenarios

### Scenario 1: Normal Extension Request
```
1. User creates booking (start: 14:00)
2. User requests extension at 14:05 with 50 minutes
3. System approves: finalWindow = 50 min, deadline = 14:55
4. User picks up at 14:40
5. Result: Success ✅
```

### Scenario 2: Below Minimum Threshold
```
1. User creates booking (start: 14:00)
2. User requests extension with 25 minutes
3. System rejects: "Under 30 min covered by default"
4. Result: Error ❌ (BELOW_MINIMUM_THRESHOLD)
```

### Scenario 3: Duplicate Extension
```
1. User creates booking (start: 14:00)
2. User requests extension with 50 minutes (approved)
3. User requests another extension with 60 minutes
4. System rejects: "Only one extension allowed"
5. Result: Error ❌ (DUPLICATE_EXTENSION_REQUEST)
```

### Scenario 4: Auto-Cancellation
```
1. User creates booking (start: 14:00)
2. User requests extension with 50 minutes
3. User doesn't pick up vehicle
4. Cron job runs at 14:56 (50 + 5 + 1 min)
5. System auto-cancels booking
6. Vehicle marked available, refund processed
7. Result: Auto-cancelled ✅
```

### Scenario 5: Invalid Input
```
1. User creates booking
2. User submits "abc" as declaredLateTime
3. System rejects: "Must be valid number"
4. Result: Error ❌ (INVALID_NUMBER_FORMAT)
```

---

## Frontend Integration Guide

### 1. Late Pickup Extension UI

**Message Box Component:**
```jsx
<div className="late-pickup-extension">
  <h3>Running Late?</h3>
  <p>If you expect to be late more than 45 minutes, request an extension.</p>
  
  <input 
    type="number" 
    placeholder="Enter total late time (in minutes)"
    min="31"
    max="240"
    value={lateTime}
    onChange={(e) => setLateTime(e.target.value)}
  />
  
  <button onClick={requestExtension}>
    Request Extension
  </button>
  
  <p className="info">
    Default waiting window: 30 minutes<br/>
    Grace period: 5 minutes after your declared time
  </p>
</div>
```

**API Call:**
```javascript
const requestExtension = async () => {
  try {
    const response = await axios.post('/api/bookings/late-pickup/request-extension', {
      bookingId: booking._id,
      declaredLateTime: parseInt(lateTime)
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      alert(`Extension approved! Pick up by ${response.data.data.autoCancelTime}`);
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Extension request failed';
    alert(errorMsg);
  }
};
```

### 2. Pickup Confirmation UI

**Button Component:**
```jsx
<button 
  onClick={confirmPickup}
  className="confirm-pickup-btn"
>
  Confirm Pickup
</button>
```

**API Call:**
```javascript
const confirmPickup = async () => {
  try {
    const response = await axios.post('/api/bookings/late-pickup/confirm-pickup', {
      bookingId: booking._id
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      alert('Pickup confirmed! Enjoy your ride.');
      // Update UI to show pickup confirmed
    }
  } catch (error) {
    alert(error.response?.data?.message || 'Confirmation failed');
  }
};
```

### 3. Status Display UI

**Status Component:**
```jsx
<div className="pickup-status">
  <h3>Pickup Status</h3>
  
  {status.pickedUp ? (
    <div className="status-success">
      ✅ Vehicle picked up at {status.pickedUpAt}
    </div>
  ) : (
    <>
      <div className="status-pending">
        ⏳ Waiting for pickup
      </div>
      
      <div className="countdown">
        Time Remaining: {status.timeRemainingMinutes} minutes
      </div>
      
      {status.extensionRequested && (
        <div className="extension-info">
          Extension granted: {status.declaredLateTime} minutes
        </div>
      )}
      
      {status.canRequestExtension && (
        <button onClick={() => showExtensionModal()}>
          Request Extension
        </button>
      )}
    </>
  )}
</div>
```

**API Call:**
```javascript
const fetchStatus = async () => {
  try {
    const response = await axios.get(
      `/api/bookings/late-pickup/status/${bookingId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    setStatus(response.data.data);
  } catch (error) {
    console.error('Failed to fetch status:', error);
  }
};
```

---

## Security Considerations

1. **Authentication:** All endpoints require JWT token
2. **Authorization:** Only booking owner can access/modify
3. **Input Validation:** All inputs sanitized and validated
4. **Rate Limiting:** Prevent abuse of extension requests
5. **Audit Trail:** All actions logged with timestamps
6. **Data Integrity:** Atomic operations for status updates

---

## Performance Optimization

1. **Indexed Queries:** Database indexes on booking status and pickup fields
2. **Cron Efficiency:** 2-minute interval balances responsiveness vs load
3. **Batch Processing:** Auto-cancel processes multiple bookings efficiently
4. **Socket Events:** Real-time updates without polling
5. **Email Queue:** Async email sending doesn't block API responses

---

## Troubleshooting

### Issue: Extension request returns "Window Expired"
**Solution:** Check if current time exceeds booking start + window. This is expected behavior.

### Issue: Cannot request extension even though window hasn't expired
**Solution:** Verify:
- Booking status is 'paid'
- Vehicle not already picked up
- No previous extension requested
- More than 5 minutes remaining

### Issue: Auto-cancellation not happening
**Solution:** Check:
- Cron job is running (`*/2 * * * *`)
- autoCancel.scheduled = true
- autoCancel.scheduledAt is correct
- Server logs for errors

### Issue: Refund not processing
**Solution:** Verify:
- Payment service is configured correctly
- Original transaction exists
- Provider credentials are valid
- Check transaction logs

---

## Support

For issues or questions:
- Check server logs: `/logs`
- Review error codes in responses
- Contact development team with booking ID and error details

---

**Last Updated:** February 13, 2026  
**Version:** 1.0.0  
**Author:** Vehicle Rental Services Development Team
