const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files (optional when using http-server for frontend)
app.use(express.static(path.join(__dirname)));

const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');

// Twilio client (optional)
let twilioClient = null;
const TW_ACCOUNT = process.env.TWILIO_ACCOUNT_SID;
const TW_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TW_FROM = process.env.TWILIO_FROM; // e.g. +1234567890
if (TW_ACCOUNT && TW_TOKEN) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(TW_ACCOUNT, TW_TOKEN);
    console.log('Twilio configured');
  } catch (e) {
    console.warn('Twilio module not available:', e.message);
  }
}

function saveBooking(booking) {
  let bookings = [];
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      bookings = JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8')) || [];
    }
  } catch (e) {
    console.error('Failed to read bookings file', e);
  }
  bookings.push({ ...booking, receivedAt: new Date().toISOString() });
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

app.post('/api/bookings', async (req, res) => {
  const { name, email, checkin, checkout, phone } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'name and email required' });
  try {
    const booking = { name, email, checkin, checkout, phone };
    saveBooking(booking);

    // send SMS if Twilio configured and phone provided
    if (twilioClient && phone && TW_FROM) {
      try {
        await twilioClient.messages.create({
          body: `Thank you ${name}. Your booking request for ${checkin || 'N/A'} to ${checkout || 'N/A'} has been received.`,
          from: TW_FROM,
          to: phone
        });
        console.log('SMS sent to', phone);
      } catch (smsErr) {
        console.error('Failed to send SMS:', smsErr.message);
      }
    }

    return res.json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed to save booking' });
  }
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
