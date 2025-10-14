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

app.post('/api/bookings', (req, res) => {
  const { name, email, checkin, checkout } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'name and email required' });
  try {
    saveBooking({ name, email, checkin, checkout });
    return res.json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed to save booking' });
  }
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
