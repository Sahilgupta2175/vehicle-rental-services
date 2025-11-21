const { sendSMS } = require('../services/sms.service');

exports.sendSMSController = async (req, res, next) => {
    try {
        const { to, message } = req.body;

        if (!to || !message) {
            return res.status(400).json({ error: 'Both "to" and "message" are required' });
        }

        const result = await sendSMS({ to, body: message });

        // If Twilio not configured, sendSMS returns null (per your service)
        if (!result) {
            return res.status(500).json({
                error: 'Twilio is not configured. Check TWILIO_* env vars on the server.'
            });
        }

        return res.json({
            success: true,
            sid: result.sid,
            to: result.to,
            status: result.status
        });
    } catch (err) {
        next(err);
    }
};
