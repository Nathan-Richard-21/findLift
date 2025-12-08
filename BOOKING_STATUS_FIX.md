# Fix: Paid Bookings Showing as "Requested" Instead of "Confirmed"

## 🔴 Current Problem

Bookings that have been paid are showing with status "requested" instead of "confirmed". This is confusing for users who have already paid.

## ✅ Expected Behavior

When a user completes payment:
1. The booking `status` should be updated to **"confirmed"**
2. The booking `payment_status` should be updated to **"paid"**
3. The frontend should display the booking as "Confirmed" with a green badge

## 🔧 Backend Fix Required

### Location: Backend Payment Controller

When the payment webhook or payment verification confirms a successful payment, the backend needs to update the booking:

```javascript
// In your payment webhook or payment status verification endpoint
// After confirming payment is successful:

async function handleSuccessfulPayment(paymentId, bookingId) {
  try {
    // 1. Update the payment record
    await Payment.findOneAndUpdate(
      { payment_id: paymentId },
      { 
        status: 'paid',
        payment_date: new Date()
      }
    );

    // 2. CRITICAL: Update the booking status to CONFIRMED
    await Booking.findByIdAndUpdate(
      bookingId,
      { 
        status: 'confirmed',          // Change from 'requested' to 'confirmed'
        payment_status: 'paid',       // Mark payment as complete
        confirmed_at: new Date()      // Track when it was confirmed
      }
    );

    console.log(`✅ Booking ${bookingId} confirmed after payment`);
    
    // 3. Optionally notify the driver
    // sendNotificationToDriver(booking.driver_id, booking._id);
    
  } catch (error) {
    console.error('Failed to update booking after payment:', error);
  }
}
```

### Current Flow (❌ Wrong):
```
1. User creates booking → status: "requested", payment_status: "pending"
2. User pays → payment record created → status: "paid"
3. Booking status STAYS as "requested" ❌ (This is the bug!)
```

### Fixed Flow (✅ Correct):
```
1. User creates booking → status: "requested", payment_status: "pending"
2. User pays → payment record created → status: "paid"
3. Booking updated → status: "confirmed", payment_status: "paid" ✅
```

## 📝 Backend Endpoints to Check

### 1. Payment Webhook Endpoint
```javascript
// POST /api/payments/webhook (Yoco webhook)
app.post('/api/payments/webhook', async (req, res) => {
  const { type, payload } = req.body;
  
  if (type === 'payment.succeeded') {
    const paymentId = payload.id;
    
    // Find the payment record
    const payment = await Payment.findOne({ payment_id: paymentId });
    
    if (payment) {
      // Update payment status
      payment.status = 'paid';
      await payment.save();
      
      // ⚠️ ADD THIS: Update booking to CONFIRMED
      await Booking.findByIdAndUpdate(payment.booking_id, {
        status: 'confirmed',
        payment_status: 'paid',
        confirmed_at: new Date()
      });
    }
  }
  
  res.status(200).json({ received: true });
});
```

### 2. Payment Status Check Endpoint
```javascript
// GET /api/payments/:paymentId/status
app.get('/api/payments/:paymentId/status', async (req, res) => {
  const { paymentId } = req.params;
  
  const payment = await Payment.findOne({ payment_id: paymentId })
    .populate('booking_id');
  
  if (payment && payment.status === 'paid') {
    // ⚠️ ADD THIS: Ensure booking is confirmed
    await Booking.findByIdAndUpdate(payment.booking_id, {
      status: 'confirmed',
      payment_status: 'paid'
    });
  }
  
  res.json({ success: true, data: payment });
});
```

## 🔍 How to Verify the Fix

### Backend Logs
After payment succeeds, you should see:
```
✅ Payment paid successfully: payment_id_123
✅ Booking booking_id_456 status updated to: confirmed
✅ Booking payment_status updated to: paid
```

### Database Check
```javascript
// In MongoDB/Database
{
  _id: "booking_id_456",
  status: "confirmed",        // Should be "confirmed" not "requested"
  payment_status: "paid",     // Should be "paid"
  confirmed_at: "2025-12-09T..." // New timestamp
}
```

### Frontend Display
After the fix:
- Paid bookings will show with **green "Confirmed" badge**
- They will appear in the **"Confirmed" tab** not "Pending" tab
- Users will see "Payment Complete" message

## 🚨 Also Fix: Existing Paid Bookings

You may have bookings that are already paid but still marked as "requested". Run this one-time script:

```javascript
// One-time migration script to fix existing bookings
async function fixExistingPaidBookings() {
  // Find all paid payments
  const paidPayments = await Payment.find({ status: 'paid' });
  
  console.log(`Found ${paidPayments.length} paid payments`);
  
  for (const payment of paidPayments) {
    // Update the associated booking to confirmed
    await Booking.findByIdAndUpdate(payment.booking_id, {
      status: 'confirmed',
      payment_status: 'paid',
      confirmed_at: payment.payment_date || new Date()
    });
    
    console.log(`✅ Fixed booking ${payment.booking_id}`);
  }
  
  console.log('✅ All existing paid bookings updated to confirmed');
}

// Run once:
// fixExistingPaidBookings();
```

## 📋 Summary

### Backend Changes Needed:

1. ✅ Update payment webhook to set booking status to "confirmed"
2. ✅ Update payment status endpoint to set booking status to "confirmed"
3. ✅ Run migration script to fix existing paid bookings
4. ✅ Test with a new booking + payment flow

### No Frontend Changes Needed:

The frontend is already correctly:
- Checking for `payment_status === 'paid'`
- Filtering bookings by status
- Showing appropriate UI for confirmed vs requested bookings

The issue is **100% on the backend** - bookings aren't being updated to "confirmed" status after successful payment.

## 🎯 Critical Code to Add

In your backend, wherever you handle successful payments, add:

```javascript
// CRITICAL: Update booking to confirmed after payment
await Booking.findByIdAndUpdate(bookingId, {
  status: 'confirmed',
  payment_status: 'paid'
});
```

This single change will fix the issue!
