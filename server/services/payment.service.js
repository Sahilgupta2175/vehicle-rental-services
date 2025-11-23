const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = process.env.RAZORPAY_KEY
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY, key_secret: process.env.RAZORPAY_SECRET })
  : null;

async function createRazorpayOrder({ amount, currency = 'INR', receipt = '', notes = {} }) {
    if (!razorpay) {
        throw new Error('Razorpay not configured');
    }

    const options = { 
        amount: Math.round(amount * 100), 
        currency, 
        receipt, 
        notes 
    };

    return razorpay.orders.create(options);
}

function verifyRazorpaySignature(body, signature) {
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET).update(JSON.stringify(body)).digest('hex');
    return expected === signature;
}

module.exports = { createRazorpayOrder, verifyRazorpaySignature, razorpay };
