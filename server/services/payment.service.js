const Stripe = require('stripe');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const stripe = process.env.STRIPE_SECRET ? Stripe(process.env.STRIPE_SECRET) : null;
const razorpay = process.env.RAZORPAY_KEY
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY, key_secret: process.env.RAZORPAY_SECRET })
  : null;

async function createStripePaymentIntent({ amount, currency = 'inr', metadata = {} }) {
    if (!stripe) {
        throw new Error('Stripe not configured');
    }
    
    return stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        metadata
    });
}

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

module.exports = { createStripePaymentIntent, createRazorpayOrder, verifyRazorpaySignature, stripe, razorpay };
