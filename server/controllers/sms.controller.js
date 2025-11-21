const { sendSMS } = require('../services/sms.service');

exports.sendSMSController = async (req, res, next) => {
    try {
        const { to, body } = req.body;

        if (!to || !body) {
            return res.status(400).json({ error: 'Both "to" and "body" are required' });
        }

        const result = await sendSMS({ to, body });

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