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

async function processRefund({ paymentId, amount, provider }) {
    try {
        if (provider === 'razorpay') {
            if (!razorpay) {
                throw new Error('Razorpay not configured');
            }
            // Create refund in Razorpay
            const refund = await razorpay.payments.refund(paymentId, {
                amount: Math.round(amount * 100), // Convert to paise
                speed: 'normal' // Can be 'normal' or 'optimum'
            });
            return { success: true, refundId: refund.id, refund };
        } else {
            // For cash or other providers, manual refund
            return { success: true, refundId: 'manual_' + Date.now(), manual: true };
        }
    } catch (error) {
        console.error('[Payment Service] Refund error:', error);
        return { success: false, error: error.message };
    }
}

module.exports = { createRazorpayOrder, verifyRazorpaySignature, razorpay, processRefund };
