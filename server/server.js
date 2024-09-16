const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const NodeCache = require('node-cache');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

// Initialize cache with a TTL of 10 minutes and a check period of 5 minutes
const cache = new NodeCache({ stdTTL: 60 * 10, checkperiod: 60 * 5 });

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Define Capture Schema
const captureSchema = new mongoose.Schema({
  imageUrl: String,
  center: {
    lat: Number,
    lng: Number
  },
  createdAt: { type: Date, default: Date.now },
});

// Capture Model
const Capture = mongoose.model('Capture', captureSchema);

// Endpoint to save new captures
app.post('/api/captures', async (req, res) => {
  const { imageUrl, center } = req.body;
  
  try {
    const newCapture = new Capture({ imageUrl, center });
    await newCapture.save();

    // Clear cache when new data is added to ensure cache consistency
    cache.del('topCaptures');

    res.status(201).json(newCapture);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to save the capture.' });
  }
});

// Endpoint to get all captures
app.get('/api/captures', async (req, res) => {
  try {
    const captures = await Capture.find();
    res.json(captures);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch captures.' });
  }
});

// Endpoint to get top three most frequently captured regions
app.get('/api/top-captures', async (req, res) => {
  try {
    // Check cache for top captures
    const cachedData = cache.get('topCaptures');
    if (cachedData) {
      console.log('Returning cached top captures');
      return res.json(cachedData);
    }

    // Aggregate top three regions by counting occurrences of lat and lng
    const topCaptures = await Capture.aggregate([
      { 
        $group: {
          _id: { lat: "$center.lat", lng: "$center.lng" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    // Cache the result
    cache.set('topCaptures', topCaptures);

    res.json(topCaptures);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch top captures.' });
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
