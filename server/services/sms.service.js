const Twilio = require('twilio');

let client = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

async function sendSMS({ to, body }) {
    if (!client) {
        console.warn('Twilio not configured; skipping SMS to', to);
        return null;
    }
    return client.messages.create({ body, from: process.env.TWILIO_FROM_NUMBER, to });
}

module.exports = { sendSMS };
